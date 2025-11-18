
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { WeatherDisplay } from '@/components/WeatherDisplay';

export default function EmployeeHomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const { announcements } = useAnnouncements();

  useEffect(() => {
    if (!isLoading && (!user || user.role === 'customer')) {
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
          title: 'Employee Portal',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
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
            <Text style={styles.welcomeTitle}>Boathouse Deck Team</Text>
            <Text style={styles.welcomeSubtitle}>What is on the menu today for you?</Text>
          </View>

          {/* Weather Card */}
          <WeatherDisplay variant="employee" />

          {/* Announcements */}
          <View style={commonStyles.employeeCard}>
            <View style={styles.cardHeader}>
              <IconSymbol 
                ios_icon_name="megaphone.fill" 
                android_material_icon_name="campaign" 
                color={colors.employeeAccent} 
                size={24} 
              />
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
              <IconSymbol 
                ios_icon_name="book.closed.fill" 
                android_material_icon_name="import_contacts" 
                color="#3289a8" 
                size={48} 
              />
              <Text style={styles.quickLinkText}>Guides & Training</Text>
            </Pressable>
            <Pressable
              style={styles.quickLinkButton}
              onPress={() => router.push('/employee/rewards')}
            >
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                color="#3289a8" 
                size={48} 
              />
              <Text style={styles.quickLinkText}>Rewards</Text>
            </Pressable>
          </View>

          {/* Profile Link */}
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/employee/profile')}
          >
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="account_circle" 
              color="#3289a8" 
              size={32} 
            />
            <Text style={styles.profileButtonText}>My Profile</Text>
          </Pressable>
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
    backgroundColor: colors.employeeAccent,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    gap: 12,
  },
  quickLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    gap: 12,
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
