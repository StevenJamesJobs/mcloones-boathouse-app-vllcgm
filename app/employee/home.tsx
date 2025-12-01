
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useMessages } from '@/hooks/useMessages';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function EmployeeHomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const { announcements } = useAnnouncements('employees');
  const { unreadCount, refreshInbox } = useMessages();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    } else if (!isLoading && user && user.role !== 'employee') {
      // If user is a manager, redirect to manager portal
      if (user.role === 'manager' || user.role === 'owner_manager') {
        router.replace('/manager/home');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  // Refresh unread count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        refreshInbox();
      }
    }, [user?.id, refreshInbox])
  );

  const handleLogout = async () => {
    try {
      await logout();
      // Force navigation to login page
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

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

  if (!user) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Employee Portal',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
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
            iconColor={colors.employeeAccent}
            defaultExpanded={true}
            variant="employee"
          >
            <WeatherDisplay variant="employee" />
          </CollapsibleSection>

          {/* Announcements - Collapsible */}
          <CollapsibleSection
            title="Announcements"
            icon="campaign"
            iconColor={colors.employeeAccent}
            defaultExpanded={true}
            variant="employee"
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

          {/* Profile Section Header */}
          <Text style={styles.profileHeader}>{user?.full_name}&apos;s Profile</Text>

          {/* Messages - Elongated Tile with Badge */}
          <Pressable
            style={styles.messagesButton}
            onPress={() => router.push('/employee/inbox' as any)}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="inbox" size={32} color="#3289a8" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.messagesButtonText}>Messages</Text>
          </Pressable>

          {/* My Profile Info - Elongated */}
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/employee/profile')}
          >
            <MaterialIcons name="person" size={32} color="#3289a8" />
            <Text style={styles.profileButtonText}>My Profile Info</Text>
          </Pressable>

          {/* Tools Section Header */}
          <Text style={styles.toolsHeader}>{user?.full_name}&apos;s Tools</Text>

          {/* Quick Links - 3 smaller tiles */}
          <View style={styles.quickLinksGrid}>
            <Pressable
              style={styles.quickLinkButton}
              onPress={() => router.push('/employee/training')}
            >
              <MaterialIcons name="menu-book" size={36} color="#3289a8" />
              <Text style={styles.quickLinkText}>Guides & Training</Text>
            </Pressable>
            <Pressable
              style={styles.quickLinkButton}
              onPress={() => router.push('/employee/rewards')}
            >
              <MaterialIcons name="stars" size={36} color="#3289a8" />
              <Text style={styles.quickLinkText}>Rewards</Text>
            </Pressable>
            <Pressable
              style={styles.quickLinkButton}
              onPress={() => router.push('/employee/checkouts')}
            >
              <MaterialIcons name="calculate" size={36} color="#3289a8" />
              <Text style={styles.quickLinkText}>Check Outs</Text>
            </Pressable>
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
    backgroundColor: colors.employeeAccent,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: colors.employeePrimary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  welcomeJobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.employeeAccent,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
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
  profileHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  messagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
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
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    gap: 12,
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  toolsHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickLinkButton: {
    width: '31.5%',
    aspectRatio: 1,
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    gap: 8,
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
