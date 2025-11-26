
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, Alert, ActivityIndicator, Linking, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Stack, Link } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useWeeklySpecials } from '@/hooks/useWeeklySpecials';
import { useEvents } from '@/hooks/useEvents';
import { useSpecialFeatures } from '@/hooks/useSpecialFeatures';
import { useReviews } from '@/hooks/useReviews';
import { useTagline } from '@/hooks/useTagline';
import { useAboutUs } from '@/hooks/useAboutUs';
import { useWeather } from '@/hooks/useWeather';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SwipeableImageModal } from '@/components/SwipeableImageModal';
import { OpenTableWidget } from '@/components/OpenTableWidget';

export default function HomeScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const { login, user } = useAuth();
  const { specials, loading: specialsLoading } = useWeeklySpecials();
  const { events, loading: eventsLoading } = useEvents();
  const { features, loading: featuresLoading } = useSpecialFeatures();
  const { reviews, loading: reviewsLoading } = useReviews();
  const { tagline, loading: taglineLoading } = useTagline();
  const { sections: aboutSections, loading: aboutLoading } = useAboutUs();
  const { weatherData, loading: weatherLoading } = useWeather();
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
          <MaterialIcons
            key={star}
            name="star"
            size={18}
            color={star <= rating ? '#FFD700' : '#D3D3D3'}
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

  // Find the "Visit Us" section from About Us
  const visitUsSection = aboutSections.find(section => 
    section.title.toLowerCase().includes('visit') || section.title.toLowerCase().includes('contact')
  );

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
            <Pressable onPress={() => setLoginModalVisible(true)} style={styles.loginIconButton}>
              <MaterialIcons name="login" size={32} color="#3289a8" />
            </Pressable>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: bannerHeight },
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message with Dynamic Tagline and Weather */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeLeft}>
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
              
              {/* Compact Weather on the Right */}
              <View style={styles.weatherRight}>
                {weatherLoading ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : weatherData ? (
                  <>
                    <Text style={styles.weatherTemp}>{Math.round(weatherData.current.temp_f)}°</Text>
                    <Image
                      source={{ uri: `https:${weatherData.current.condition.icon}` }}
                      style={styles.weatherIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.weatherCondition}>{weatherData.current.condition.text}</Text>
                  </>
                ) : null}
              </View>
            </View>
          </View>

          {/* OpenTable Reservation Widget - Compact Style */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Make a Reservation</Text>
            <OpenTableWidget 
              restaurantId="69187"
              theme="standard"
              color="1"
              dark={false}
              height={180}
            />
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
              nextTwoEvents.map((event) => {
                if (event.display_style === 'banner') {
                  // Banner style - full width
                  return (
                    <View key={event.id} style={commonStyles.card}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.image_url && (
                        <Pressable onPress={() => setExpandedImage(event.image_url)}>
                          <Image
                            source={{ uri: event.image_url }}
                            style={styles.eventThumbnail}
                            resizeMode="cover"
                          />
                        </Pressable>
                      )}
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
                  );
                } else {
                  // Square style - like menu items
                  return (
                    <View key={event.id} style={commonStyles.card}>
                      <View style={styles.eventContentSquare}>
                        {event.image_url && (
                          <Pressable onPress={() => setExpandedImage(event.image_url)}>
                            <Image
                              source={{ uri: event.image_url }}
                              style={styles.eventThumbnailSquare}
                              resizeMode="cover"
                            />
                          </Pressable>
                        )}
                        <View style={styles.eventDetailsSquare}>
                          <Text style={styles.eventTitleSquare}>{event.title}</Text>
                          <Text style={styles.eventDateSquare}>
                            {new Date(event.event_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} at {event.event_time}
                          </Text>
                          <Text style={styles.eventDescriptionSquare} numberOfLines={3}>
                            {event.description}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }
              })
            )}
          </View>

          {/* Special Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Features</Text>
            {featuresLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>Loading special features...</Text>
              </View>
            ) : features.length === 0 ? (
              <View style={commonStyles.card}>
                <Text style={styles.noFeaturesText}>No special features at this time</Text>
              </View>
            ) : (
              <View style={styles.featuresContainer}>
                {features.map((feature) => {
                  if (feature.display_style === 'banner') {
                    // Banner style - full width like events
                    return (
                      <View key={feature.id} style={commonStyles.card}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        {feature.image_url && (
                          <Pressable onPress={() => setExpandedImage(feature.image_url)}>
                            <Image
                              source={{ uri: feature.image_url }}
                              style={styles.featureThumbnailBanner}
                              resizeMode="cover"
                            />
                          </Pressable>
                        )}
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                        {feature.start_date && (
                          <Text style={styles.featureDate}>
                            {feature.end_date 
                              ? `${new Date(feature.start_date).toLocaleDateString()} - ${new Date(feature.end_date).toLocaleDateString()}`
                              : `Starting ${new Date(feature.start_date).toLocaleDateString()}`
                            }
                          </Text>
                        )}
                        {feature.link_url && (
                          <Pressable
                            style={styles.featureLinkButton}
                            onPress={() => Linking.openURL(feature.link_url!).catch(err => {
                              console.error('Failed to open URL:', err);
                              Alert.alert('Error', 'Could not open link');
                            })}
                          >
                            <Text style={styles.featureLinkButtonText}>Learn More</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                          </Pressable>
                        )}
                      </View>
                    );
                  } else {
                    // Square style - like menu items
                    return (
                      <View key={feature.id} style={commonStyles.card}>
                        <View style={styles.featureContentSquare}>
                          {feature.image_url && (
                            <Pressable onPress={() => setExpandedImage(feature.image_url)}>
                              <Image
                                source={{ uri: feature.image_url }}
                                style={styles.featureThumbnailSquare}
                                resizeMode="cover"
                              />
                            </Pressable>
                          )}
                          <View style={styles.featureDetailsSquare}>
                            <Text style={styles.featureTitleSquare}>{feature.title}</Text>
                            <Text style={styles.featureDescriptionSquare} numberOfLines={3}>
                              {feature.description}
                            </Text>
                            {feature.start_date && (
                              <Text style={styles.featureDateSquare}>
                                {feature.end_date 
                                  ? `${new Date(feature.start_date).toLocaleDateString()} - ${new Date(feature.end_date).toLocaleDateString()}`
                                  : `Starting ${new Date(feature.start_date).toLocaleDateString()}`
                                }
                              </Text>
                            )}
                            {feature.link_url && (
                              <Pressable
                                style={styles.featureLinkButtonSquare}
                                onPress={() => Linking.openURL(feature.link_url!).catch(err => {
                                  console.error('Failed to open URL:', err);
                                  Alert.alert('Error', 'Could not open link');
                                })}
                              >
                                <Text style={styles.featureLinkButtonTextSquare}>Learn More</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  }
                })}
              </View>
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

          {/* Visit Us Section */}
          {visitUsSection && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{visitUsSection.title}</Text>
              {aboutLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : (
                <View style={commonStyles.card}>
                  {visitUsSection.content.split('•').filter((line: string) => line.trim()).map((line: string, index: number) => {
                    const trimmedLine = line.trim();
                    let iosIconName = 'info.circle.fill';
                    let androidIconName = 'info';
                    
                    if (trimmedLine.toLowerCase().includes('ocean') || trimmedLine.toLowerCase().includes('avenue') || trimmedLine.toLowerCase().includes('address')) {
                      iosIconName = 'mappin.circle.fill';
                      androidIconName = 'place';
                    } else if (trimmedLine.match(/\(\d{3}\)/) || trimmedLine.toLowerCase().includes('phone')) {
                      iosIconName = 'phone.fill';
                      androidIconName = 'phone';
                    } else if (trimmedLine.toLowerCase().includes('hours') || trimmedLine.toLowerCase().includes('monday') || trimmedLine.toLowerCase().includes('day')) {
                      iosIconName = 'clock.fill';
                      androidIconName = 'schedule';
                    }
                    
                    return (
                      <View key={index} style={styles.visitUsRow}>
                        <MaterialIcons 
                          name={androidIconName as any}
                          color={colors.accent} 
                          size={22} 
                        />
                        <Text style={styles.visitUsText}>{trimmedLine}</Text>
                      </View>
                    );
                  })}
                  
                  {/* Social Media Links */}
                  {(visitUsSection.website_url || visitUsSection.facebook_url || visitUsSection.instagram_url) && (
                    <View style={styles.socialMediaContainer}>
                      <View style={styles.socialMediaDivider} />
                      <Text style={styles.socialMediaTitle}>Connect With Us</Text>
                      <View style={styles.socialMediaLinks}>
                        {visitUsSection.website_url && (
                          <Pressable
                            style={styles.socialButton}
                            onPress={() => Linking.openURL(visitUsSection.website_url!).catch(err => {
                              console.error('Failed to open URL:', err);
                              Alert.alert('Error', 'Could not open website');
                            })}
                          >
                            <MaterialIcons name="language" size={32} color={colors.accent} />
                            <Text style={styles.socialButtonLabel}>Website</Text>
                          </Pressable>
                        )}
                        {visitUsSection.facebook_url && (
                          <Pressable
                            style={styles.socialButton}
                            onPress={() => Linking.openURL(visitUsSection.facebook_url!).catch(err => {
                              console.error('Failed to open URL:', err);
                              Alert.alert('Error', 'Could not open Facebook');
                            })}
                          >
                            <MaterialIcons name="facebook" size={32} color="#1877F2" />
                            <Text style={styles.socialButtonLabel}>Facebook</Text>
                          </Pressable>
                        )}
                        {visitUsSection.instagram_url && (
                          <Pressable
                            style={styles.socialButton}
                            onPress={() => Linking.openURL(visitUsSection.instagram_url!).catch(err => {
                              console.error('Failed to open URL:', err);
                              Alert.alert('Error', 'Could not open Instagram');
                            })}
                          >
                            <MaterialIcons name="camera-alt" size={32} color="#E4405F" />
                            <Text style={styles.socialButtonLabel}>Instagram</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

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
                  <MaterialIcons name="star" size={20} color="#fff" />
                  <Text style={styles.leaveReviewText}>Leave a Review on Google</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Bottom Padding/Footer */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>

      {/* Expanded Image Modal with Swipe-Down Gesture */}
      <SwipeableImageModal
        visible={expandedImage !== null}
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />

      {/* Login Modal with Keyboard Dismiss */}
      <Modal
        visible={loginModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    paddingVertical: 20,
    backgroundColor: colors.primary,
    marginBottom: 0,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  welcomeLeft: {
    flex: 1,
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
  weatherRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  weatherIcon: {
    width: 48,
    height: 48,
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 20,
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
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  eventThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.border,
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
  eventContentSquare: {
    flexDirection: 'row',
    gap: 12,
  },
  eventThumbnailSquare: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  eventDetailsSquare: {
    flex: 1,
  },
  eventTitleSquare: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDateSquare: {
    fontSize: 12,
    color: colors.accent,
    marginBottom: 4,
  },
  eventDescriptionSquare: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  featuresContainer: {
    gap: 12,
  },
  noFeaturesText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  featureThumbnailBanner: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.border,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  featureDate: {
    fontSize: 12,
    color: colors.accent,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  featureLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  featureLinkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureContentSquare: {
    flexDirection: 'row',
    gap: 12,
  },
  featureThumbnailSquare: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  featureDetailsSquare: {
    flex: 1,
  },
  featureTitleSquare: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescriptionSquare: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  featureDateSquare: {
    fontSize: 11,
    color: colors.accent,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  featureLinkButtonSquare: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  featureLinkButtonTextSquare: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  visitUsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitUsText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  socialMediaContainer: {
    marginTop: 16,
    paddingTop: 16,
  },
  socialMediaDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  socialMediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  socialMediaLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 12,
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 90,
  },
  socialButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 6,
  },
  bottomPadding: {
    height: 80,
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
