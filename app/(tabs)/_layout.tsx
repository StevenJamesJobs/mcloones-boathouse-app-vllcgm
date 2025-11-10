
import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  // Define the tabs configuration for customer-facing app
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'house.fill',
      label: 'Welcome',
    },
    {
      name: 'menu',
      route: '/(tabs)/menu',
      icon: 'book.fill',
      label: 'Menu',
    },
    {
      name: 'events',
      route: '/(tabs)/events',
      icon: 'calendar',
      label: 'Events',
    },
    {
      name: 'about',
      route: '/(tabs)/about',
      icon: 'info.circle.fill',
      label: 'About',
    },
    {
      name: 'gallery',
      route: '/(tabs)/gallery',
      icon: 'photo.fill',
      label: 'Gallery',
    },
  ];

  // Use NativeTabs for iOS, custom FloatingTabBar for Android and Web
  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <Icon sf="house.fill" drawable="ic_home" />
          <Label>Welcome</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="menu">
          <Icon sf="book.fill" drawable="ic_menu" />
          <Label>Menu</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="events">
          <Icon sf="calendar" drawable="ic_calendar" />
          <Label>Events</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="about">
          <Icon sf="info.circle.fill" drawable="ic_info" />
          <Label>About</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="gallery">
          <Icon sf="photo.fill" drawable="ic_photo" />
          <Label>Gallery</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // For Android and Web, use Stack navigation with custom floating tab bar
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="events" />
        <Stack.Screen name="about" />
        <Stack.Screen name="gallery" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
