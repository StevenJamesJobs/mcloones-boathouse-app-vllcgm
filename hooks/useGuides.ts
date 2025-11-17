
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/app/integrations/supabase/types';

export type Guide = Tables<'guides'>;
export type GuideInsert = TablesInsert<'guides'>;
export type GuideUpdate = TablesUpdate<'guides'>;

export type GuideCategory = 'Employee HandBooks' | 'Full Menus' | 'Cheat Sheets' | 'Events Flyers';

export function useGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('guides')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setGuides(data || []);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch guides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  return {
    guides,
    loading,
    error,
    refetch: fetchGuides,
  };
}

export function useGuidesEditor() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('guides')
        .select('*')
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setGuides(data || []);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch guides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const addGuide = async (guide: GuideInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('guides')
        .insert(guide)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchGuides();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding guide:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add guide' };
    }
  };

  const updateGuide = async (id: string, guide: GuideUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('guides')
        .update({ ...guide, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchGuides();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating guide:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update guide' };
    }
  };

  const deleteGuide = async (id: string, fileUrl: string) => {
    try {
      // Delete file from storage
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('guides')
          .remove([fileName]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      // Delete guide from database
      const { error: deleteError } = await supabase
        .from('guides')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchGuides();
      return { error: null };
    } catch (err) {
      console.error('Error deleting guide:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete guide' };
    }
  };

  return {
    guides,
    loading,
    error,
    addGuide,
    updateGuide,
    deleteGuide,
    refetch: fetchGuides,
  };
}
