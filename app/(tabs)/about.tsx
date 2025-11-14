
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TextInput, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useAboutUs } from '@/hooks/useAboutUs';
import { useGallery } from '@/hooks/useGallery';

export default function AboutScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<'dining' | 'banquets' | 'events'>('dining');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { sections, loading } = useAboutUs();
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

  const getCurrentGalleryImages = () => {
    switch (selectedGalleryCategory) {
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

  const isGalleryLoading = diningLoading || banquetsLoading || eventsLoading;
  const currentGalleryImages = getCurrentGalleryImages();

  const bannerHeight = insets.top + 60;

  // Helper function to render section content with icons
  const renderSectionContent = (section: any) => {
    const title = section.title.toLowerCase();
    
    // Special rendering for "What We Offer" section with bullet points
    if (title.includes('what we offer') || title.includes('offer')) {
      const features = section.content.split('•').filter((f: string) => f.trim());
      return (
        <View style={commonStyles.card}>
          {features.map((feature: string, index: number) => (
            <View key={index} style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" color={colors.accent} size={20} />
              <Text style={styles.featureText}>{feature.trim()}</Text>
            </View>
          ))}
        </View>
      );
    }
    
    // Special rendering for "Visit Us" section with contact info
    if (title.includes('visit') || title.includes('contact')) {
      const lines = section.content.split('•').filter((l: string) => l.trim());
      return (
        <View style={commonStyles.card}>
          {lines.map((line: string, index: number) => {
            const trimmedLine = line.trim();
            let icon = 'info.circle.fill';
            
            if (trimmedLine.toLowerCase().includes('ocean') || trimmedLine.toLowerCase().includes('avenue')) {
              icon = 'mappin.circle.fill';
            } else if (trimmedLine.match(/\(\d{3}\)/)) {
              icon = 'phone.fill';
            } else if (trimmedLine.toLowerCase().includes('hours') || trimmedLine.toLowerCase().includes('monday')) {
              icon = 'clock.fill';
            }
            
            return (
              <View key={index} style={styles.contactRow}>
                <IconSymbol name={icon} color={colors.accent} size={20} />
                <Text style={styles.contactText}>{trimmedLine}</Text>
              </View>
            );
          })}
        </View>
      );
    }
    
    // Default rendering for other sections
    return (
      <View style={commonStyles.card}>
        <Text style={styles.sectionText}>{section.content}</Text>
      </View>
    );
  };

  // Helper function to get icon for section
  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('story') || lowerTitle.includes('history')) return 'book.fill';
    if (lowerTitle.includes('offer')) return 'star.fill';
    if (lowerTitle.includes('experience')) return 'sparkles';
    if (lowerTitle.includes('event') || lowerTitle.includes('private')) return 'gift.fill';
    if (lowerTitle.includes('visit') || lowerTitle.includes('contact')) return 'mappin.circle.fill';
    return 'info.circle.fill';
  };

  // Find the "What We Offer" section index to insert Gallery before it
  const whatWeOfferIndex = sections.findIndex(section => 
    section.title.toLowerCase().includes('what we offer') || section.title.toLowerCase().includes('offer')
  );

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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : sections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No content available</Text>
            </View>
          ) : (
            <>
              {sections.map((section, index) => {
                // First section is the hero
                if (index === 0) {
                  return (
                    <View key={section.id} style={styles.heroSection}>
                      <Text style={styles.heroTitle}>{section.title}</Text>
                      {section.content && (
                        <Text style={styles.heroText}>{section.content}</Text>
                      )}
                    </View>
                  );
                }
                
                // Insert Gallery section before "What We Offer"
                if (index === whatWeOfferIndex && whatWeOfferIndex !== -1) {
                  return (
                    <React.Fragment key={`gallery-${section.id}`}>
                      {/* Gallery Section */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <IconSymbol name="photo.fill" color={colors.accent} size={24} />
                          <Text style={styles.sectionTitle}>Gallery</Text>
                        </View>
                        
                        <Text style={styles.galleryIntro}>
                          Browse our collection of beautiful waterfront views, delicious dishes, and memorable moments.
                        </Text>

                        {/* Gallery Category Tabs */}
                        <View style={styles.galleryTabs}>
                          {(['dining', 'banquets', 'events'] as const).map(cat => (
                            <Pressable
                              key={cat}
                              style={[
                                styles.galleryTab,
                                selectedGalleryCategory === cat && styles.galleryTabActive
                              ]}
                              onPress={() => setSelectedGalleryCategory(cat)}
                            >
                              <Text style={[
                                styles.galleryTabText,
                                selectedGalleryCategory === cat && styles.galleryTabTextActive
                              ]}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </Text>
                            </Pressable>
                          ))}
                        </View>

                        {/* Gallery Grid */}
                        {isGalleryLoading ? (
                          <View style={styles.galleryLoadingContainer}>
                            <ActivityIndicator size="large" color={colors.accent} />
                            <Text style={styles.loadingText}>Loading gallery...</Text>
                          </View>
                        ) : currentGalleryImages.length === 0 ? (
                          <View style={styles.galleryEmptyContainer}>
                            <IconSymbol name="photo.on.rectangle" color={colors.textSecondary} size={48} />
                            <Text style={styles.galleryEmptyText}>No images in this category yet</Text>
                          </View>
                        ) : (
                          <View style={styles.galleryGrid}>
                            {currentGalleryImages.map((image) => (
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
                      </View>

                      {/* Original Section */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <IconSymbol name={getSectionIcon(section.title)} color={colors.accent} size={24} />
                          <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>
                        {renderSectionContent(section)}
                      </View>
                    </React.Fragment>
                  );
                }
                
                // Other sections
                return (
                  <View key={section.id} style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <IconSymbol name={getSectionIcon(section.title)} color={colors.accent} size={24} />
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                    </View>
                    {renderSectionContent(section)}
                  </View>
                );
              })}
            </>
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
    paddingBottom: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  heroSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 32,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  galleryIntro: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  galleryTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  galleryTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  galleryTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  galleryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  galleryTabTextActive: {
    color: '#FFFFFF',
  },
  galleryLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  galleryEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  galleryEmptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
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
    padding: 6,
  },
  captionText: {
    fontSize: 9,
    color: '#FFFFFF',
    lineHeight: 12,
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
