
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { upcomingShifts } from '@/data/mockData';

export default function EmployeeHomeScreen() {
  const { user, logout } = useAuth();
  const { announcements } = useAnnouncements();

  useEffect(() => {
    if (!user || user.role === 'customer') {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Employee Portal',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" color={colors.accent} size={24} />
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
            <Text style={styles.welcomeTitle}>Welcome to McLoone&apos;s Boathouse Deck Team</Text>
            <Text style={styles.welcomeSubtitle}>Let&apos;s get you ready for your next adventure!</Text>
          </View>

          {/* Weather Card */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="cloud.sun.fill" color={colors.employeeAccent} size={24} />
              <Text style={styles.cardTitle}>Today&apos;s Weather</Text>
            </View>
            <Text style={styles.weatherTemp}>{weather.temperature}°F</Text>
            <Text style={styles.weatherCondition}>{weather.condition}</Text>
          </View>

          {/* Upcoming Shifts */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="calendar" color={colors.employeeAccent} size={24} />
              <Text style={styles.cardTitle}>Your Upcoming Shifts</Text>
            </View>
            {upcomingShifts.map((shift) => (
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

          {/* Announcements */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <IconSymbol name="megaphone.fill" color={colors.employeeAccent} size={24} />
              <Text style={styles.cardTitle}>Announcements</Text>
            </View>
            {announcements.length === 0 ? (
              <Text style={styles.noAnnouncementsText}>No announcements at this time</Text>
            ) : (
              announcements.map((announcement) => (
                <View key={announcement.id} style={styles.announcementItem}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(announcement.priority) },
                  ]}>
                    <Text style={styles.priorityText}>
                      {announcement.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementMessage}>{announcement.message}</Text>
                  <Text style={styles.announcementDate}>
                    {new Date(announcement.created_at || '').toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinks}>
            <Pressable
              style={styles.quickLinkButton}
              onPress={() => router.push('/employee/training')}
            >
              <IconSymbol name="book.fill" color={colors.employeeAccent} size={32} />
              <Text style={styles.quickLinkText}>Training</Text>
            </Pressable>
            <Pressable
              style={styles.quickLinkButton}
              onPress={() => router.push('/employee/rewards')}
            >
              <IconSymbol name="star.fill" color={colors.employeeAccent} size={32} />
              <Text style={styles.quickLinkText}>Rewards</Text>
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
    backgroundColor: colors.employeePrimary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
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
    backgroundColor: colors.employeePrimary,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  shiftDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  announcementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noAnnouncementsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  quickLinkButton: {
    flex: 1,
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  quickLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
});
