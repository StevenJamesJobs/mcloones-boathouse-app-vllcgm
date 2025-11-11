
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TextInput, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function AboutScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>About McLoone&apos;s Boathouse</Text>
          </View>

          {/* Main Description */}
          <View style={commonStyles.card}>
            <Text style={styles.sectionText}>
              McLoone&apos;s Boathouse is a waterfront restaurant located on the Shrewsbury River in West End, New Jersey. We offer stunning views, exceptional cuisine, and a warm, welcoming atmosphere that has made us a favorite destination for locals and visitors alike.
            </Text>
          </View>

          {/* Our Story */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="book.fill" color={colors.accent} size={24} />
              <Text style={styles.sectionTitle}>Our Story</Text>
            </View>
            <View style={commonStyles.card}>
              <Text style={styles.sectionText}>
                Founded by Tim McLoone, McLoone&apos;s Boathouse has been serving the Jersey Shore community with pride and passion. Our commitment to fresh, locally-sourced ingredients and outstanding service has established us as one of the premier dining destinations on the Jersey Shore.
              </Text>
            </View>
          </View>

          {/* What We Offer */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="star.fill" color={colors.accent} size={24} />
              <Text style={styles.sectionTitle}>What We Offer</Text>
            </View>
            <View style={commonStyles.card}>
              <View style={styles.featureItem}>
                <IconSymbol name="water.waves" color={colors.accent} size={20} />
                <Text style={styles.featureText}>Breathtaking Waterfront Views</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="fork.knife" color={colors.accent} size={20} />
                <Text style={styles.featureText}>Fresh, Locally-Sourced Seafood</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="music.note" color={colors.accent} size={20} />
                <Text style={styles.featureText}>Live Entertainment</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="heart.fill" color={colors.accent} size={20} />
                <Text style={styles.featureText}>Family-Friendly Atmosphere</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="wineglass" color={colors.accent} size={20} />
                <Text style={styles.featureText}>Extensive Wine & Cocktail Selection</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="sun.max.fill" color={colors.accent} size={20} />
                <Text style={styles.featureText}>Outdoor Deck Dining</Text>
              </View>
            </View>
          </View>

          {/* Dining Experience */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="sparkles" color={colors.accent} size={24} />
              <Text style={styles.sectionTitle}>The Experience</Text>
            </View>
            <View style={commonStyles.card}>
              <Text style={styles.sectionText}>
                Whether you&apos;re joining us for a casual lunch, a romantic dinner, or a special celebration, McLoone&apos;s Boathouse offers an unforgettable dining experience. Our menu features fresh seafood, premium steaks, creative appetizers, and delicious desserts, all prepared with care by our talented culinary team.
              </Text>
            </View>
          </View>

          {/* Private Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="gift.fill" color={colors.accent} size={24} />
              <Text style={styles.sectionTitle}>Private Events</Text>
            </View>
            <View style={commonStyles.card}>
              <Text style={styles.sectionText}>
                McLoone&apos;s Boathouse is the perfect venue for your special occasions. From intimate gatherings to large celebrations, our waterfront location and dedicated event staff will ensure your event is memorable. Contact us to learn more about our private dining options and event packages.
              </Text>
            </View>
          </View>

          {/* Location & Hours */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="mappin.circle.fill" color={colors.accent} size={24} />
              <Text style={styles.sectionTitle}>Visit Us</Text>
            </View>
            <View style={commonStyles.card}>
              <Text style={styles.locationText}>1 Ocean Avenue</Text>
              <Text style={styles.locationText}>West End, NJ 07740</Text>
              <Text style={styles.locationText}>(732) 555-0123</Text>
              <View style={styles.divider} />
              <Text style={styles.hoursTitle}>Hours</Text>
              <Text style={styles.hoursText}>Monday - Friday: 11:00 AM - 10:00 PM</Text>
              <Text style={styles.hoursText}>Saturday - Sunday: 10:00 AM - 11:00 PM</Text>
            </View>
          </View>
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
  locationText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
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
