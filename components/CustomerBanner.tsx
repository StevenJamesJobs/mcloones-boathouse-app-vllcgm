
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface CustomerBannerProps {
  onLoginPress: () => void;
}

export default function CustomerBanner({ onLoginPress }: CustomerBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>McLoone&apos;s Boathouse</Text>
      <Pressable onPress={onLoginPress} style={styles.loginButton}>
        <IconSymbol name="person.circle.fill" color={colors.accent} size={28} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  loginButton: {
    padding: 4,
  },
});
