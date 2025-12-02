
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useMenu, MenuItemWithCategory } from '@/hooks/useMenu';
import { useWeeklySpecials } from '@/hooks/useWeeklySpecials';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { SwipeableImageModal } from '@/components/SwipeableImageModal';

export default function ManagerMenuScreen() {
  // Set default to 'specials' (Weekly Specials)
  const [selectedTab, setSelectedTab] = useState<'specials' | 'lunch' | 'dinner' | 'happyhour' | 'libations' | 'wine'>('specials');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dropdownVisible, setDropdownVisible] = useState(true); // Auto-open dropdown on first visit
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const { items, categories, loading, error } = useMenu(
    selectedTab === 'specials' ? 'lunch' : 
    selectedTab === 'wine' || selectedTab === 'libations' || selectedTab === 'happyhour' ? 'both' : 
    selectedTab
  );
  const { specials, loading: specialsLoading } = useWeeklySpecials();
  const insets = useSafeAreaInsets();

  // Get unique categories for the selected meal type
  const availableCategories = categories.filter(cat => {
    if (selectedTab === 'wine') return cat.name === 'Wine';
    if (selectedTab === 'libations') return cat.name === 'Libations';
    if (selectedTab === 'happyhour') return cat.name === 'Happy Hour';
    // Exclude Wine, Libations, and Happy Hour from Lunch/Dinner tabs
    if (selectedTab === 'lunch' || selectedTab === 'dinner') {
      return cat.name !== 'Wine' && cat.name !== 'Libations' && cat.name !== 'Happy Hour' && 
             (cat.meal_type === selectedTab || cat.meal_type === 'both');
    }
    return cat.meal_type === selectedTab || cat.meal_type === 'both';
  });

  // Filter items by category
  const filteredItems = selectedTab === 'wine' || selectedTab === 'libations' || selectedTab === 'happyhour'
    ? items.filter(item => {
        const categoryMatch = availableCategories.some(cat => cat.id === item.category_id);
        return categoryMatch && (selectedCategory === 'all' || item.subcategory === selectedCategory);
      })
    : selectedCategory === 'all' 
      ? items.filter(item => {
          // Exclude Wine, Libations, and Happy Hour items from Lunch/Dinner tabs
          if (selectedTab === 'lunch' || selectedTab === 'dinner') {
            const itemCategory = categories.find(cat => cat.id === item.category_id);
            return itemCategory?.name !== 'Wine' && itemCategory?.name !== 'Libations' && itemCategory?.name !== 'Happy Hour';
          }
          return true;
        })
      : items.filter(item => {
          const categoryMatch = item.category_id === selectedCategory;
          // Exclude Wine, Libations, and Happy Hour items from Lunch/Dinner tabs
          if (selectedTab === 'lunch' || selectedTab === 'dinner') {
            const itemCategory = categories.find(cat => cat.id === item.category_id);
            return categoryMatch && itemCategory?.name !== 'Wine' && itemCategory?.name !== 'Libations' && itemCategory?.name !== 'Happy Hour';
          }
          return categoryMatch;
        });

  // Group items by subcategory for Wine/Libations/Happy Hour, or by category for others
  const groupedItems = filteredItems.reduce((acc, item) => {
    let groupName = '';
    if (selectedTab === 'wine' || selectedTab === 'libations' || selectedTab === 'happyhour') {
      groupName = item.subcategory || 'Other';
    } else {
      groupName = item.category?.name || 'Uncategorized';
    }
    
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(item);
    return acc;
  }, {} as Record<string, MenuItemWithCategory[]>);

  // Get unique subcategories for Wine/Libations/Happy Hour
  const subcategories = selectedTab === 'wine' || selectedTab === 'libations' || selectedTab === 'happyhour'
    ? Array.from(new Set(filteredItems.map(item => item.subcategory).filter(Boolean)))
    : [];

  const getDietaryBadge = (dietaryInfo: string[] | null) => {
    if (!dietaryInfo || dietaryInfo.length === 0) return null;
    
    const badges = dietaryInfo.map(info => {
      switch (info) {
        case 'gf': return 'GF';
        case 'gfa': return 'GFA';
        case 'v': return 'V';
        case 'va': return 'VA';
        default: return info.toUpperCase();
      }
    });

    return badges.join(' · ');
  };

  const getCategoryLabel = () => {
    switch (selectedTab) {
      case 'specials': return 'Weekly Specials';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'happyhour': return 'Happy Hour';
      case 'libations': return 'Libations';
      case 'wine': return 'Wine';
      default: return 'Select Category';
    }
  };

  const bannerHeight = insets.top + 60;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Menu',
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
          <Text style={styles.bannerTitle}>Menu</Text>
        </View>

        {/* Content with top padding */}
        <View style={[styles.content, { paddingTop: bannerHeight + 8 }]}>
          {/* Category Dropdown Selector */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.selectMenuText}>Select a menu</Text>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={styles.dropdownButtonText}>{getCategoryLabel()}</Text>
              <IconSymbol 
                ios_icon_name={dropdownVisible ? "chevron.up" : "chevron.down"}
                android_material_icon_name={dropdownVisible ? "expand_less" : "expand_more"}
                size={24} 
                color={colors.text} 
              />
            </Pressable>

            {dropdownVisible && (
              <View style={styles.dropdownMenu}>
                <Pressable
                  style={[styles.dropdownItem, selectedTab === 'specials' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedTab('specials');
                    setSelectedCategory('all');
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedTab === 'specials' && styles.dropdownItemTextActive]}>
                    Weekly Specials
                  </Text>
                  {selectedTab === 'specials' && (
                    <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color={colors.managerAccent} />
                  )}
                </Pressable>
                <Pressable
                  style={[styles.dropdownItem, selectedTab === 'lunch' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedTab('lunch');
                    setSelectedCategory('all');
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedTab === 'lunch' && styles.dropdownItemTextActive]}>
                    Lunch
                  </Text>
                  {selectedTab === 'lunch' && (
                    <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color={colors.managerAccent} />
                  )}
                </Pressable>
                <Pressable
                  style={[styles.dropdownItem, selectedTab === 'dinner' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedTab('dinner');
                    setSelectedCategory('all');
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedTab === 'dinner' && styles.dropdownItemTextActive]}>
                    Dinner
                  </Text>
                  {selectedTab === 'dinner' && (
                    <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color={colors.managerAccent} />
                  )}
                </Pressable>
                <Pressable
                  style={[styles.dropdownItem, selectedTab === 'happyhour' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedTab('happyhour');
                    setSelectedCategory('all');
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedTab === 'happyhour' && styles.dropdownItemTextActive]}>
                    Happy Hour
                  </Text>
                  {selectedTab === 'happyhour' && (
                    <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color={colors.managerAccent} />
                  )}
                </Pressable>
                <Pressable
                  style={[styles.dropdownItem, selectedTab === 'libations' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedTab('libations');
                    setSelectedCategory('all');
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedTab === 'libations' && styles.dropdownItemTextActive]}>
                    Libations
                  </Text>
                  {selectedTab === 'libations' && (
                    <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color={colors.managerAccent} />
                  )}
                </Pressable>
                <Pressable
                  style={[styles.dropdownItem, selectedTab === 'wine' && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedTab('wine');
                    setSelectedCategory('all');
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedTab === 'wine' && styles.dropdownItemTextActive]}>
                    Wine
                  </Text>
                  {selectedTab === 'wine' && (
                    <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color={colors.managerAccent} />
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* Subcategory Filter - Only show for Wine/Libations/Happy Hour */}
          {(selectedTab === 'wine' || selectedTab === 'libations' || selectedTab === 'happyhour') && subcategories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              <Pressable
                style={[
                  styles.categoryBox,
                  selectedCategory === 'all' && styles.categoryBoxActive,
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text
                  style={[
                    styles.categoryBoxText,
                    selectedCategory === 'all' && styles.categoryBoxTextActive,
                  ]}
                  numberOfLines={1}
                >
                  All
                </Text>
              </Pressable>
              {subcategories.map((subcategory) => (
                <Pressable
                  key={subcategory}
                  style={[
                    styles.categoryBox,
                    selectedCategory === subcategory && styles.categoryBoxActive,
                  ]}
                  onPress={() => setSelectedCategory(subcategory as string)}
                >
                  <Text
                    style={[
                      styles.categoryBoxText,
                      selectedCategory === subcategory && styles.categoryBoxTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {subcategory}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Category Filter - Only show for Lunch/Dinner */}
          {selectedTab !== 'specials' && selectedTab !== 'wine' && selectedTab !== 'libations' && selectedTab !== 'happyhour' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              <Pressable
                style={[
                  styles.categoryBox,
                  selectedCategory === 'all' && styles.categoryBoxActive,
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text
                  style={[
                    styles.categoryBoxText,
                    selectedCategory === 'all' && styles.categoryBoxTextActive,
                  ]}
                  numberOfLines={1}
                >
                  All
                </Text>
              </Pressable>
              {availableCategories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryBox,
                    selectedCategory === category.id && styles.categoryBoxActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryBoxText,
                      selectedCategory === category.id && styles.categoryBoxTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {category.name || 'Unnamed'}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Content */}
          {selectedTab === 'specials' ? (
            // Weekly Specials Content
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
              ]}
              showsVerticalScrollIndicator={false}
            >
              {specialsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.managerAccent} />
                  <Text style={styles.loadingText}>Loading specials...</Text>
                </View>
              ) : specials.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No weekly specials at this time</Text>
                </View>
              ) : (
                specials.map((special) => (
                  <View key={special.id} style={commonStyles.managerCard}>
                    <View style={styles.menuItemContent}>
                      {special.image_url && (
                        <Pressable onPress={() => setExpandedImage(special.image_url)}>
                          <Image
                            source={{ uri: special.image_url }}
                            style={styles.menuItemThumbnail}
                            resizeMode="cover"
                          />
                        </Pressable>
                      )}
                      <View style={styles.menuItemDetails}>
                        <View style={styles.menuItemHeader}>
                          <View style={styles.menuItemTitleContainer}>
                            <Text style={styles.menuItemName}>{special.title}</Text>
                          </View>
                          {special.price && (
                            <Text style={styles.menuItemPrice}>${special.price.toFixed(2)}</Text>
                          )}
                        </View>
                        {special.description && (
                          <Text style={styles.menuItemDescription}>{special.description}</Text>
                        )}
                        {special.valid_until && (
                          <Text style={styles.specialValidUntil}>
                            Valid until {new Date(special.valid_until).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              )}
              {/* Bottom Padding */}
              <View style={styles.bottomPadding} />
            </ScrollView>
          ) : (
            // Menu Items Content
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.managerAccent} />
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
                  Object.entries(groupedItems).map(([groupName, groupItems]) => (
                    <View key={groupName} style={styles.categorySection}>
                      <Text style={styles.categoryTitle}>{groupName}</Text>
                      {groupItems.map((item) => (
                        <View key={item.id} style={commonStyles.managerCard}>
                          <View style={styles.menuItemContent}>
                            {item.image_url && (
                              <Pressable onPress={() => setExpandedImage(item.image_url)}>
                                <Image
                                  source={{ uri: item.image_url }}
                                  style={styles.menuItemThumbnail}
                                  resizeMode="cover"
                                />
                              </Pressable>
                            )}
                            <View style={styles.menuItemDetails}>
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
                          </View>
                        </View>
                      ))}
                    </View>
                  ))
                )}
                {/* Bottom Padding */}
                <View style={styles.bottomPadding} />
              </ScrollView>
            )
          )}
        </View>

        {/* Expanded Image Modal with Swipe-Down Gesture */}
        <SwipeableImageModal
          visible={expandedImage !== null}
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
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
  content: {
    flex: 1,
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.managerBackground,
    zIndex: 1000,
  },
  selectMenuText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.managerCard,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dropdownMenu: {
    backgroundColor: colors.managerCard,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemActive: {
    backgroundColor: colors.managerAccent + '10',
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: colors.managerAccent,
  },
  categoryScroll: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.managerBackground,
  },
  categoryScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
    alignItems: 'center',
  },
  categoryBox: {
    minWidth: 100,
    height: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.managerCard,
    borderWidth: 2,
    borderColor: colors.managerAccent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryBoxActive: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryBoxText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  categoryBoxTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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
    fontSize: 22,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dietaryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.managerAccent,
    letterSpacing: 0.5,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.managerAccent,
  },
  menuItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  specialValidUntil: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomPadding: {
    height: 80,
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
