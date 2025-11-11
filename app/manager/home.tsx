
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { announcements, upcomingShifts } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
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
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" color="#FFFFFF" size={24} />
            </Pressable>
          ),
        }}
      />
      
      <ScrollView style={[commonStyles.employeeContainer, styles.container]}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {user?.name}!</Text>
          <Text style={styles.welcomeSubtitle}>Manager Dashboard</Text>
        </View>

        {/* Menu Data Seeder */}
        <MenuDataSeeder />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/manager/menu-editor')}
            >
              <IconSymbol name="book.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.quickActionText}>Menu Editor</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/manager/weekly-specials-editor')}
            >
              <IconSymbol name="star.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.quickActionText}>Weekly Specials</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/manager/events-editor')}
            >
              <IconSymbol name="calendar" color={colors.managerAccent} size={32} />
              <Text style={styles.quickActionText}>Events</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/manager/employees')}
            >
              <IconSymbol name="person.2.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.quickActionText}>Employees</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/manager/schedule')}
            >
              <IconSymbol name="clock.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.quickActionText}>Schedule</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/manager/announcements')}
            >
              <IconSymbol name="megaphone.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.quickActionText}>Announcements</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/manager/rewards')}
            >
              <IconSymbol name="dollarsign.circle.fill" color={colors.managerAccent} size={32} />
              <Text style={styles.quickActionText}>Rewards</Text>
            </Pressable>
          </View>
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Announcements</Text>
          {announcements.slice(0, 3).map((announcement) => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View style={styles.announcementHeader}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <View style={[
                  styles.priorityBadge,
                  announcement.priority === 'high' && styles.priorityHigh,
                  announcement.priority === 'medium' && styles.priorityMedium,
                  announcement.priority === 'low' && styles.priorityLow,
                ]}>
                  <Text style={styles.priorityText}>{announcement.priority}</Text>
                </View>
              </View>
              <Text style={styles.announcementMessage}>{announcement.message}</Text>
              <Text style={styles.announcementDate}>{announcement.date}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Shifts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
          {upcomingShifts.slice(0, 3).map((shift) => (
            <View key={shift.id} style={styles.shiftCard}>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  logoutButton: {
    padding: 8,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: colors.managerPrimary,
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
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '31%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  announcementCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityHigh: {
    backgroundColor: colors.error,
  },
  priorityMedium: {
    backgroundColor: '#FFA500',
  },
  priorityLow: {
    backgroundColor: colors.managerAccent,
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
    marginBottom: 8,
    lineHeight: 20,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  shiftCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
