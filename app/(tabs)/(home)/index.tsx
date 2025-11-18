
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, Alert, ActivityIndicator, Linking, Image } from 'react-native';
import { Stack, Link } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useWeeklySpecials } from '@/hooks/useWeeklySpecials';
import { useEvents } from '@/hooks/useEvents';
import { useContactUs } from '@/hooks/useContactUs';
import { useReviews } from '@/hooks/useReviews';
import { useTagline } from '@/hooks/useTagline';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EmployeeDataSeeder from '@/components/EmployeeDataSeeder';

export default function HomeScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [seederModalVisible, setSeederModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const { login, user } = useAuth();
  const { specials, loading: specialsLoading } = useWeeklySpecials();
  const { events, loading: eventsLoading } = useEvents();
  const { contactInfo, loading: contactLoading } = useContactUs();
  const { reviews, loading: reviewsLoading } = useReviews();
  const { tagline, loading: taglineLoading } = useTagline();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoggingIn(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        setLoginModalVisible(false);
        setUsername('');
        setPassword('');
        
        // Small delay to allow auth state to update
        setTimeout(() => {
          // Navigate based on role - the user will be updated by the auth context
          if (result.mustChangePassword) {
            Alert.alert(
              'Password Change Required',
              'Please change your password from the default password in your profile.',
              [{ text: 'OK' }]
            );
          }
        }, 100);
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoggingIn(false);
    }
  };

  // Auto-navigate when user is authenticated
  React.useEffect(() => {
    if (user) {
      if (user.role === 'manager' || user.role === 'owner_manager') {
        router.replace('/manager/home');
      } else if (user.role === 'employee') {
        router.replace('/employee/home');
      }
    }
  }, [user]);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconSymbol
            key={star}
            ios_icon_name="star.fill"
            android_material_icon_name="star"
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

  const bannerHeight = insets.top + 60;

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "McLoone's Boathouse",
            headerShown: false,
          }}
        />
      )}
      <View style={[commonStyles.container, styles.container]}>
        {/* Floating Header Banner with Logo and Login Icon */}
        <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
          <Image 
            source={require('@/assets/images/08405405-7ef4-4671-9758-a7220430497a.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerButtons}>
            {/* Temporary Setup Button - Remove after initial setup */}
            <Pressable onPress={() => setSeederModalVisible(true)} style={styles.setupButton}>
              <IconSymbol 
                ios_icon_name="gear" 
                android_material_icon_name="settings" 
                color={colors.textSecondary} 
                size={24} 
              />
            </Pressable>
            <Pressable onPress={() => setLoginModalVisible(true)} style={styles.loginIconButton}>
              <IconSymbol 
                ios_icon_name="person.circle.fill" 
                android_material_icon_name="account_circle" 
                color="#3289a8" 
                size={36} 
              />
            </Pressable>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: bannerHeight + 16 },
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message with Dynamic Tagline */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>McLoone&apos;s Boathouse</Text>
            {taglineLoading ? (
              <View style={styles.taglineLoadingContainer}>
                <ActivityIndicator size="small" color={colors.seccondaryaccent} />
              </View>
            ) : (
              <Text style={styles.welcomeText}>
                {tagline?.tagline_text || 'Experience waterfront dining at its finest on the Shrewsbury River'}
              </Text>
            )}
          </View>

          {/* Upcoming Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
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
                  {event.image_url && (
                    <Pressable onPress={() => setExpandedImage(event.image_url)}>
                      <Image
                        source={{ uri: event.image_url }}
                        style={styles.eventThumbnail}
                        resizeMode="cover"
                      />
                    </Pressable>
                  )}
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
            <Text style={styles.sectionTitle}>Weekly Specials</Text>
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
                  <View style={styles.specialContent}>
                    {special.image_url && (
                      <Pressable onPress={() => setExpandedImage(special.image_url)}>
                        <Image
                          source={{ uri: special.image_url }}
                          style={styles.specialThumbnail}
                          resizeMode="cover"
                        />
                      </Pressable>
                    )}
                    <View style={styles.specialDetails}>
                      <View style={styles.specialHeader}>
                        <View style={styles.specialTitleContainer}>
                          <Text style={styles.specialTitle}>{special.title}</Text>
                        </View>
                        {special.price && (
                          <Text style={styles.specialPrice}>${special.price.toFixed(2)}</Text>
                        )}
                      </View>
                      {special.description && (
                        <Text style={styles.specialDescription}>{special.description}</Text>
                      )}
                      {special.valid_until && (
                        <Text style={styles.specialValidUntil}>
                          Valid until {new Date(special.valid_until).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Customer Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Our Customers Say</Text>
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
                  <IconSymbol 
                    ios_icon_name="star.fill" 
                    android_material_icon_name="star" 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.leaveReviewText}>Leave a Review on Google</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            {contactLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>Loading contact info...</Text>
              </View>
            ) : contactInfo ? (
              <View style={commonStyles.card}>
                <View style={styles.contactRow}>
                  <IconSymbol 
                    ios_icon_name="phone.fill" 
                    android_material_icon_name="phone" 
                    color={colors.accent} 
                    size={20} 
                  />
                  <Text style={styles.contactText}>{contactInfo.phone}</Text>
                </View>
                <View style={styles.contactRow}>
                  <IconSymbol 
                    ios_icon_name="envelope.fill" 
                    android_material_icon_name="email" 
                    color={colors.accent} 
                    size={20} 
                  />
                  <Text style={styles.contactText}>{contactInfo.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <IconSymbol 
                    ios_icon_name="mappin.circle.fill" 
                    android_material_icon_name="location_on" 
                    color={colors.accent} 
                    size={20} 
                  />
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

          {/* Bottom Padding/Footer */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>

      {/* Expanded Image Modal */}
      <Modal
        visible={expandedImage !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setExpandedImage(null)}
      >
        <View style={styles.expandedModalOverlay}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setExpandedImage(null)}
          >
            <IconSymbol 
              ios_icon_name="xmark.circle.fill" 
              android_material_icon_name="cancel" 
              color="#FFFFFF" 
              size={36} 
            />
          </Pressable>
          {expandedImage && (
            <Image
              source={{ uri: expandedImage }}
              style={styles.expandedImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Employee Data Seeder Modal */}
      <Modal
        visible={seederModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSeederModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.seederModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Initial Setup</Text>
              <Pressable onPress={() => setSeederModalVisible(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  color={colors.textSecondary} 
                  size={28} 
                />
              </Pressable>
            </View>
            <ScrollView style={styles.seederScrollView}>
              <EmployeeDataSeeder />
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  color={colors.textSecondary} 
                  size={28} 
                />
              </Pressable>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loggingIn}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loggingIn}
              />
            </View>

            <Pressable 
              style={[styles.loginButton, loggingIn && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loggingIn}
            >
              {loggingIn ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </Pressable>

            <Text style={styles.helpText}>
              Contact your manager if you need login credentials
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
    backgroundColor: colors.background,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setupButton: {
    padding: 4,
  },
  loginIconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
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
    color: '#000000',
    lineHeight: 24,
  },
  taglineLoadingContainer: {
    paddingVertical: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
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
  eventThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.border,
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
  specialContent: {
    flexDirection: 'row',
    gap: 12,
  },
  specialThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  specialDetails: {
    flex: 1,
  },
  specialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  specialTitleContainer: {
    flex: 1,
    marginRight: 12,
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
    lineHeight: 20,
    marginBottom: 4,
  },
  specialPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
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
  bottomPadding: {
    height: 80,
  },
  expandedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  expandedImage: {
    width: '100%',
    height: '100%',
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
  seederModalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  seederScrollView: {
    maxHeight: 500,
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
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
  },
  loginButtonDisabled: {
    opacity: 0.6,
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
