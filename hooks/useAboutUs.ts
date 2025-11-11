
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface AboutUsSection {
  id: string;
  title: string;
  content: string;
  section_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAboutUs() {
  const [sections, setSections] = useState<AboutUsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('about_us')
        .select('*')
        .eq('is_active', true)
        .order('section_order', { ascending: true });

      if (fetchError) throw fetchError;

      setSections(data || []);
    } catch (err) {
      console.error('Error fetching about us sections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch about us sections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('about_us_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'about_us' }, () => {
        console.log('About us sections changed, refetching...');
        fetchSections();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchSections]);

  return { sections, loading, error, refetch: fetchSections };
}

export function useAboutUsEditor() {
  const { sections, loading, error, refetch } = useAboutUs();
  const [allSections, setAllSections] = useState<AboutUsSection[]>([]);

  const fetchAllSections = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('about_us')
        .select('*')
        .order('section_order', { ascending: true });

      if (fetchError) throw fetchError;

      setAllSections(data || []);
    } catch (err) {
      console.error('Error fetching all about us sections:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllSections();
  }, [fetchAllSections]);

  const addSection = async (section: Omit<AboutUsSection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('about_us')
        .insert([section])
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllSections();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding about us section:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add about us section' };
    }
  };

  const updateSection = async (id: string, updates: Partial<AboutUsSection>) => {
    try {
      const { data, error } = await supabase
        .from('about_us')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllSections();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating about us section:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update about us section' };
    }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('about_us')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      fetchAllSections();
      return { error: null };
    } catch (err) {
      console.error('Error deleting about us section:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete about us section' };
    }
  };

  return {
    sections: allSections,
    loading,
    error,
    refetch: fetchAllSections,
    addSection,
    updateSection,
    deleteSection,
  };
}
