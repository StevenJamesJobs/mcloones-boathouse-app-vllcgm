
import React from 'react';
import { View, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomerBannerProps {
  onLoginPress: () => void;
}

export default function CustomerBanner({ onLoginPress }: CustomerBannerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
      <Image 
        source={require('@/assets/images/c04edc3f-20ab-4cc0-b4b5-995857d3b5d7.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Pressable onPress={onLoginPress} style={styles.loginButton}>
        <IconSymbol name="person.circle.fill" color={colors.accent} size={32} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  loginButton: {
    padding: 4,
  },
});
