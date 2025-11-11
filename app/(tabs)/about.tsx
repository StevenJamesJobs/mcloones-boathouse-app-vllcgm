
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function AboutScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'About Us',
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
});
