
import { IconSymbol } from '@/components/IconSymbol';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking, ActivityIndicator, Modal, TextInput, Alert, Image } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    paddingBottom: 40,
  },
  scrollContentWithTabBar: {
    paddingBottom: 120,
  },
  headerButton: {
    padding: 4,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: colors.primary,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.secondaryaccent,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  reviewPromptText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  reviewButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  googleReviewButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  openTableReviewButton: {
    flex: 1,
    backgroundColor: '#DA3743',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  reviewsSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    ...commonStyles.shadow,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAuthor: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
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

export default function ReviewsScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const { reviews, loading, error } = useReviews();
  const insets = useSafeAreaInsets();

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

  const handleGoogleReview = () => {
    const googleReviewUrl = 'https://www.google.com/search?q=mcloone%27s+boathouse&rlz=1C5CHFA_enUS1042US1042#lrd=0x89c22e7b6dd8b5a1:0x8e3c3e3e3e3e3e3e,3';
    Linking.openURL(googleReviewUrl).catch(err => {
      console.error('Failed to open Google review URL:', err);
      Alert.alert('Error', 'Could not open Google review page');
    });
  };

  const handleOpenTableReview = () => {
    const openTableUrl = 'https://www.opentable.com/r/mcloones-boat-house-west-orange?corrid=df6e3a51-d45f-43a7-9a5c-4208a1921ba5&p=2&sd=2025-11-23T21%3A30%3A00';
    Linking.openURL(openTableUrl).catch(err => {
      console.error('Failed to open OpenTable URL:', err);
      Alert.alert('Error', 'Could not open OpenTable page');
    });
  };

  const bannerHeight = insets.top + 60;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Floating Header Banner - No Login Icon */}
        <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
          <Image 
            source={require('@/assets/images/08405405-7ef4-4671-9758-a7220430497a.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: bannerHeight + 16 },
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Customer Reviews</Text>
            <Text style={styles.headerSubtitle}>
              See what our guests are saying about their dining experiences with us!
            </Text>
          </View>

          <View style={styles.section}>
            {/* Review Prompt and Buttons */}
            <Text style={styles.reviewPromptText}>Leave us a review of your visit!</Text>
            
            <View style={styles.reviewButtonsContainer}>
              <Pressable style={styles.googleReviewButton} onPress={handleGoogleReview}>
                <IconSymbol 
                  ios_icon_name="magnifyingglass" 
                  android_material_icon_name="search" 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.reviewButtonText}>Review on{'\n'}Google</Text>
              </Pressable>
              
              <Pressable style={styles.openTableReviewButton} onPress={handleOpenTableReview}>
                <IconSymbol 
                  ios_icon_name="fork.knife" 
                  android_material_icon_name="restaurant" 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.reviewButtonText}>Leave on{'\n'}OpenTable</Text>
              </Pressable>
            </View>

            {/* Reviews Section Title */}
            <Text style={styles.reviewsSectionTitle}>Check out our latest Reviews</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            ) : error ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Failed to load reviews. Please try again later.</Text>
              </View>
            ) : reviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No reviews yet. Be the first to leave a review!</Text>
              </View>
            ) : (
              <>
                {reviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
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
              </>
            )}
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
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
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  color={colors.textSecondary} 
                  size={28} 
                />
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
