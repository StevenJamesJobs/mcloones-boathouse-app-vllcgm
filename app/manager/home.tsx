
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useMessages } from '@/hooks/useMessages';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabType = 'customer' | 'employee';

export default function ManagerHomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const { announcements } = useAnnouncements('managers');
  const { unreadCount } = useMessages();
  const [activeTab, setActiveTab] = useState<TabType>('customer');

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'manager' && user.role !== 'owner_manager'))) {
      router.replace('/(tabs)/(home)/');
    }
  }, [user, isLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      // Force navigation to home page
      setTimeout(() => {
        router.replace('/(tabs)/(home)/');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const customerTools = [
    { id: 1, title: 'Menu Editor', icon: 'restaurant', route: '/manager/menu-editor', color: colors.managerAccent },
    { id: 2, title: 'Weekly Specials Editor', icon: 'star', route: '/manager/weekly-specials-editor', color: colors.managerAccent },
    { id: 3, title: 'Events Editor', icon: 'event', route: '/manager/events-editor', color: colors.managerAccent },
    { id: 9, title: 'Special Features', icon: 'auto-awesome', route: '/manager/special-features-editor', color: colors.managerAccent },
    { id: 4, title: 'Gallery Editor', icon: 'photo', route: '/manager/gallery-editor', color: colors.managerAccent },
    { id: 5, title: 'About Us Editor', icon: 'info', route: '/manager/about-us-editor', color: colors.managerAccent },
    { id: 7, title: 'Reviews Editor', icon: 'star', route: '/manager/reviews-editor', color: colors.managerAccent },
    { id: 8, title: 'Tagline Editor', icon: 'edit', route: '/manager/tagline-editor', color: colors.managerAccent },
  ];

  const employeeTools = [
    { id: 2, title: 'Employees', icon: 'people', route: '/manager/employees', color: colors.managerSecondary },
    { id: 3, title: 'Announcements', icon: 'campaign', route: '/manager/announcements-editor', color: colors.managerSecondary },
    { id: 4, title: 'Rewards', icon: 'attach-money', route: '/manager/rewards', color: colors.managerSecondary },
    { id: 5, title: 'Schedules', icon: 'schedule', route: '/manager/schedule', color: colors.managerSecondary },
    { id: 6, title: 'Check Outs', icon: 'calculate', route: '/employee/checkouts', color: colors.managerSecondary },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const currentTools = activeTab === 'customer' ? customerTools : employeeTools;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manager Portal',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          ),
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome, {user?.full_name}!</Text>
            <Text style={styles.welcomeJobTitle}>{user?.job_title}</Text>
            <Text style={styles.welcomeSubtitle}>Here&apos;s what&apos;s going on today!</Text>
          </View>

          {/* Weather Card - Collapsible */}
          <CollapsibleSection
            title="Today's Weather"
            icon="wb-sunny"
            iconColor={colors.managerAccent}
            defaultExpanded={true}
            variant="manager"
          >
            <WeatherDisplay variant="manager" />
          </CollapsibleSection>

          {/* Announcements - Collapsible */}
          <CollapsibleSection
            title="Announcements"
            icon="campaign"
            iconColor={colors.managerAccent}
            defaultExpanded={true}
            variant="manager"
          >
            {announcements.length === 0 ? (
              <Text style={styles.noAnnouncementsText}>No announcements at this time</Text>
            ) : (
              announcements.map((announcement) => (
                <View key={announcement.id} style={styles.announcementItem}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(announcement.priority) },
                  ]}>
                    <Text style={styles.priorityText}>
                      {announcement.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementMessage}>{announcement.message}</Text>
                  <Text style={styles.announcementDate}>
                    {new Date(announcement.created_at || '').toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </CollapsibleSection>

          {/* Guides and Training */}
          <Pressable
            style={styles.guidesButton}
            onPress={() => router.push('/employee/training')}
          >
            <MaterialIcons name="menu-book" size={32} color={colors.managerAccent} />
            <Text style={styles.guidesButtonText}>Guides & Training</Text>
          </Pressable>

          {/* Messages - Elongated Tile with Badge */}
          <Pressable
            style={styles.messagesButton}
            onPress={() => router.push('/manager/inbox' as any)}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="inbox" size={32} color={colors.managerAccent} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.messagesButtonText}>Messages</Text>
          </Pressable>

          {/* My Profile - Elongated Tile */}
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/manager/profile')}
          >
            <MaterialIcons name="person" size={32} color={colors.managerAccent} />
            <Text style={styles.profileButtonText}>My Profile</Text>
          </Pressable>

          {/* Manager Tools */}
          <View style={styles.toolsSection}>
            <Text style={styles.sectionTitle}>Management Tools</Text>
            
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, activeTab === 'customer' && styles.tabActive]}
                onPress={() => setActiveTab('customer')}
              >
                <MaterialIcons 
                  name="storefront" 
                  size={20} 
                  color={activeTab === 'customer' ? '#FFFFFF' : colors.text} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'customer' && styles.tabTextActive
                ]}>
                  Customer Tools
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === 'employee' && styles.tabActive]}
                onPress={() => setActiveTab('employee')}
              >
                <MaterialIcons 
                  name="people" 
                  size={20} 
                  color={activeTab === 'employee' ? '#FFFFFF' : colors.text} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'employee' && styles.tabTextActive
                ]}>
                  Employee Tools
                </Text>
              </Pressable>
            </View>

            {/* Tools Grid */}
            <View style={styles.toolsGrid}>
              {currentTools.map((tool) => (
                <Pressable
                  key={tool.id}
                  style={[styles.toolCard, { backgroundColor: tool.color }]}
                  onPress={() => router.push(tool.route as any)}
                >
                  <MaterialIcons name={tool.icon as any} color="#FFFFFF" size={28} />
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  logoutButtonText: {
    color: colors.managerPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: colors.managerPrimary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  welcomeJobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  announcementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  announcementMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noAnnouncementsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  guidesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    gap: 12,
  },
  guidesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  messagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    gap: 12,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.employeeCard,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messagesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    gap: 12,
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  toolsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.managerAccent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolCard: {
    width: '48%',
    aspectRatio: 2,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
});
