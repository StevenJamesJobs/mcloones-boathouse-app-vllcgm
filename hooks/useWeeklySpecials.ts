
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface WeeklySpecial {
  id: string;
  title: string;
  description: string;
  price: number | null;
  valid_until: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useWeeklySpecials() {
  const [specials, setSpecials] = useState<WeeklySpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecials();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('weekly_specials_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_specials' }, () => {
        console.log('Weekly specials changed, refetching...');
        fetchSpecials();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSpecials = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('weekly_specials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setSpecials(data || []);
    } catch (err) {
      console.error('Error fetching weekly specials:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weekly specials');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchSpecials();
  };

  return { specials, loading, error, refetch };
}

export function useWeeklySpecialsEditor() {
  const { specials, loading, error, refetch } = useWeeklySpecials();
  const [allSpecials, setAllSpecials] = useState<WeeklySpecial[]>([]);

  useEffect(() => {
    fetchAllSpecials();
  }, []);

  const fetchAllSpecials = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('weekly_specials')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setAllSpecials(data || []);
    } catch (err) {
      console.error('Error fetching all weekly specials:', err);
    }
  };

  const addSpecial = async (special: Omit<WeeklySpecial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('weekly_specials')
        .insert([special])
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllSpecials();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding weekly special:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add weekly special' };
    }
  };

  const updateSpecial = async (id: string, updates: Partial<WeeklySpecial>) => {
    try {
      const { data, error } = await supabase
        .from('weekly_specials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllSpecials();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating weekly special:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update weekly special' };
    }
  };

  const deleteSpecial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weekly_specials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      fetchAllSpecials();
      return { error: null };
    } catch (err) {
      console.error('Error deleting weekly special:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete weekly special' };
    }
  };

  return {
    specials: allSpecials,
    loading,
    error,
    refetch: fetchAllSpecials,
    addSpecial,
    updateSpecial,
    deleteSpecial,
  };
}
