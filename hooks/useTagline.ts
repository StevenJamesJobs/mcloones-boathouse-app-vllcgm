
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface Tagline {
  id: string;
  tagline_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTagline() {
  const [tagline, setTagline] = useState<Tagline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTagline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('taglines')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setTagline(data || null);
    } catch (err) {
      console.error('Error fetching tagline:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tagline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTagline();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('taglines_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'taglines' }, () => {
        console.log('Tagline changed, refetching...');
        fetchTagline();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTagline]);

  return { tagline, loading, error, refetch: fetchTagline };
}

export function useTaglineEditor() {
  const { tagline, loading, error, refetch } = useTagline();
  const [allTaglines, setAllTaglines] = useState<Tagline[]>([]);

  const fetchAllTaglines = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('taglines')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAllTaglines(data || []);
    } catch (err) {
      console.error('Error fetching all taglines:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllTaglines();
  }, [fetchAllTaglines]);

  const addTagline = async (taglineData: Omit<Tagline, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('taglines')
        .insert([taglineData])
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllTaglines();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding tagline:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add tagline' };
    }
  };

  const updateTagline = async (id: string, updates: Partial<Tagline>) => {
    try {
      const { data, error } = await supabase
        .from('taglines')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllTaglines();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating tagline:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update tagline' };
    }
  };

  const deleteTagline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('taglines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      fetchAllTaglines();
      return { error: null };
    } catch (err) {
      console.error('Error deleting tagline:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete tagline' };
    }
  };

  return {
    taglines: allTaglines,
    loading,
    error,
    refetch: fetchAllTaglines,
    addTagline,
    updateTagline,
    deleteTagline,
  };
}
