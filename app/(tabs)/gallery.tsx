
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TextInput, Pressable, Alert, Image, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useGallery } from '@/hooks/useGallery';

export default function GalleryScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'dining' | 'banquets' | 'events'>('dining');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { images: diningImages, loading: diningLoading } = useGallery('dining');
  const { images: banquetsImages, loading: banquetsLoading } = useGallery('banquets');
  const { images: eventsImages, loading: eventsLoading } = useGallery('events');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      setLoginModalVisible(false);
      setEmail('');
      setPassword('');
      
      if (result.user?.role === 'manager') {
        router.replace('/manager/home');
      } else if (result.user?.role === 'employee') {
        router.replace('/employee/home');
      }
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  const getCurrentImages = () => {
    switch (selectedCategory) {
      case 'dining':
        return diningImages;
      case 'banquets':
        return banquetsImages;
      case 'events':
        return eventsImages;
      default:
        return [];
    }
  };

  const isLoading = diningLoading || banquetsLoading || eventsLoading;
  const currentImages = getCurrentImages();

  const bannerHeight = insets.top + 60;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[commonStyles.container, styles.container]}>
        {/* Hovering Header */}
        <CustomerBanner onLoginPress={() => setLoginModalVisible(true)} />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: bannerHeight + 16 },
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.introText}>
            Browse our collection of beautiful waterfront views, delicious dishes, and memorable moments at McLoone&apos;s Boathouse.
          </Text>

          {/* Category Tabs */}
          <View style={styles.categoryTabs}>
            {(['dining', 'banquets', 'events'] as const).map(cat => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryTab,
                  selectedCategory === cat && styles.categoryTabActive
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === cat && styles.categoryTabTextActive
                ]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Gallery Grid */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Loading gallery...</Text>
            </View>
          ) : currentImages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="photo.on.rectangle" color={colors.textSecondary} size={64} />
              <Text style={styles.emptyText}>No images in this category yet</Text>
              <Text style={styles.emptySubtext}>Check back soon for beautiful photos!</Text>
            </View>
          ) : (
            <View style={styles.galleryGrid}>
              {currentImages.map((image) => (
                <Pressable
                  key={image.id}
                  style={styles.galleryItem}
                  onPress={() => setExpandedImage(image.image_url)}
                >
                  <Image
                    source={{ uri: image.image_url }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  {image.caption && (
                    <View style={styles.captionOverlay}>
                      <Text style={styles.captionText} numberOfLines={2}>
                        {image.caption}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

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
              <IconSymbol name="xmark.circle.fill" color="#FFFFFF" size={36} />
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

              <View style={styles.modalBody}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />

                <Pressable style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  categoryTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
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
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryItem: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  captionText: {
    fontSize: 10,
    color: '#FFFFFF',
    lineHeight: 14,
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
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
