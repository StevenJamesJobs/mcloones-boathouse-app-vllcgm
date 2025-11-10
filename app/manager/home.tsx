
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { announcements, upcomingShifts } from '@/data/mockData';

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
            <Text style={styles.welcomeTitle}>Welcome, {user?.name}</Text>
            <Text style={styles.welcomeSubtitle}>Manager Dashboard</Text>
          </View>

          {/* Weather Card */}
          <View style={styles.managerCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="cloud.sun.fill" color={colors.managerAccent} size={24} />
              <Text style={styles.cardTitle}>Today&apos;s Weather</Text>
            </View>
            <Text style={styles.weatherTemp}>{weather.temperature}°F</Text>
            <Text style={styles.weatherCondition}>{weather.condition}</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <IconSymbol name="person.3.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Employees</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="calendar" color={colors.managerAccent} size={32} />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Today&apos;s Shifts</Text>
            </View>
          </View>

          {/* Announcements */}
          <View style={styles.managerCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="megaphone.fill" color={colors.managerAccent} size={24} />
              <Text style={styles.cardTitle}>Recent Announcements</Text>
            </View>
            {announcements.slice(0, 2).map((announcement) => (
              <View key={announcement.id} style={styles.announcementItem}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementMessage} numberOfLines={2}>
                  {announcement.message}
                </Text>
              </View>
            ))}
          </View>

          {/* Management Tools */}
          <Text style={styles.sectionTitle}>Management Tools</Text>
          <View style={styles.toolsGrid}>
            <Pressable
              style={styles.toolButton}
              onPress={() => router.push('/manager/employees')}
            >
              <IconSymbol name="person.2.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.toolText}>Employees</Text>
            </Pressable>
            <Pressable
              style={styles.toolButton}
              onPress={() => router.push('/manager/schedule')}
            >
              <IconSymbol name="calendar" color={colors.managerAccent} size={32} />
              <Text style={styles.toolText}>Schedule</Text>
            </Pressable>
            <Pressable
              style={styles.toolButton}
              onPress={() => router.push('/manager/menu-editor')}
            >
              <IconSymbol name="book.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.toolText}>Menu</Text>
            </Pressable>
            <Pressable
              style={styles.toolButton}
              onPress={() => router.push('/manager/events-editor')}
            >
              <IconSymbol name="calendar.badge.plus" color={colors.managerAccent} size={32} />
              <Text style={styles.toolText}>Events</Text>
            </Pressable>
            <Pressable
              style={styles.toolButton}
              onPress={() => router.push('/manager/announcements')}
            >
              <IconSymbol name="megaphone.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.toolText}>Announce</Text>
            </Pressable>
            <Pressable
              style={styles.toolButton}
              onPress={() => router.push('/manager/rewards')}
            >
              <IconSymbol name="star.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.toolText}>Rewards</Text>
            </Pressable>
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
    color: '#E0E0E0',
  },
  managerCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  announcementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  announcementMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolButton: {
    width: '31%',
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  toolText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
});
