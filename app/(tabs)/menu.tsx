
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useMenu, MenuItemWithCategory } from '@/hooks/useMenu';

export default function MenuScreen() {
  const [selectedMeal, setSelectedMeal] = useState<'lunch' | 'dinner'>('lunch');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { items, categories, loading, error } = useMenu(selectedMeal);

  // Get unique categories for the selected meal type
  const availableCategories = categories.filter(cat => 
    cat.meal_type === selectedMeal || cat.meal_type === 'both'
  );

  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category_id === selectedCategory);

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const categoryName = item.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItemWithCategory[]>);

  const getDietaryBadge = (dietaryInfo: string[] | null) => {
    if (!dietaryInfo || dietaryInfo.length === 0) return null;
    
    const badges = dietaryInfo.map(info => {
      switch (info) {
        case 'gf': return 'GF';
        case 'v': return 'V';
        case 'va': return 'VA';
        default: return info.toUpperCase();
      }
    });

    return badges.join(' · ');
  };

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
          <Pressable
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === 'all' && styles.categoryButtonTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          {availableCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Menu Items */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading menu: {error}</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(groupedItems).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No menu items available</Text>
              </View>
            ) : (
              Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
                <View key={categoryName} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{categoryName}</Text>
                  {categoryItems.map((item) => (
                    <View key={item.id} style={commonStyles.card}>
                      <View style={styles.menuItemHeader}>
                        <View style={styles.menuItemTitleContainer}>
                          <Text style={styles.menuItemName}>{item.name}</Text>
                          {item.dietary_info && item.dietary_info.length > 0 && (
                            <Text style={styles.dietaryBadge}>
                              {getDietaryBadge(item.dietary_info)}
                            </Text>
                          )}
                        </View>
                        {item.price && (
                          <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                        )}
                      </View>
                      {item.description && (
                        <Text style={styles.menuItemDescription}>{item.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        )}
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
  menuItemTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dietaryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  menuItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
