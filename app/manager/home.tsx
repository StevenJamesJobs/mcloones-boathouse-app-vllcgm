
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { MenuDataSeeder } from '@/components/MenuDataSeeder';
import { upcomingShifts } from '@/data/mockData';

export default function ManagerHomeScreen() {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      router.replace('/(tabs)/(home)/');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.replace('/(tabs)/(home)/');
  };

  // Mock weather data
  const weather = {
    temperature: 72,
    condition: 'Partly Cloudy',
  };

  const managerTools = [
    { id: 1, title: 'Menu Editor', icon: 'fork.knife', route: '/manager/menu-editor', color: colors.managerAccent },
    { id: 2, title: 'Weekly Specials', icon: 'star.fill', route: '/manager/weekly-specials-editor', color: colors.managerAccent },
    { id: 3, title: 'Events Editor', icon: 'calendar', route: '/manager/events-editor', color: colors.managerAccent },
    { id: 4, title: 'Announcements', icon: 'megaphone.fill', route: '/manager/announcements-editor', color: colors.managerAccent },
    { id: 5, title: 'About Us Editor', icon: 'info.circle.fill', route: '/manager/about-us-editor', color: colors.managerAccent },
    { id: 6, title: 'Contact Us Editor', icon: 'phone.fill', route: '/manager/contact-us-editor', color: colors.managerAccent },
    { id: 7, title: 'Reviews Editor', icon: 'star.fill', route: '/manager/reviews-editor', color: colors.managerAccent },
    { id: 8, title: 'Employees', icon: 'person.3.fill', route: '/manager/employees', color: colors.managerSecondary },
    { id: 9, title: 'Schedule', icon: 'calendar.badge.clock', route: '/manager/schedule', color: colors.managerSecondary },
    { id: 10, title: 'Rewards', icon: 'dollarsign.circle.fill', route: '/manager/rewards', color: colors.managerSecondary },
  ];

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
              <IconSymbol name="rectangle.portrait.and.arrow.right" color="#FFFFFF" size={24} />
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
            <Text style={styles.welcomeTitle}>Welcome, {user?.name}!</Text>
            <Text style={styles.welcomeSubtitle}>Manager Dashboard</Text>
          </View>

          {/* Menu Data Seeder */}
          <MenuDataSeeder />

          {/* Weather Card */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="cloud.sun.fill" color={colors.managerAccent} size={24} />
              <Text style={styles.cardTitle}>Today&apos;s Weather</Text>
            </View>
            <Text style={styles.weatherTemp}>{weather.temperature}°F</Text>
            <Text style={styles.weatherCondition}>{weather.condition}</Text>
          </View>

          {/* Upcoming Schedule */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="calendar" color={colors.managerAccent} size={24} />
              <Text style={styles.cardTitle}>Upcoming Schedule</Text>
            </View>
            {upcomingShifts.slice(0, 3).map((shift) => (
              <View key={shift.id} style={styles.shiftItem}>
                <View style={styles.shiftDate}>
                  <Text style={styles.shiftDateText}>
                    {new Date(shift.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={styles.shiftDetails}>
                  <Text style={styles.shiftTime}>{shift.startTime} - {shift.endTime}</Text>
                  <Text style={styles.shiftPosition}>{shift.position}</Text>
                </View>
              </View>
            ))}
          </View>

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
                  <IconSymbol name={tool.icon as any} color="#FFFFFF" size={32} />
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
  },
  logoutButton: {
    padding: 8,
    marginRight: 8,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
  },
  weatherCondition: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shiftDate: {
    backgroundColor: colors.managerPrimary,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  shiftDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shiftDetails: {
    flex: 1,
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  shiftPosition: {
    fontSize: 14,
    color: colors.textSecondary,
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
