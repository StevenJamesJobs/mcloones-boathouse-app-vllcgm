
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ToolsScreen() {
  const { user } = useAuth();

  return (
    <>
      <Stack.Screen
        options={{
          title: `${user?.full_name}'s Tools`,
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
