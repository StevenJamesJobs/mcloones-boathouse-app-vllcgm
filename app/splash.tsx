
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Check for remembered credentials and navigate after animation
    const checkRememberedLogin = async () => {
      try {
        const rememberMe = await AsyncStorage.getItem('rememberMe');
        const savedUsername = await AsyncStorage.getItem('savedUsername');
        
        // Wait for animation to complete (2 seconds)
        setTimeout(() => {
          if (rememberMe === 'true' && savedUsername) {
            // Navigate to login with pre-filled username
            router.replace('/login');
          } else {
            // Navigate to login screen
            router.replace('/login');
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking remembered login:', error);
        // Navigate to login on error
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      }
    };

    checkRememberedLogin();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('@/assets/images/faa19c24-d5ef-4914-b37d-27257aff5936.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.8,
    height: height * 0.4,
    maxWidth: 400,
    maxHeight: 300,
  },
});
