
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { WeatherDisplay } from '@/components/WeatherDisplay';

export default function ManagerHomeScreen() {
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'manager' && user.role !== 'owner_manager'))) {
      router.replace('/(tabs)/(home)/');
    }
  }, [user, isLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      // Force navigation to home page
      setTimeout(() => {
        router.replace('/(tabs)/(home)/');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const managerTools = [
    { id: 1, title: 'Menu Editor', icon: 'fork.knife', androidIcon: 'restaurant', route: '/manager/menu-editor', color: colors.managerAccent },
    { id: 2, title: 'Weekly Specials', icon: 'star.fill', androidIcon: 'star', route: '/manager/weekly-specials-editor', color: colors.managerAccent },
    { id: 3, title: 'Events Editor', icon: 'calendar', androidIcon: 'event', route: '/manager/events-editor', color: colors.managerAccent },
    { id: 4, title: 'Gallery Editor', icon: 'photo.on.rectangle', androidIcon: 'photo_library', route: '/manager/gallery-editor', color: colors.managerAccent },
    { id: 5, title: 'Announcements', icon: 'megaphone.fill', androidIcon: 'campaign', route: '/manager/announcements-editor', color: colors.managerAccent },
    { id: 6, title: 'About Us Editor', icon: 'info.circle.fill', androidIcon: 'info', route: '/manager/about-us-editor', color: colors.managerAccent },
    { id: 7, title: 'Contact Us Editor', icon: 'phone.fill', androidIcon: 'phone', route: '/manager/contact-us-editor', color: colors.managerAccent },
    { id: 8, title: 'Tagline Editor', icon: 'text.quote', androidIcon: 'format_quote', route: '/manager/tagline-editor', color: colors.managerAccent },
    { id: 9, title: 'Reviews Editor', icon: 'star.fill', androidIcon: 'star', route: '/manager/reviews-editor', color: colors.managerAccent },
    { id: 10, title: 'Guides Editor', icon: 'book.closed.fill', androidIcon: 'import_contacts', route: '/manager/guides-editor', color: colors.managerAccent },
    { id: 11, title: 'Employees', icon: 'person.3.fill', androidIcon: 'people', route: '/manager/employees', color: colors.managerSecondary },
    { id: 12, title: 'Schedule', icon: 'calendar.badge.clock', androidIcon: 'schedule', route: '/manager/schedule', color: colors.managerSecondary },
    { id: 13, title: 'Rewards', icon: 'dollarsign.circle.fill', androidIcon: 'attach_money', route: '/manager/rewards', color: colors.managerSecondary },
    { id: 14, title: 'My Profile', icon: 'person.circle.fill', androidIcon: 'account_circle', route: '/manager/profile', color: colors.managerPrimary },
  ];

  if (isLoading) {
    return (
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manager Portal',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          ),
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome, {user?.full_name}!</Text>
            <Text style={styles.welcomeSubtitle}>Manager Dashboard</Text>
          </View>

          {/* Weather Card */}
          <WeatherDisplay variant="manager" />

          {/* Manager Tools */}
          <View style={styles.toolsSection}>
            <Text style={styles.sectionTitle}>Management Tools</Text>
            <View style={styles.toolsGrid}>
              {managerTools.map((tool) => (
                <Pressable
                  key={tool.id}
                  style={[styles.toolCard, { backgroundColor: tool.color }]}
                  onPress={() => router.push(tool.route as any)}
                >
                  <IconSymbol 
                    ios_icon_name={tool.icon as any} 
                    android_material_icon_name={tool.androidIcon} 
                    color="#FFFFFF" 
                    size={32} 
                  />
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  logoutButtonText: {
    color: colors.managerPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: colors.managerPrimary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  toolsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
});
