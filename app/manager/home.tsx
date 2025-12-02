
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking, Image, Platform } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useMessages } from '@/hooks/useMessages';
import { useEvents } from '@/hooks/useEvents';
import { useSpecialFeatures } from '@/hooks/useSpecialFeatures';
import { useWeeklySpecials } from '@/hooks/useWeeklySpecials';
import { CompactWeatherDisplay } from '@/components/CompactWeatherDisplay';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { SwipeableImageModal } from '@/components/SwipeableImageModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabType = 'customer' | 'employee';

export default function ManagerHomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const { announcements } = useAnnouncements('managers');
  const { unreadCount, refreshInbox } = useMessages();
  const { events } = useEvents();
  const { features } = useSpecialFeatures();
  const { specials } = useWeeklySpecials();
  const [activeTab, setActiveTab] = useState<TabType>('customer');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const bannerHeight = insets.top + 60;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    } else if (!isLoading && user && user.role !== 'manager' && user.role !== 'owner_manager') {
      // If user is an employee, redirect to employee portal
      if (user.role === 'employee') {
        router.replace('/employee/home');
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

  const handleBackPress = () => {
    // Navigate back to login screen instead of splash
    router.replace('/login');
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

  const handleEventPress = (event: any) => {
    if (event.rsvp_link) {
      Linking.openURL(event.rsvp_link).catch((err) => {
        console.error('Failed to open RSVP link:', err);
        Alert.alert('Error', 'Could not open RSVP link');
      });
    }
  };

  const handleFeaturePress = (feature: any) => {
    if (feature.link_url) {
      Linking.openURL(feature.link_url).catch((err) => {
        console.error('Failed to open feature link:', err);
        Alert.alert('Error', 'Could not open link');
      });
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

  const currentTools = activeTab === 'customer' ? customerTools : employeeTools;

  // Get top 3 upcoming events
  const upcomingEvents = events
    .filter(event => new Date(event.event_date) >= new Date())
    .slice(0, 3);

  // Get top 5 special features
  const topFeatures = features.slice(0, 5);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        {/* Floating Header Banner */}
        <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
          <Image 
            source={require('@/assets/images/08405405-7ef4-4671-9758-a7220430497a.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={20} color={colors.managerPrimary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: bannerHeight + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome, {user?.full_name}!</Text>
            <Text style={styles.welcomeJobTitle}>{user?.job_title}</Text>

            {/* Messages Indicator - Always visible and clickable */}
            <Pressable
              style={styles.messagesIndicator}
              onPress={() => router.push('/manager/inbox' as any)}
            >
              <MaterialIcons 
                name="inbox" 
                size={20} 
                color={unreadCount > 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'} 
              />
              <View style={styles.messagesContent}>
                {unreadCount > 0 ? (
                  <>
                    <Text style={styles.messagesIndicatorText}>
                      {unreadCount} New Message{unreadCount !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.messagesSubtext}>Tap to view your inbox</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.noMessagesText}>Messages</Text>
                    <Text style={styles.messagesSubtext}>View your inbox</Text>
                  </>
                )}
              </View>
              <MaterialIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.7)" />
            </Pressable>
          </View>

          {/* Compact Weather - Collapsible */}
          <CollapsibleSection
            title="Today's Weather"
            icon="wb-sunny"
            iconColor={colors.managerAccent}
            defaultExpanded={true}
            variant="manager"
          >
            <CompactWeatherDisplay />
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

          {/* Upcoming Events - Collapsible */}
          <CollapsibleSection
            title="Upcoming Events"
            icon="event"
            iconColor={colors.managerAccent}
            defaultExpanded={true}
            variant="manager"
          >
            {upcomingEvents.length === 0 ? (
              <Text style={styles.noEventsText}>No upcoming events at this time</Text>
            ) : (
              <>
                {upcomingEvents.map((event) => (
                  <Pressable
                    key={event.id}
                    style={styles.eventItem}
                    onPress={() => handleEventPress(event)}
                  >
                    {event.image_url && (
                      <Pressable onPress={() => setExpandedImage(event.image_url)}>
                        <Image
                          source={{ uri: event.image_url }}
                          style={event.display_style === 'banner' ? styles.eventImageWide : styles.eventImageSquare}
                          resizeMode="cover"
                        />
                      </Pressable>
                    )}
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.rsvp_link && (
                        <MaterialIcons name="open-in-new" size={18} color={colors.managerAccent} />
                      )}
                    </View>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                    <View style={styles.eventDateRow}>
                      <MaterialIcons name="calendar-today" size={14} color={colors.textSecondary} />
                      <Text style={styles.eventDate}>
                        {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                      </Text>
                    </View>
                  </Pressable>
                ))}
                <Pressable
                  style={styles.viewAllButton}
                  onPress={() => router.push('/manager/full-events' as any)}
                >
                  <Text style={styles.viewAllText}>View All Events</Text>
                  <MaterialIcons name="arrow-forward" size={18} color={colors.managerAccent} />
                </Pressable>
              </>
            )}
          </CollapsibleSection>

          {/* Special Features Section - Now Collapsible */}
          {topFeatures.length > 0 && (
            <CollapsibleSection
              title="Special Features"
              icon="auto-awesome"
              iconColor={colors.managerAccent}
              defaultExpanded={true}
              variant="manager"
            >
              {topFeatures.map((feature) => (
                <Pressable
                  key={feature.id}
                  style={styles.featureItem}
                  onPress={() => handleFeaturePress(feature)}
                >
                  {feature.image_url && (
                    <Pressable onPress={() => setExpandedImage(feature.image_url)}>
                      <Image
                        source={{ uri: feature.image_url }}
                        style={feature.display_style === 'banner' ? styles.featureImageWide : styles.featureImageSquare}
                        resizeMode="cover"
                      />
                    </Pressable>
                  )}
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    {feature.link_url && (
                      <MaterialIcons name="open-in-new" size={18} color={colors.managerAccent} />
                    )}
                  </View>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                  {feature.start_date && feature.end_date && (
                    <Text style={styles.featureDates}>
                      {new Date(feature.start_date).toLocaleDateString()} - {new Date(feature.end_date).toLocaleDateString()}
                    </Text>
                  )}
                </Pressable>
              ))}
            </CollapsibleSection>
          )}

          {/* Weekly Specials Section - Now Collapsible */}
          {specials.length > 0 && (
            <CollapsibleSection
              title="Weekly Specials"
              icon="star"
              iconColor={colors.managerAccent}
              defaultExpanded={true}
              variant="manager"
            >
              {specials.map((special) => (
                <View key={special.id} style={styles.specialItem}>
                  {special.image_url && (
                    <Pressable onPress={() => setExpandedImage(special.image_url)}>
                      <Image
                        source={{ uri: special.image_url }}
                        style={special.display_style === 'banner' ? styles.specialImageWide : styles.specialImageSquare}
                        resizeMode="cover"
                      />
                    </Pressable>
                  )}
                  <View style={styles.specialHeader}>
                    <Text style={styles.specialTitle}>{special.title}</Text>
                    {special.price && (
                      <Text style={styles.specialPrice}>${special.price.toFixed(2)}</Text>
                    )}
                  </View>
                  <Text style={styles.specialDescription}>{special.description}</Text>
                  {special.valid_until && (
                    <Text style={styles.specialValidUntil}>
                      Valid until: {new Date(special.valid_until).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </CollapsibleSection>
          )}

          {/* Profile Section Header */}
          <Text style={styles.profileHeader}>{user?.full_name}&apos;s Profile</Text>

          {/* My Profile Info - Elongated Tile */}
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/manager/profile')}
          >
            <MaterialIcons name="person" size={32} color={colors.managerAccent} />
            <Text style={styles.profileButtonText}>My Profile Info</Text>
          </Pressable>

          {/* Guides and Training - Elongated Tile */}
          <Pressable
            style={styles.guidesButton}
            onPress={() => router.push('/employee/training')}
          >
            <MaterialIcons name="menu-book" size={32} color={colors.managerAccent} />
            <Text style={styles.guidesButtonText}>Guides & Training</Text>
          </Pressable>

          {/* Manager Tools */}
          <View style={styles.toolsSection}>
            <Text style={styles.toolsSectionTitle}>Management Tools</Text>
            
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

      {/* Expanded Image Modal with Swipe-Down Gesture */}
      <SwipeableImageModal
        visible={expandedImage !== null}
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.employeeBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  logo: {
    height: 40,
    width: 200,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.employeeCard,
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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
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
    marginBottom: 12,
  },
  messagesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    gap: 8,
  },
  messagesContent: {
    flex: 1,
  },
  messagesIndicatorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noMessagesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messagesSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
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
  noEventsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  eventItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventImageWide: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  eventImageSquare: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 6,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  featureItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureImageWide: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  featureImageSquare: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  featureDates: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  specialItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specialImageWide: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  specialImageSquare: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  specialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  specialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  specialPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.managerAccent,
  },
  specialDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  specialValidUntil: {
    fontSize: 12,
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
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.managerCard,
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
  guidesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.managerCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    gap: 12,
  },
  guidesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  toolsSection: {
    marginTop: 20,
  },
  toolsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.managerCard,
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
