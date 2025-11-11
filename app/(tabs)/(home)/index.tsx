
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { Stack, Link } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useWeeklySpecials } from '@/hooks/useWeeklySpecials';
import { useEvents } from '@/hooks/useEvents';
import { useContactUs } from '@/hooks/useContactUs';
import { useReviews } from '@/hooks/useReviews';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const { specials, loading: specialsLoading } = useWeeklySpecials();
  const { events, loading: eventsLoading } = useEvents();
  const { contactInfo, loading: contactLoading } = useContactUs();
  const { reviews, loading: reviewsLoading } = useReviews();

  const handleLogin = () => {
    if (login(email, password)) {
      setLoginModalVisible(false);
      setEmail('');
      setPassword('');
      
      // Navigate based on role
      if (user?.role === 'manager') {
        router.push('/manager/home');
      } else if (user?.role === 'employee') {
        router.push('/employee/home');
      }
    } else {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => setLoginModalVisible(true)}
      style={styles.headerButton}
    >
      <IconSymbol name="person.circle.fill" color={colors.accent} size={28} />
    </Pressable>
  );

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconSymbol
            key={star}
            name="star.fill"
            size={14}
            color={star <= rating ? '#FFD700' : '#ccc'}
          />
        ))}
      </View>
    );
  };

  const handleLeaveReview = () => {
    const googleReviewUrl = 'https://www.google.com/search?q=mcloone%27s+boathouse&rlz=1C5CHFA_enUS1042US1042#lrd=0x89c22e7b6dd8b5a1:0x8e3c3e3e3e3e3e3e,3';
    Linking.openURL(googleReviewUrl).catch(err => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Could not open review page');
    });
  };

  // Get next two upcoming events
  const nextTwoEvents = events.slice(0, 2);

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "McLoone's Boathouse",
            headerRight: renderHeaderRight,
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
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome to McLoone&apos;s Boathouse</Text>
            <Text style={styles.welcomeText}>
              Experience waterfront dining at its finest on the Shrewsbury River
            </Text>
          </View>

          {/* Upcoming Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={commonStyles.subtitle}>Upcoming Events</Text>
              <Link href="/(tabs)/events" asChild>
                <Pressable>
                  <Text style={styles.viewAllText}>View All</Text>
                </Pressable>
              </Link>
            </View>
            {eventsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : nextTwoEvents.length === 0 ? (
              <View style={commonStyles.card}>
                <Text style={styles.noEventsText}>No upcoming events at this time</Text>
              </View>
            ) : (
              nextTwoEvents.map((event) => (
                <View key={event.id} style={commonStyles.card}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(event.event_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {event.event_time}
                  </Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
              ))
            )}
          </View>

          {/* Weekly Specials */}
          <View style={styles.section}>
            <Text style={commonStyles.subtitle}>Weekly Specials</Text>
            {specialsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>Loading specials...</Text>
              </View>
            ) : specials.length === 0 ? (
              <View style={commonStyles.card}>
                <Text style={styles.noSpecialsText}>No weekly specials at this time</Text>
              </View>
            ) : (
              specials.map((special) => (
                <View key={special.id} style={commonStyles.card}>
                  <Text style={styles.specialTitle}>{special.title}</Text>
                  <Text style={styles.specialDescription}>{special.description}</Text>
                  {special.price && (
                    <Text style={styles.specialPrice}>${special.price.toFixed(2)}</Text>
                  )}
                  {special.valid_until && (
                    <Text style={styles.specialValidUntil}>
                      Valid until {new Date(special.valid_until).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Customer Reviews */}
          <View style={styles.section}>
            <Text style={commonStyles.subtitle}>What Our Customers Say</Text>
            {reviewsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            ) : reviews.length === 0 ? (
              <View style={commonStyles.card}>
                <Text style={styles.noReviewsText}>No reviews yet</Text>
              </View>
            ) : (
              <>
                {reviews.map((review) => (
                  <View key={review.id} style={commonStyles.card}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{review.author_name}</Text>
                      {renderStars(review.rating)}
                    </View>
                    <Text style={styles.reviewText}>{review.review_text}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.review_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                ))}
                <Pressable style={styles.leaveReviewButton} onPress={handleLeaveReview}>
                  <IconSymbol name="star.fill" size={20} color="#fff" />
                  <Text style={styles.leaveReviewText}>Leave a Review on Google</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={commonStyles.subtitle}>Contact Us</Text>
            {contactLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>Loading contact info...</Text>
              </View>
            ) : contactInfo ? (
              <View style={commonStyles.card}>
                <View style={styles.contactRow}>
                  <IconSymbol name="phone.fill" color={colors.accent} size={20} />
                  <Text style={styles.contactText}>{contactInfo.phone}</Text>
                </View>
                <View style={styles.contactRow}>
                  <IconSymbol name="envelope.fill" color={colors.accent} size={20} />
                  <Text style={styles.contactText}>{contactInfo.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <IconSymbol name="mappin.circle.fill" color={colors.accent} size={20} />
                  <Text style={styles.contactText}>{contactInfo.address}</Text>
                </View>
                {(contactInfo.hours_weekday || contactInfo.hours_weekend) && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.hoursTitle}>Hours</Text>
                    {contactInfo.hours_weekday && (
                      <Text style={styles.hoursText}>Weekdays: {contactInfo.hours_weekday}</Text>
                    )}
                    {contactInfo.hours_weekend && (
                      <Text style={styles.hoursText}>Weekends: {contactInfo.hours_weekend}</Text>
                    )}
                  </>
                )}
              </View>
            ) : (
              <View style={commonStyles.card}>
                <Text style={styles.noContactText}>Contact information not available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Login Modal */}
      <Modal
        visible={loginModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Employee Login</Text>
              <Pressable onPress={() => setLoginModalVisible(false)}>
                <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
              </Pressable>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="employee@mcloones.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Pressable style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>

            <Text style={styles.helpText}>
              Demo credentials:{'\n'}
              Manager: manager@mcloones.com{'\n'}
              Employee: employee@mcloones.com{'\n'}
              Password: any
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  headerButton: {
    padding: 4,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: colors.primary,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noEventsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noSpecialsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  specialDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  specialPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  specialValidUntil: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  noReviewsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  leaveReviewButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  leaveReviewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  noContactText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
});
