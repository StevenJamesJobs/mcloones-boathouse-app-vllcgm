
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabType = 'employee' | 'management';

export default function ManagerToolsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bannerHeight = insets.top + 60;
  const [activeTab, setActiveTab] = useState<TabType>('employee');

  const employeeTools = [
    { id: 1, title: 'Menu Editor', icon: 'restaurant', route: '/manager/menu-editor', color: colors.managerAccent },
    { id: 2, title: 'Weekly Specials Editor', icon: 'star', route: '/manager/weekly-specials-editor', color: colors.managerAccent },
    { id: 3, title: 'Events Editor', icon: 'event', route: '/manager/events-editor', color: colors.managerAccent },
    { id: 4, title: 'Special Features', icon: 'auto-awesome', route: '/manager/special-features-editor', color: colors.managerAccent },
    { id: 5, title: 'Reviews Editor', icon: 'star', route: '/manager/reviews-editor', color: colors.managerAccent },
  ];

  const managementTools = [
    { id: 1, title: 'Employees', icon: 'people', route: '/manager/employees', color: colors.managerSecondary },
    { id: 2, title: 'Announcements', icon: 'campaign', route: '/manager/announcements-editor', color: colors.managerSecondary },
    { id: 3, title: 'Rewards', icon: 'attach-money', route: '/manager/rewards', color: colors.managerSecondary },
    { id: 4, title: 'Schedules', icon: 'schedule', route: '/manager/schedule', color: colors.managerSecondary },
    { id: 5, title: 'Check Outs', icon: 'calculate', route: '/employee/checkouts', color: colors.managerSecondary },
  ];

  const currentTools = activeTab === 'employee' ? employeeTools : managementTools;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tools',
          headerStyle: {
            backgroundColor: colors.managerBackground,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={[commonStyles.managerContainer, styles.container]}>
        {/* Floating Header Banner */}
        <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
          <Image 
            source={require('@/assets/images/08405405-7ef4-4671-9758-a7220430497a.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.bannerTitle}>Tools</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: bannerHeight + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerTitle}>{user?.full_name}&apos;s Tools</Text>

          {/* Guides and Training - Elongated Tile */}
          <Pressable
            style={styles.guidesButton}
            onPress={() => router.push('/employee/training' as any)}
          >
            <MaterialIcons name="menu-book" size={32} color={colors.managerAccent} />
            <Text style={styles.guidesButtonText}>Guides & Training</Text>
          </Pressable>

          {/* Management Tools Section */}
          <View style={styles.toolsSection}>
            <Text style={styles.toolsSectionTitle}>Management Tools</Text>
            
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, activeTab === 'employee' && styles.tabActive]}
                onPress={() => setActiveTab('employee')}
              >
                <MaterialIcons 
                  name="storefront" 
                  size={20} 
                  color={activeTab === 'employee' ? '#FFFFFF' : colors.text} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'employee' && styles.tabTextActive
                ]}>
                  Employee Tools
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === 'management' && styles.tabActive]}
                onPress={() => setActiveTab('management')}
              >
                <MaterialIcons 
                  name="people" 
                  size={20} 
                  color={activeTab === 'management' ? '#FFFFFF' : colors.text} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'management' && styles.tabTextActive
                ]}>
                  Management Tools
                </Text>
              </Pressable>
            </View>

            {/* Tools Grid */}
            <View style={styles.toolsGrid}>
              {currentTools.map((tool) => (
                <Pressable
                  key={tool.id}
                  style={[styles.toolCard, { backgroundColor: tool.color }]}
                  onPress={() => router.push(tool.route as any)}
                >
                  <MaterialIcons name={tool.icon as any} color="#FFFFFF" size={28} />
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
    backgroundColor: colors.managerBackground,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.managerBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  logo: {
    height: 40,
    width: 200,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  guidesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.managerCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    gap: 12,
  },
  guidesButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  toolsSection: {
    marginTop: 8,
  },
  toolsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.managerCard,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.managerAccent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolCard: {
    width: '48%',
    aspectRatio: 2,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
});
