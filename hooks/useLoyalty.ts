
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  reward_type: 'discount' | 'free-item' | 'special-offer';
  discount_amount: number | null;
  discount_percentage: number | null;
  free_item_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  points_change: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  order_id: string | null;
  reward_id: string | null;
  description: string;
  created_at: string;
}

export function useLoyaltyRewards() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setRewards(data || []);
    } catch (err) {
      console.error('Error fetching loyalty rewards:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('loyalty_rewards_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_rewards' }, () => {
        console.log('Loyalty rewards changed, refetching...');
        fetchRewards();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRewards]);

  return { rewards, loading, error, refetch: fetchRewards };
}

export function useLoyaltyTransactions() {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTransactions([]);
        return;
      }

      // Get customer profile
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        setTransactions([]);
        return;
      }

      // Fetch transactions
      const { data, error: fetchError } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching loyalty transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('loyalty_transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_transactions' }, () => {
        console.log('Loyalty transactions changed, refetching...');
        fetchTransactions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}
