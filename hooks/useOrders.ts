
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  loyalty_points: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  order_type: 'pickup' | 'delivery' | 'dine-in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  special_instructions: string | null;
  pickup_time: string | null;
  delivery_address: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  loyalty_points_earned: number;
  loyalty_points_used: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  customizations: string | null;
  subtotal: number;
  created_at: string;
}

export interface CartItem {
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  customizations?: string;
  image_url?: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOrders([]);
        return;
      }

      // Get customer profile
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        setOrders([]);
        return;
      }

      // Fetch orders
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        console.log('Orders changed, refetching...');
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders]);

  const createOrder = async (
    orderData: {
      order_type: 'pickup' | 'delivery' | 'dine-in';
      items: CartItem[];
      special_instructions?: string;
      pickup_time?: string;
      delivery_address?: string;
      tip?: number;
      loyalty_points_to_use?: number;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get or create customer profile
      let { data: profile } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('customer_profiles')
          .insert([{
            user_id: user.id,
            full_name: user.user_metadata?.full_name || 'Customer',
            email: user.email || '',
            phone_number: user.user_metadata?.phone_number || null,
          }])
          .select()
          .single();

        if (profileError) throw profileError;
        profile = newProfile;
      }

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.item_price * item.quantity), 0);
      const tax = subtotal * 0.07; // 7% tax
      const tip = orderData.tip || 0;
      const loyaltyDiscount = (orderData.loyalty_points_to_use || 0) * 0.01; // 1 point = $0.01
      const total = subtotal + tax + tip - loyaltyDiscount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: profile.id,
          order_type: orderData.order_type,
          subtotal,
          tax,
          tip,
          total,
          special_instructions: orderData.special_instructions || null,
          pickup_time: orderData.pickup_time || null,
          delivery_address: orderData.delivery_address || null,
          loyalty_points_used: orderData.loyalty_points_to_use || 0,
          payment_status: 'pending',
          status: 'pending',
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        item_name: item.item_name,
        item_price: item.item_price,
        quantity: item.quantity,
        customizations: item.customizations || null,
        subtotal: item.item_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Deduct loyalty points if used
      if (orderData.loyalty_points_to_use && orderData.loyalty_points_to_use > 0) {
        await supabase
          .from('customer_profiles')
          .update({ loyalty_points: profile.loyalty_points - orderData.loyalty_points_to_use })
          .eq('id', profile.id);

        await supabase
          .from('loyalty_transactions')
          .insert([{
            customer_id: profile.id,
            points_change: -orderData.loyalty_points_to_use,
            transaction_type: 'redeemed',
            order_id: order.id,
            description: `Redeemed ${orderData.loyalty_points_to_use} points for order ${order.order_number}`,
          }]);
      }

      fetchOrders();
      return { success: true, order };
    } catch (err) {
      console.error('Error creating order:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create order' };
    }
  };

  return { orders, loading, error, refetch: fetchOrders, createOrder };
}

export function useOrderItems(orderId: string) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (fetchError) throw fetchError;
        setItems(data || []);
      } catch (err) {
        console.error('Error fetching order items:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch order items');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchItems();
    }
  }, [orderId]);

  return { items, loading, error };
}
