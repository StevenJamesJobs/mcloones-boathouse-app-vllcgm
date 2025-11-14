
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useAboutUs } from '@/hooks/useAboutUs';

export default function AboutScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { sections, loading } = useAboutUs();

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

  const handleGalleryPress = () => {
    console.log('Gallery button pressed - navigating to gallery');
    router.push('/(tabs)/gallery');
  };

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
            sections.map((section, index) => {
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
              
              // Add Gallery Button before "What We Offer" section (index 1)
              if (index === 1) {
                return (
                  <React.Fragment key={`section-${section.id}`}>
                    {/* Gallery Action Banner */}
                    <Pressable 
                      style={({ pressed }) => [
                        styles.galleryBanner,
                        pressed && styles.galleryBannerPressed
                      ]}
                      onPress={handleGalleryPress}
                      android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      <View style={styles.galleryBannerContent}>
                        <View style={styles.galleryBannerLeft}>
                          <IconSymbol 
                            ios_icon_name="photo.fill" 
                            android_material_icon_name="photo_library" 
                            color="#FFFFFF" 
                            size={32} 
                          />
                          <View style={styles.galleryBannerTextContainer}>
                            <Text style={styles.galleryBannerTitle}>View Our Gallery</Text>
                            <Text style={styles.galleryBannerSubtitle}>
                              Explore beautiful photos of our waterfront dining
                            </Text>
                          </View>
                        </View>
                        <IconSymbol 
                          ios_icon_name="chevron.right" 
                          android_material_icon_name="chevron_right" 
                          color="#FFFFFF" 
                          size={24} 
                        />
                      </View>
                    </Pressable>

                    {/* Regular Section */}
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
            })
          )}
        </ScrollView>

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
  galleryBanner: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  galleryBannerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  galleryBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  galleryBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  galleryBannerTextContainer: {
    flex: 1,
  },
  galleryBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  galleryBannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
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
