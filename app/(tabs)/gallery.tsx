
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function GalleryScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Gallery',
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
          <View style={styles.placeholderContainer}>
            <IconSymbol name="photo.fill" color={colors.accent} size={64} />
            <Text style={styles.placeholderTitle}>Gallery Coming Soon</Text>
            <Text style={styles.placeholderText}>
              We&apos;re working on adding beautiful photos of our restaurant, food, and events. Check back soon!
            </Text>
          </View>

          <View style={commonStyles.card}>
            <Text style={styles.infoText}>
              In the meantime, follow us on social media to see the latest photos and updates from McLoone&apos;s Boathouse!
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
});
