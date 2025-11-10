
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { lunchMenuItems, dinnerMenuItems } from '@/data/mockData';
import { MenuItem } from '@/types';

export default function MenuScreen() {
  const [selectedMeal, setSelectedMeal] = useState<'lunch' | 'dinner'>('lunch');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentMenuItems = selectedMeal === 'lunch' ? lunchMenuItems : dinnerMenuItems;
  
  // Get unique categories
  const categories = ['all', ...Array.from(new Set(currentMenuItems.map(item => item.category)))];
  
  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? currentMenuItems 
    : currentMenuItems.filter(item => item.category === selectedCategory);

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Menu',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
      )}
      
      <View style={[commonStyles.container, styles.container]}>
        {/* Header for non-iOS */}
        {Platform.OS !== 'ios' && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
          </View>
        )}

        {/* Meal Type Selector */}
        <View style={styles.mealSelector}>
          <Pressable
            style={[
              styles.mealButton,
              selectedMeal === 'lunch' && styles.mealButtonActive,
            ]}
            onPress={() => {
              setSelectedMeal('lunch');
              setSelectedCategory('all');
            }}
          >
            <Text
              style={[
                styles.mealButtonText,
                selectedMeal === 'lunch' && styles.mealButtonTextActive,
              ]}
            >
              Lunch
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.mealButton,
              selectedMeal === 'dinner' && styles.mealButtonActive,
            ]}
            onPress={() => {
              setSelectedMeal('dinner');
              setSelectedCategory('all');
            }}
          >
            <Text
              style={[
                styles.mealButtonText,
                selectedMeal === 'dinner' && styles.mealButtonTextActive,
              ]}
            >
              Dinner
            </Text>
          </Pressable>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Menu Items */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {items.map((item) => (
                <View key={item.id} style={commonStyles.card}>
                  <View style={styles.menuItemHeader}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  mealSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  mealButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  mealButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  mealButtonTextActive: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginLeft: 12,
  },
  menuItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
