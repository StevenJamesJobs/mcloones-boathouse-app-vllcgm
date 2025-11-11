
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useEvents } from '@/hooks/useEvents';

export default function EventsScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const { events, loading } = useEvents();

  const handleRSVP = (rsvpLink: string | null) => {
    if (rsvpLink) {
      Linking.openURL(rsvpLink);
    }
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Events & Entertainment',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
      )}
      
      <View style={[commonStyles.container, styles.container]}>
        {/* Banner for non-iOS */}
        {Platform.OS !== 'ios' && (
          <CustomerBanner onLoginPress={() => setLoginModalVisible(true)} />
        )}

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.introText}>
            Join us for exciting events and live entertainment throughout the year!
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="calendar" color={colors.textSecondary} size={64} />
              <Text style={styles.emptyText}>No upcoming events at this time</Text>
              <Text style={styles.emptySubtext}>Check back soon for exciting events!</Text>
            </View>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <IconSymbol name="calendar" color={colors.accent} size={24} />
                  <View style={styles.eventHeaderText}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.eventTime}>
                  <IconSymbol name="clock.fill" color={colors.textSecondary} size={16} />
                  <Text style={styles.eventTimeText}>{event.event_time}</Text>
                </View>

                <Text style={styles.eventDescription}>{event.description}</Text>

                {event.rsvp_link && (
                  <Pressable
                    style={styles.rsvpButton}
                    onPress={() => handleRSVP(event.rsvp_link)}
                  >
                    <Text style={styles.rsvpButtonText}>RSVP Now</Text>
                    <IconSymbol name="arrow.right" color="#FFFFFF" size={16} />
                  </Pressable>
                )}
              </View>
            ))
          )}

          <View style={styles.infoCard}>
            <IconSymbol name="info.circle.fill" color={colors.accent} size={24} />
            <Text style={styles.infoText}>
              For private events and bookings, please contact us at (732) 555-0123 or email events@mcloones.com
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  introText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTimeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  rsvpButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
  },
});
