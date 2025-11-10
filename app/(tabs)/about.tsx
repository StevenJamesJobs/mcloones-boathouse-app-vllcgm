
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { aboutUsContent } from '@/data/mockData';

export default function AboutScreen() {
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
        {/* Header for non-iOS */}
        {Platform.OS !== 'ios' && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>About Us</Text>
          </View>
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
            <Text style={styles.heroTitle}>{aboutUsContent.title}</Text>
          </View>

          {/* Description */}
          <View style={commonStyles.card}>
            <Text style={styles.sectionText}>{aboutUsContent.description}</Text>
          </View>

          {/* Mission */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="star.fill" color={colors.accent} size={24} />
              <Text style={styles.sectionTitle}>Our Mission</Text>
            </View>
            <View style={commonStyles.card}>
              <Text style={styles.sectionText}>{aboutUsContent.mission}</Text>
            </View>
          </View>

          {/* History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="book.fill" color={colors.accent} size={24} />
              <Text style={styles.sectionTitle}>Our History</Text>
            </View>
            <View style={commonStyles.card}>
              <Text style={styles.sectionText}>{aboutUsContent.history}</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What Makes Us Special</Text>
            <View style={commonStyles.card}>
              <View style={styles.featureItem}>
                <IconSymbol name="water.waves" color={colors.accent} size={20} />
                <Text style={styles.featureText}>Stunning Waterfront Views</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="fork.knife" color={colors.accent} size={20} />
                <Text style={styles.featureText}>Fresh, Locally-Sourced Ingredients</Text>
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
                <Text style={styles.featureText}>Extensive Wine Selection</Text>
              </View>
            </View>
          </View>

          {/* Awards */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="trophy.fill" color={colors.accent} size={24} />
              <Text style={styles.sectionTitle}>Awards & Recognition</Text>
            </View>
            <View style={commonStyles.card}>
              <Text style={styles.awardText}>🏆 Best Waterfront Dining - Jersey Shore Magazine (2023)</Text>
              <Text style={styles.awardText}>🏆 Top 10 Seafood Restaurants - NJ Monthly (2022)</Text>
              <Text style={styles.awardText}>🏆 Best Outdoor Dining - Local Choice Awards (2021)</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
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
  awardText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
});
