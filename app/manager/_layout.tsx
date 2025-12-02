
import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function ManagerTabLayout() {
  // Define the tabs configuration for manager portal
  const tabs: TabBarItem[] = [
    {
      name: 'home',
      route: '/manager/home',
      icon: 'house.fill',
      label: 'Welcome',
    },
    {
      name: 'menu',
      route: '/manager/menu',
      icon: 'book.fill',
      label: 'Menus',
    },
    {
      name: 'tools',
      route: '/manager/tools',
      icon: 'wrench.fill',
      label: 'Tools',
    },
    {
      name: 'profile',
      route: '/manager/profile',
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
          <Label>Menus</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tools">
          <Icon sf="wrench.fill" drawable="ic_build" />
          <Label>Tools</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf="person.fill" drawable="ic_person" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
        {/* Hidden screens that shouldn't show in tabs */}
        <NativeTabs.Trigger name="about-us-editor" hidden>
          <Icon sf="info.circle" drawable="ic_info" />
          <Label>About Us</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="announcements-editor" hidden>
          <Icon sf="megaphone" drawable="ic_campaign" />
          <Label>Announcements</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="announcements" hidden>
          <Icon sf="megaphone" drawable="ic_campaign" />
          <Label>Announcements</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="contact-us-editor" hidden>
          <Icon sf="phone" drawable="ic_phone" />
          <Label>Contact Us</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="employees" hidden>
          <Icon sf="person.2" drawable="ic_people" />
          <Label>Employees</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="events-editor" hidden>
          <Icon sf="calendar" drawable="ic_event" />
          <Label>Events</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="full-events" hidden>
          <Icon sf="calendar" drawable="ic_event" />
          <Label>Events</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="gallery-editor" hidden>
          <Icon sf="photo" drawable="ic_photo" />
          <Label>Gallery</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="guides-editor" hidden>
          <Icon sf="book" drawable="ic_menu_book" />
          <Label>Guides</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="inbox" hidden>
          <Icon sf="envelope.fill" drawable="ic_mail" />
          <Label>Inbox</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="menu-editor" hidden>
          <Icon sf="book" drawable="ic_menu" />
          <Label>Menu Editor</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="message-detail" hidden>
          <Icon sf="envelope.fill" drawable="ic_mail" />
          <Label>Message</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="new-message" hidden>
          <Icon sf="envelope.fill" drawable="ic_mail" />
          <Label>New Message</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="reviews-editor" hidden>
          <Icon sf="star" drawable="ic_star" />
          <Label>Reviews</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="rewards" hidden>
          <Icon sf="star" drawable="ic_star" />
          <Label>Rewards</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="schedule" hidden>
          <Icon sf="calendar" drawable="ic_schedule" />
          <Label>Schedule</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="sent-message-detail" hidden>
          <Icon sf="envelope.fill" drawable="ic_mail" />
          <Label>Sent Message</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="special-features-editor" hidden>
          <Icon sf="star" drawable="ic_auto_awesome" />
          <Label>Special Features</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tagline-editor" hidden>
          <Icon sf="text.quote" drawable="ic_edit" />
          <Label>Tagline</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="weekly-specials-editor" hidden>
          <Icon sf="star" drawable="ic_star" />
          <Label>Weekly Specials</Label>
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
        <Stack.Screen name="profile" />
        <Stack.Screen name="about-us-editor" options={{ href: null }} />
        <Stack.Screen name="announcements-editor" options={{ href: null }} />
        <Stack.Screen name="announcements" options={{ href: null }} />
        <Stack.Screen name="contact-us-editor" options={{ href: null }} />
        <Stack.Screen name="employees" options={{ href: null }} />
        <Stack.Screen name="events-editor" options={{ href: null }} />
        <Stack.Screen name="full-events" options={{ href: null }} />
        <Stack.Screen name="gallery-editor" options={{ href: null }} />
        <Stack.Screen name="guides-editor" options={{ href: null }} />
        <Stack.Screen name="inbox" options={{ href: null }} />
        <Stack.Screen name="menu-editor" options={{ href: null }} />
        <Stack.Screen name="message-detail" options={{ href: null }} />
        <Stack.Screen name="new-message" options={{ href: null }} />
        <Stack.Screen name="reviews-editor" options={{ href: null }} />
        <Stack.Screen name="rewards" options={{ href: null }} />
        <Stack.Screen name="schedule" options={{ href: null }} />
        <Stack.Screen name="sent-message-detail" options={{ href: null }} />
        <Stack.Screen name="special-features-editor" options={{ href: null }} />
        <Stack.Screen name="tagline-editor" options={{ href: null }} />
        <Stack.Screen name="weekly-specials-editor" options={{ href: null }} />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
