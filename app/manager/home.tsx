
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { announcements, upcomingShifts } from '@/data/mockData';
import { MenuDataSeeder } from '@/components/MenuDataSeeder';

export default function ManagerHomeScreen() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      router.replace('/');
    }
  }, [user]);

  const handleLogout = () => {
    router.replace('/');
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
            <Pressable onPress={handleLogout} style={{ marginRight: 16 }}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" color="#FFFFFF" size={24} />
            </Pressable>
          ),
        }}
      />
      
      <View style={[commonStyles.managerContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={commonStyles.managerCard}>
            <Text style={styles.welcomeText}>Welcome back, Manager!</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          {/* Menu Data Seeder - Remove this after seeding */}
          <MenuDataSeeder />

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <Pressable 
                style={styles.actionCard}
                onPress={() => router.push('/manager/menu-editor')}
              >
                <IconSymbol name="book.fill" color={colors.managerAccent} size={32} />
                <Text style={styles.actionText}>Menu Editor</Text>
              </Pressable>
              <Pressable 
                style={styles.actionCard}
                onPress={() => router.push('/manager/events-editor')}
              >
                <IconSymbol name="calendar" color={colors.managerAccent} size={32} />
                <Text style={styles.actionText}>Events</Text>
              </Pressable>
              <Pressable 
                style={styles.actionCard}
                onPress={() => router.push('/manager/employees')}
              >
                <IconSymbol name="person.2.fill" color={colors.managerAccent} size={32} />
                <Text style={styles.actionText}>Employees</Text>
              </Pressable>
              <Pressable 
                style={styles.actionCard}
                onPress={() => router.push('/manager/schedule')}
              >
                <IconSymbol name="clock.fill" color={colors.managerAccent} size={32} />
                <Text style={styles.actionText}>Schedule</Text>
              </Pressable>
              <Pressable 
                style={styles.actionCard}
                onPress={() => router.push('/manager/announcements')}
              >
                <IconSymbol name="megaphone.fill" color={colors.managerAccent} size={32} />
                <Text style={styles.actionText}>Announcements</Text>
              </Pressable>
              <Pressable 
                style={styles.actionCard}
                onPress={() => router.push('/manager/rewards')}
              >
                <IconSymbol name="star.fill" color={colors.managerAccent} size={32} />
                <Text style={styles.actionText}>Rewards</Text>
              </Pressable>
            </View>
          </View>

          {/* Weather Widget */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Weather</Text>
            <View style={commonStyles.managerCard}>
              <View style={styles.weatherContent}>
                <IconSymbol name="cloud.sun.fill" color={colors.managerAccent} size={48} />
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherTemp}>72°F</Text>
                  <Text style={styles.weatherCondition}>Partly Cloudy</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Announcements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            {announcements.slice(0, 3).map((announcement) => (
              <View key={announcement.id} style={commonStyles.managerCard}>
                <View style={styles.announcementHeader}>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <View style={[
                    styles.priorityBadge,
                    announcement.priority === 'high' && styles.priorityHigh,
                    announcement.priority === 'medium' && styles.priorityMedium,
                  ]}>
                    <Text style={styles.priorityText}>{announcement.priority}</Text>
                  </View>
                </View>
                <Text style={styles.announcementMessage}>{announcement.message}</Text>
                <Text style={styles.announcementDate}>{announcement.date}</Text>
              </View>
            ))}
          </View>

          {/* Upcoming Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
            {upcomingShifts.slice(0, 3).map((shift) => (
              <View key={shift.id} style={commonStyles.managerCard}>
                <View style={styles.shiftHeader}>
                  <Text style={styles.shiftDate}>{shift.date}</Text>
                  <Text style={styles.shiftPosition}>{shift.position}</Text>
                </View>
                <Text style={styles.shiftTime}>
                  {shift.startTime} - {shift.endTime}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.managerBackground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: colors.managerCard,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '31%',
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  weatherCondition: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.textSecondary,
  },
  priorityHigh: {
    backgroundColor: colors.error,
  },
  priorityMedium: {
    backgroundColor: colors.warning,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  announcementMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  shiftPosition: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  shiftTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
