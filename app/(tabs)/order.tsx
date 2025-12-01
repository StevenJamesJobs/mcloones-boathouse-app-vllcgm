
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Image, Alert, TextInput, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useMenu, MenuItemWithCategory } from '@/hooks/useMenu';
import { useCustomerProfile } from '@/hooks/useCustomerProfile';
import { useOrders, CartItem } from '@/hooks/useOrders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function OrderScreen() {
  const [selectedTab, setSelectedTab] = useState<'lunch' | 'dinner'>('lunch');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'dine-in'>('pickup');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tip, setTip] = useState(0);
  const [selectedTipPercent, setSelectedTipPercent] = useState(15);

  const { items, categories, loading, error } = useMenu(selectedTab);
  const { profile } = useCustomerProfile();
  const { createOrder } = useOrders();
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

  const addToCart = (item: MenuItemWithCategory) => {
    const existingItem = cart.find(cartItem => cartItem.menu_item_id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.menu_item_id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        item_name: item.name,
        item_price: item.price || 0,
        quantity: 1,
        image_url: item.image_url || undefined,
      }]);
    }
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
  };

  const removeFromCart = (menu_item_id: string) => {
    setCart(cart.filter(item => item.menu_item_id !== menu_item_id));
  };

  const updateQuantity = (menu_item_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menu_item_id);
    } else {
      setCart(cart.map(item => 
        item.menu_item_id === menu_item_id 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.item_price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.07; // 7% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + tip;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out');
      return;
    }

    if (!profile) {
      Alert.alert('Profile Required', 'Please create a customer profile first', [
        { text: 'Cancel' },
        { text: 'Create Profile', onPress: () => router.push('/customer/profile') }
      ]);
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      Alert.alert('Address Required', 'Please enter a delivery address');
      return;
    }

    const result = await createOrder({
      order_type: orderType,
      items: cart,
      special_instructions: specialInstructions || undefined,
      delivery_address: orderType === 'delivery' ? deliveryAddress : undefined,
      tip,
    });

    if (result.success) {
      Alert.alert(
        'Order Placed!',
        `Your order #${result.order?.order_number} has been placed successfully. You earned ${result.order?.loyalty_points_earned} loyalty points!`,
        [
          { text: 'View Orders', onPress: () => router.push('/customer/orders') },
          { text: 'OK', onPress: () => {
            setCart([]);
            setCheckoutModalVisible(false);
            setCartVisible(false);
            setSpecialInstructions('');
            setDeliveryAddress('');
            setTip(0);
          }}
        ]
      );
    } else {
      Alert.alert('Order Failed', result.error || 'Failed to place order');
    }
  };

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
          <Pressable style={styles.cartButton} onPress={() => setCartVisible(true)}>
            <MaterialIcons name="shopping-cart" size={24} color="#FFFFFF" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </Pressable>
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
                            <Text style={styles.menuItemDescription} numberOfLines={2}>
                              {item.description}
                            </Text>
                          )}
                          <Pressable style={styles.addButton} onPress={() => addToCart(item)}>
                            <MaterialIcons name="add-shopping-cart" size={18} color="#FFFFFF" />
                            <Text style={styles.addButtonText}>Add to Cart</Text>
                          </Pressable>
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

        {/* Cart Modal */}
        <Modal
          visible={cartVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setCartVisible(false)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <Pressable onPress={() => setCartVisible(false)}>
                <MaterialIcons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialIcons name="shopping-cart" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.cartItems}>
                  {cart.map((item, index) => (
                    <View key={index} style={styles.cartItem}>
                      {item.image_url && (
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.cartItemImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.cartItemDetails}>
                        <Text style={styles.cartItemName}>{item.item_name}</Text>
                        <Text style={styles.cartItemPrice}>${item.item_price.toFixed(2)}</Text>
                        <View style={styles.quantityControls}>
                          <Pressable
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                          >
                            <MaterialIcons name="remove" size={20} color={colors.accent} />
                          </Pressable>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <Pressable
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                          >
                            <MaterialIcons name="add" size={20} color={colors.accent} />
                          </Pressable>
                        </View>
                      </View>
                      <Pressable
                        style={styles.removeButton}
                        onPress={() => removeFromCart(item.menu_item_id)}
                      >
                        <MaterialIcons name="delete" size={24} color={colors.error} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.cartSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax (7%):</Text>
                    <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
                  </View>
                  <Pressable
                    style={styles.checkoutButton}
                    onPress={() => {
                      setCartVisible(false);
                      setCheckoutModalVisible(true);
                    }}
                  >
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </Modal>

        {/* Checkout Modal */}
        <Modal
          visible={checkoutModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setCheckoutModalVisible(false)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout</Text>
              <Pressable onPress={() => setCheckoutModalVisible(false)}>
                <MaterialIcons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.checkoutContent}>
              {/* Order Type */}
              <Text style={styles.sectionTitle}>Order Type</Text>
              <View style={styles.orderTypeButtons}>
                <Pressable
                  style={[styles.orderTypeButton, orderType === 'pickup' && styles.orderTypeButtonActive]}
                  onPress={() => setOrderType('pickup')}
                >
                  <MaterialIcons name="store" size={24} color={orderType === 'pickup' ? '#FFFFFF' : colors.accent} />
                  <Text style={[styles.orderTypeText, orderType === 'pickup' && styles.orderTypeTextActive]}>
                    Pickup
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.orderTypeButton, orderType === 'delivery' && styles.orderTypeButtonActive]}
                  onPress={() => setOrderType('delivery')}
                >
                  <MaterialIcons name="delivery-dining" size={24} color={orderType === 'delivery' ? '#FFFFFF' : colors.accent} />
                  <Text style={[styles.orderTypeText, orderType === 'delivery' && styles.orderTypeTextActive]}>
                    Delivery
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.orderTypeButton, orderType === 'dine-in' && styles.orderTypeButtonActive]}
                  onPress={() => setOrderType('dine-in')}
                >
                  <MaterialIcons name="restaurant" size={24} color={orderType === 'dine-in' ? '#FFFFFF' : colors.accent} />
                  <Text style={[styles.orderTypeText, orderType === 'dine-in' && styles.orderTypeTextActive]}>
                    Dine-In
                  </Text>
                </Pressable>
              </View>

              {/* Delivery Address */}
              {orderType === 'delivery' && (
                <>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter delivery address"
                    placeholderTextColor={colors.textSecondary}
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    multiline
                  />
                </>
              )}

              {/* Special Instructions */}
              <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special requests?"
                placeholderTextColor={colors.textSecondary}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
              />

              {/* Tip */}
              <Text style={styles.sectionTitle}>Add a Tip</Text>
              <View style={styles.tipButtons}>
                {[10, 15, 20, 25].map((percent) => (
                  <Pressable
                    key={percent}
                    style={[styles.tipButton, selectedTipPercent === percent && styles.tipButtonActive]}
                    onPress={() => {
                      setSelectedTipPercent(percent);
                      setTip(calculateSubtotal() * (percent / 100));
                    }}
                  >
                    <Text style={[styles.tipButtonText, selectedTipPercent === percent && styles.tipButtonTextActive]}>
                      {percent}%
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Order Summary */}
              <View style={styles.checkoutSummary}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (7%):</Text>
                  <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tip:</Text>
                  <Text style={styles.summaryValue}>${tip.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.checkoutFooter}>
              <Pressable style={styles.placeOrderButton} onPress={handleCheckout}>
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
              </Pressable>
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
  cartButton: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
  },
  cartItems: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    gap: 12,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  cartSummary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  checkoutButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  orderTypeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
    gap: 8,
  },
  orderTypeButtonActive: {
    backgroundColor: colors.accent,
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  orderTypeTextActive: {
    color: '#FFFFFF',
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
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tipButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  tipButtonActive: {
    backgroundColor: colors.accent,
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tipButtonTextActive: {
    color: '#FFFFFF',
  },
  checkoutSummary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 80,
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeOrderButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
