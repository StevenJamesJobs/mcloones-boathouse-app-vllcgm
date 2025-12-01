
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface AppPromotion {
  id: string;
  title: string;
  description: string;
  promo_code: string | null;
  discount_type: 'percentage' | 'fixed-amount' | 'free-item';
  discount_value: number | null;
  free_item_id: string | null;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function usePromotions() {
  const [promotions, setPromotions] = useState<AppPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('app_promotions')
        .select('*')
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setPromotions(data || []);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('app_promotions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_promotions' }, () => {
        console.log('App promotions changed, refetching...');
        fetchPromotions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPromotions]);

  const validatePromoCode = async (promoCode: string, orderAmount: number) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('app_promotions')
        .select('*')
        .eq('promo_code', promoCode.toUpperCase())
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .single();

      if (fetchError) {
        return { valid: false, error: 'Invalid promo code' };
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        return { valid: false, error: 'Promo code has reached maximum uses' };
      }

      if (data.min_order_amount && orderAmount < data.min_order_amount) {
        return { valid: false, error: `Minimum order amount is $${data.min_order_amount.toFixed(2)}` };
      }

      return { valid: true, promotion: data };
    } catch (err) {
      console.error('Error validating promo code:', err);
      return { valid: false, error: 'Failed to validate promo code' };
    }
  };

  return { promotions, loading, error, refetch: fetchPromotions, validatePromoCode };
}
