
import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function EmployeeTabLayout() {
  // Define the tabs configuration for employee portal
  const tabs: TabBarItem[] = [
    {
      name: 'home',
      route: '/employee/home',
      icon: 'house.fill',
      label: 'Welcome',
    },
    {
      name: 'menu',
      route: '/employee/menu',
      icon: 'book.fill',
      label: 'Menu',
    },
    {
      name: 'tools',
      route: '/employee/tools',
      icon: 'wrench.fill',
      label: 'Tools',
    },
    {
      name: 'rewards-and-reviews',
      route: '/employee/rewards-and-reviews',
      icon: 'star.fill',
      label: 'Reviews',
    },
    {
      name: 'profile',
      route: '/employee/profile',
      icon: 'person.fill',
      label: 'Profile',
    },
  ];

  // Use NativeTabs for iOS, custom FloatingTabBar for Android and Web
  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="home">
          <Icon sf="house.fill" drawable="ic_home" />
          <Label>Welcome</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="menu">
          <Icon sf="book.fill" drawable="ic_menu" />
          <Label>Menu</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tools">
          <Icon sf="wrench.fill" drawable="ic_build" />
          <Label>Tools</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="rewards-and-reviews">
          <Icon sf="star.fill" drawable="ic_star" />
          <Label>Reviews</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf="person.fill" drawable="ic_person" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
        {/* Hidden screens that shouldn't show in tabs */}
        <NativeTabs.Trigger name="training" hidden>
          <Icon sf="book.fill" drawable="ic_menu_book" />
          <Label>Training</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="checkouts" hidden>
          <Icon sf="calculator" drawable="ic_calculate" />
          <Label>Checkouts</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="rewards" hidden>
          <Icon sf="star.fill" drawable="ic_star" />
          <Label>Rewards</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="inbox" hidden>
          <Icon sf="envelope.fill" drawable="ic_mail" />
          <Label>Inbox</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="message-detail" hidden>
          <Icon sf="envelope.fill" drawable="ic_mail" />
          <Label>Message</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="sent-message-detail" hidden>
          <Icon sf="envelope.fill" drawable="ic_mail" />
          <Label>Sent Message</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="new-message" hidden>
          <Icon sf="envelope.fill" drawable="ic_mail" />
          <Label>New Message</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="full-events" hidden>
          <Icon sf="calendar" drawable="ic_calendar" />
          <Label>Events</Label>
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
        <Stack.Screen name="home" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="tools" />
        <Stack.Screen name="rewards-and-reviews" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="training" options={{ href: null }} />
        <Stack.Screen name="checkouts" options={{ href: null }} />
        <Stack.Screen name="rewards" options={{ href: null }} />
        <Stack.Screen name="inbox" options={{ href: null }} />
        <Stack.Screen name="message-detail" options={{ href: null }} />
        <Stack.Screen name="sent-message-detail" options={{ href: null }} />
        <Stack.Screen name="new-message" options={{ href: null }} />
        <Stack.Screen name="full-events" options={{ href: null }} />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
