
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface SpecialFeature {
  id: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  link_url: string | null;
  image_url: string | null;
  display_style: 'banner' | 'square';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useSpecialFeatures() {
  const [features, setFeatures] = useState<SpecialFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('special_features')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setFeatures(data || []);
    } catch (err) {
      console.error('Error fetching special features:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch special features');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('special_features_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'special_features' }, () => {
        console.log('Special features changed, refetching...');
        fetchFeatures();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchFeatures]);

  return { features, loading, error, refetch: fetchFeatures };
}

export function useSpecialFeaturesEditor() {
  const { features, loading, error, refetch } = useSpecialFeatures();
  const [allFeatures, setAllFeatures] = useState<SpecialFeature[]>([]);

  const fetchAllFeatures = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('special_features')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setAllFeatures(data || []);
    } catch (err) {
      console.error('Error fetching all special features:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllFeatures();
  }, [fetchAllFeatures]);

  const addFeature = async (feature: Omit<SpecialFeature, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('special_features')
        .insert([feature])
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllFeatures();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding special feature:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add special feature' };
    }
  };

  const updateFeature = async (id: string, updates: Partial<SpecialFeature>) => {
    try {
      const { data, error } = await supabase
        .from('special_features')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllFeatures();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating special feature:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update special feature' };
    }
  };

  const deleteFeature = async (id: string) => {
    try {
      const { error } = await supabase
        .from('special_features')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      fetchAllFeatures();
      return { error: null };
    } catch (err) {
      console.error('Error deleting special feature:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete special feature' };
    }
  };

  return {
    features: allFeatures,
    loading,
    error,
    refetch: fetchAllFeatures,
    addFeature,
    updateFeature,
    deleteFeature,
  };
}
