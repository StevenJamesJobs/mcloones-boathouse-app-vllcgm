
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ToolsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bannerHeight = insets.top + 60;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tools',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
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

          {/* Tools Grid */}
          <View style={styles.toolsGrid}>
            <Pressable
              style={styles.toolCard}
              onPress={() => router.push('/employee/training')}
            >
              <MaterialIcons name="menu-book" size={48} color={colors.employeeAccent} />
              <Text style={styles.toolTitle}>Guides & Training</Text>
              <Text style={styles.toolDescription}>
                Access training materials, guides, and handbooks
              </Text>
            </Pressable>

            <Pressable
              style={styles.toolCard}
              onPress={() => router.push('/employee/checkouts')}
            >
              <MaterialIcons name="calculate" size={48} color={colors.employeeAccent} />
              <Text style={styles.toolTitle}>Check Outs</Text>
              <Text style={styles.toolDescription}>
                Calculate your end-of-shift check out totals
              </Text>
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
    backgroundColor: colors.employeeBackground,
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
  toolsGrid: {
    gap: 16,
  },
  toolCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  toolTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
