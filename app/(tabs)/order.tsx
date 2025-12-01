
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Image } from 'react-native';
import { Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useMenu, MenuItemWithCategory } from '@/hooks/useMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OrderScreen() {
  const [selectedTab, setSelectedTab] = useState<'lunch' | 'dinner'>('lunch');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { items, categories, loading, error } = useMenu(selectedTab);
  const insets = useSafeAreaInsets();

  // Filter categories to exclude Wine, Libations, Happy Hour
  const availableCategories = categories.filter(cat => 
    cat.name !== 'Wine' && cat.name !== 'Libations' && cat.name !== 'Happy Hour'
  );

  // Filter items
  const filteredItems = selectedCategory === 'all' 
    ? items.filter(item => {
        const itemCategory = categories.find(cat => cat.id === item.category_id);
        return itemCategory?.name !== 'Wine' && itemCategory?.name !== 'Libations' && itemCategory?.name !== 'Happy Hour';
      })
    : items.filter(item => item.category_id === selectedCategory);

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const groupName = item.category?.name || 'Uncategorized';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(item);
    return acc;
  }, {} as Record<string, MenuItemWithCategory[]>);

  const bannerHeight = insets.top + 60;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[commonStyles.container, styles.container]}>
        {/* Header Banner */}
        <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
          <Image 
            source={require('@/assets/images/08405405-7ef4-4671-9758-a7220430497a.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerRight}>
            <Text style={styles.headerText}>Browse Menu</Text>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.content, { paddingTop: bannerHeight + 8 }]}>
          {/* Meal Type Tabs */}
          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tab, selectedTab === 'lunch' && styles.tabActive]}
              onPress={() => {
                setSelectedTab('lunch');
                setSelectedCategory('all');
              }}
            >
              <Text style={[styles.tabText, selectedTab === 'lunch' && styles.tabTextActive]}>
                Lunch
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === 'dinner' && styles.tabActive]}
              onPress={() => {
                setSelectedTab('dinner');
                setSelectedCategory('all');
              }}
            >
              <Text style={[styles.tabText, selectedTab === 'dinner' && styles.tabTextActive]}>
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
              style={[styles.categoryBox, selectedCategory === 'all' && styles.categoryBoxActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.categoryBoxText, selectedCategory === 'all' && styles.categoryBoxTextActive]}>
                All
              </Text>
            </Pressable>
            {availableCategories.map((category) => (
              <Pressable
                key={category.id}
                style={[styles.categoryBox, selectedCategory === category.id && styles.categoryBoxActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[styles.categoryBoxText, selectedCategory === category.id && styles.categoryBoxTextActive]}>
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
              {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                <View key={groupName} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{groupName}</Text>
                  {groupItems.map((item) => (
                    <View key={item.id} style={commonStyles.card}>
                      <View style={styles.menuItemContent}>
                        {item.image_url && (
                          <Image
                            source={{ uri: item.image_url }}
                            style={styles.menuItemThumbnail}
                            resizeMode="cover"
                          />
                        )}
                        <View style={styles.menuItemDetails}>
                          <View style={styles.menuItemHeader}>
                            <View style={styles.menuItemTitleContainer}>
                              <Text style={styles.menuItemName}>{item.name}</Text>
                            </View>
                            {item.price && (
                              <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                            )}
                          </View>
                          {item.description && (
                            <Text style={styles.menuItemDescription} numberOfLines={3}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
              <View style={styles.bottomPadding} />
            </ScrollView>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
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
    }),
  },
  logo: {
    height: 40,
    width: 200,
  },
  headerRight: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  categoryBox: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBoxActive: {
    backgroundColor: colors.accent,
  },
  categoryBoxText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryBoxTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  scrollContentWithTabBar: {
    paddingBottom: 120,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    gap: 12,
  },
  menuItemThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  menuItemDetails: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  menuItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
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
  bottomPadding: {
    height: 80,
  },
});
