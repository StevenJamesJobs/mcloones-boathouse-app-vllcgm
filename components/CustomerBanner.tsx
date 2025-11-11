
import React from 'react';
import { View, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface CustomerBannerProps {
  onLoginPress: () => void;
}

export default function CustomerBanner({ onLoginPress }: CustomerBannerProps) {
  return (
    <View style={styles.banner}>
      <Image 
        source={require('@/assets/images/8802b18f-7c19-4d0c-9e6f-0d6b6ad24453.png')}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
