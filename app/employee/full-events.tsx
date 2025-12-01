
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, ActivityIndicator, Image } from 'react-native';
import { Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useEvents } from '@/hooks/useEvents';
import { SwipeableImageModal } from '@/components/SwipeableImageModal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function FullEventsScreen() {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const { events, loading } = useEvents();

  const handleRSVP = (rsvpLink: string | null) => {
    if (rsvpLink) {
      Linking.openURL(rsvpLink);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'All Events',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.introText}>
            View all upcoming events and entertainment!
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.employeeAccent} />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No upcoming events at this time</Text>
              <Text style={styles.emptySubtext}>Check back soon for exciting events!</Text>
            </View>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <MaterialIcons name="event" size={24} color={colors.employeeAccent} />
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

                {event.image_url && (
                  <Pressable onPress={() => setExpandedImage(event.image_url)}>
                    <Image
                      source={{ uri: event.image_url }}
                      style={event.display_style === 'banner' ? styles.eventThumbnail : styles.eventThumbnailSquare}
                      resizeMode="cover"
                    />
                  </Pressable>
                )}

                <View style={styles.eventTime}>
                  <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
                  <Text style={styles.eventTimeText}>{event.event_time}</Text>
                </View>

                <Text style={styles.eventDescription}>{event.description}</Text>

                {event.rsvp_link && (
                  <Pressable
                    style={styles.rsvpButton}
                    onPress={() => handleRSVP(event.rsvp_link)}
                  >
                    <Text style={styles.rsvpButtonText}>RSVP Now</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>
            ))
          )}
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
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
    backgroundColor: colors.employeeCard,
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
    color: colors.employeeAccent,
    fontWeight: '600',
  },
  eventThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.border,
  },
  eventThumbnailSquare: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.border,
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
    backgroundColor: colors.employeeAccent,
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
});
