
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useOrders } from '@/hooks/useOrders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function OrdersScreen() {
  const { orders, loading, error } = useOrders();
  const insets = useSafeAreaInsets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'preparing':
      case 'ready':
        return colors.warning;
      default:
        return colors.accent;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      case 'preparing':
        return 'restaurant';
      case 'ready':
        return 'done-all';
      default:
        return 'pending';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Orders',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <View style={[commonStyles.container, styles.container, { paddingTop: insets.top }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading orders: {error}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Start ordering to see your order history</Text>
            <Pressable style={styles.orderButton} onPress={() => router.push('/(tabs)/order')}>
              <Text style={styles.orderButtonText}>Browse Menu</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {orders.map((order) => (
              <Pressable
                key={order.id}
                style={commonStyles.card}
                onPress={() => router.push(`/customer/order-detail?id=${order.id}`)}
              >
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <MaterialIcons
                      name={getStatusIcon(order.status) as any}
                      size={16}
                      color={getStatusColor(order.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.orderRow}>
                    <MaterialIcons name="shopping-bag" size={18} color={colors.textSecondary} />
                    <Text style={styles.orderType}>
                      {order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.orderRow}>
                    <MaterialIcons name="attach-money" size={18} color={colors.textSecondary} />
                    <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                  </View>
                  {order.loyalty_points_earned > 0 && (
                    <View style={styles.orderRow}>
                      <MaterialIcons name="stars" size={18} color={colors.warning} />
                      <Text style={styles.pointsEarned}>
                        +{order.loyalty_points_earned} points earned
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <MaterialIcons name="chevron-right" size={20} color={colors.accent} />
                </View>
              </Pressable>
            ))}
            <View style={styles.bottomPadding} />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  scrollContentWithTabBar: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  orderButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  orderDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderType: {
    fontSize: 14,
    color: colors.text,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  pointsEarned: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  bottomPadding: {
    height: 80,
  },
});
