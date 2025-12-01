
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native';
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function EmployeeHomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const { announcements } = useAnnouncements('employees');
  const { unreadCount, refreshInbox } = useMessages();
  const { events } = useEvents();
  const { features } = useSpecialFeatures();
  const { specials } = useWeeklySpecials();
  const [mcloonesBucks, setMcloonesBucks] = useState<number>(0);

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

  // Refresh unread count and McLoone's Bucks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        refreshInbox();
        // Get McLoone's Bucks from user profile
        setMcloonesBucks(user.mcloones_bucks || 0);
      }
    }, [user?.id, user?.mcloones_bucks, refreshInbox])
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
          title: 'Employee Portal',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={handleBackPress} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ),
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
            
            {/* McLoone's Bucks */}
            <View style={styles.bucksContainer}>
              <MaterialIcons name="stars" size={20} color="#FFD700" />
              <Text style={styles.bucksText}>McLoone&apos;s Bucks: </Text>
              <Text style={styles.bucksAmount}>${mcloonesBucks.toFixed(2)}</Text>
            </View>

            {/* Messages Indicator */}
            <Pressable
              style={styles.messagesIndicator}
              onPress={() => router.push('/employee/inbox' as any)}
            >
              <MaterialIcons 
                name="inbox" 
                size={20} 
                color={unreadCount > 0 ? colors.employeeAccent : colors.textSecondary} 
              />
              {unreadCount > 0 ? (
                <Text style={styles.messagesIndicatorText}>
                  {unreadCount} New Message{unreadCount !== 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.noMessagesText}>No New Messages</Text>
              )}
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Compact Weather - Collapsible */}
          <CollapsibleSection
            title="Today's Weather"
            icon="wb-sunny"
            iconColor={colors.employeeAccent}
            defaultExpanded={true}
            variant="employee"
          >
            <CompactWeatherDisplay />
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

          {/* Upcoming Events - Collapsible */}
          <CollapsibleSection
            title="Upcoming Events"
            icon="event"
            iconColor={colors.employeeAccent}
            defaultExpanded={true}
            variant="employee"
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
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.rsvp_link && (
                        <MaterialIcons name="open-in-new" size={18} color={colors.employeeAccent} />
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
                {events.length > 3 && (
                  <Pressable
                    style={styles.viewAllButton}
                    onPress={() => router.push('/(tabs)/events' as any)}
                  >
                    <Text style={styles.viewAllText}>View All Events</Text>
                    <MaterialIcons name="arrow-forward" size={18} color={colors.employeeAccent} />
                  </Pressable>
                )}
              </>
            )}
          </CollapsibleSection>

          {/* Special Features Section */}
          {topFeatures.length > 0 && (
            <View style={styles.specialFeaturesSection}>
              <Text style={styles.sectionTitle}>Special Features</Text>
              {topFeatures.map((feature) => (
                <Pressable
                  key={feature.id}
                  style={styles.featureItem}
                  onPress={() => handleFeaturePress(feature)}
                >
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    {feature.link_url && (
                      <MaterialIcons name="open-in-new" size={18} color={colors.employeeAccent} />
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
            </View>
          )}

          {/* Weekly Specials Section */}
          {specials.length > 0 && (
            <View style={styles.weeklySpecialsSection}>
              <Text style={styles.sectionTitle}>Weekly Specials</Text>
              {specials.map((special) => (
                <View key={special.id} style={styles.specialItem}>
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
            </View>
          )}

          {/* Profile Section Header */}
          <Text style={styles.profileHeader}>{user?.full_name}&apos;s Profile</Text>

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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
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
    marginBottom: 12,
  },
  bucksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  bucksText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  bucksAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
  },
  messagesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    gap: 8,
  },
  messagesIndicatorText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.employeeAccent,
  },
  noMessagesText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
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
    color: colors.employeeAccent,
  },
  specialFeaturesSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  featureItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  weeklySpecialsSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  specialItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.employeeAccent,
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
