
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function MenuEditorScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Menu Editor',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.placeholderContainer}>
            <IconSymbol name="book.fill" color={colors.managerAccent} size={64} />
            <Text style={styles.placeholderTitle}>Menu Editor</Text>
            <Text style={styles.placeholderText}>
              Add, edit, and remove menu items. Update descriptions and prices.
            </Text>
            <Text style={styles.comingSoon}>Coming Soon</Text>
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
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.managerAccent,
    textTransform: 'uppercase',
  },
});
