
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Modal, TextInput, Alert, Image, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import CustomerBanner from '@/components/CustomerBanner';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useMenu, MenuItemWithCategory } from '@/hooks/useMenu';
import { useWeeklySpecials } from '@/hooks/useWeeklySpecials';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function MenuScreen() {
  const [selectedTab, setSelectedTab] = useState<'wine' | 'libations' | 'lunch' | 'dinner' | 'specials'>('wine');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { items, categories, loading, error } = useMenu(selectedTab === 'specials' ? 'lunch' : selectedTab === 'wine' || selectedTab === 'libations' ? 'both' : selectedTab);
  const { specials, loading: specialsLoading } = useWeeklySpecials();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  // Get unique categories for the selected meal type
  const availableCategories = categories.filter(cat => {
    if (selectedTab === 'wine') return cat.name === 'Wine';
    if (selectedTab === 'libations') return cat.name === 'Libations';
    return cat.meal_type === selectedTab || cat.meal_type === 'both';
  });

  // Filter items by category
  const filteredItems = selectedTab === 'wine' || selectedTab === 'libations'
    ? items.filter(item => {
        const categoryMatch = availableCategories.some(cat => cat.id === item.category_id);
        return categoryMatch && (selectedCategory === 'all' || item.subcategory === selectedCategory);
      })
    : selectedCategory === 'all' 
      ? items 
      : items.filter(item => item.category_id === selectedCategory);

  // Group items by subcategory for Wine/Libations, or by category for others
  const groupedItems = filteredItems.reduce((acc, item) => {
    let groupName = '';
    if (selectedTab === 'wine' || selectedTab === 'libations') {
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

  // Get unique subcategories for Wine/Libations
  const subcategories = selectedTab === 'wine' || selectedTab === 'libations'
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      setLoginModalVisible(false);
      setEmail('');
      setPassword('');
      
      if (result.user?.role === 'manager') {
        router.replace('/manager/home');
      } else if (result.user?.role === 'employee') {
        router.replace('/employee/home');
      }
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  const handleDoorDashPress = () => {
    const doorDashUrl = 'https://www.doordash.com/store/24675054?utm_source=mx_share&aw=wex0tknQ360rlun_';
    Linking.openURL(doorDashUrl).catch(err => {
      console.error('Failed to open DoorDash link:', err);
      Alert.alert('Error', 'Could not open DoorDash link');
    });
  };

  const bannerHeight = insets.top + 60;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[commonStyles.container, styles.container]}>
        {/* Custom Header with DoorDash Button */}
        <View style={[styles.customHeader, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Menu</Text>
            <Pressable style={styles.doorDashHeaderButton} onPress={handleDoorDashPress}>
              <IconSymbol 
                ios_icon_name="bag.fill" 
                android_material_icon_name="shopping_bag" 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.doorDashHeaderButtonText}>Order on DoorDash</Text>
            </Pressable>
          </View>
        </View>

        {/* Content with top padding */}
        <View style={[styles.content, { paddingTop: 8 }]}>
          {/* Tab Selector - Wine, Libations, Lunch, Dinner, Weekly Specials */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabSelector}
          >
            <Pressable
              style={[
                styles.tabButton,
                selectedTab === 'wine' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setSelectedTab('wine');
                setSelectedCategory('all');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'wine' && styles.tabButtonTextActive,
                ]}
              >
                Wine
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                selectedTab === 'libations' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setSelectedTab('libations');
                setSelectedCategory('all');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'libations' && styles.tabButtonTextActive,
                ]}
              >
                Libations
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                selectedTab === 'lunch' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setSelectedTab('lunch');
                setSelectedCategory('all');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'lunch' && styles.tabButtonTextActive,
                ]}
              >
                Lunch
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                selectedTab === 'dinner' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setSelectedTab('dinner');
                setSelectedCategory('all');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'dinner' && styles.tabButtonTextActive,
                ]}
              >
                Dinner
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                selectedTab === 'specials' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setSelectedTab('specials');
                setSelectedCategory('all');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'specials' && styles.tabButtonTextActive,
                ]}
              >
                Specials
              </Text>
            </Pressable>
          </ScrollView>

          {/* Subcategory Filter - Only show for Wine/Libations */}
          {(selectedTab === 'wine' || selectedTab === 'libations') && subcategories.length > 0 && (
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
                  >
                    {subcategory}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Category Filter - Only show for Lunch/Dinner */}
          {selectedTab !== 'specials' && selectedTab !== 'wine' && selectedTab !== 'libations' && (
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
                  <ActivityIndicator size="large" color={colors.accent} />
                  <Text style={styles.loadingText}>Loading specials...</Text>
                </View>
              ) : specials.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No weekly specials at this time</Text>
                </View>
              ) : (
                specials.map((special) => (
                  <View key={special.id} style={commonStyles.card}>
                    <View style={styles.menuItemContent}>
                      {special.image_url && (
                        <Image
                          source={{ uri: special.image_url }}
                          style={styles.menuItemThumbnail}
                          resizeMode="cover"
                        />
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
            </ScrollView>
          ) : (
            // Menu Items Content
            loading ? (
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
                  Object.entries(groupedItems).map(([groupName, groupItems]) => (
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
              </ScrollView>
            )
          )}
        </View>

        {/* Login Modal */}
        <Modal
          visible={loginModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setLoginModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Employee Login</Text>
                <Pressable onPress={() => setLoginModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />

                <Pressable style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  customHeader: {
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  doorDashHeaderButton: {
    backgroundColor: '#FF3008',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  doorDashHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabScrollView: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tabSelector: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  tabButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
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
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
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
    backgroundColor: colors.accent,
    borderColor: colors.accent,
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
  specialValidUntil: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
