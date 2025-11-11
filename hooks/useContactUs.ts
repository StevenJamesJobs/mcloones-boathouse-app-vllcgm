
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface ContactUs {
  id: string;
  phone: string;
  email: string;
  address: string;
  hours_weekday: string | null;
  hours_weekend: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useContactUs() {
  const [contactInfo, setContactInfo] = useState<ContactUs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContactInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('contact_us')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setContactInfo(data || null);
    } catch (err) {
      console.error('Error fetching contact info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contact info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContactInfo();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('contact_us_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_us' }, () => {
        console.log('Contact info changed, refetching...');
        fetchContactInfo();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchContactInfo]);

  return { contactInfo, loading, error, refetch: fetchContactInfo };
}

export function useContactUsEditor() {
  const { contactInfo, loading, error, refetch } = useContactUs();
  const [allContactInfo, setAllContactInfo] = useState<ContactUs[]>([]);

  const fetchAllContactInfo = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('contact_us')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAllContactInfo(data || []);
    } catch (err) {
      console.error('Error fetching all contact info:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllContactInfo();
  }, [fetchAllContactInfo]);

  const addContactInfo = async (info: Omit<ContactUs, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_us')
        .insert([info])
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllContactInfo();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding contact info:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add contact info' };
    }
  };

  const updateContactInfo = async (id: string, updates: Partial<ContactUs>) => {
    try {
      const { data, error } = await supabase
        .from('contact_us')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllContactInfo();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating contact info:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update contact info' };
    }
  };

  const deleteContactInfo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_us')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      fetchAllContactInfo();
      return { error: null };
    } catch (err) {
      console.error('Error deleting contact info:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete contact info' };
    }
  };

  return {
    contactInfo: allContactInfo,
    loading,
    error,
    refetch: fetchAllContactInfo,
    addContactInfo,
    updateContactInfo,
    deleteContactInfo,
  };
}
