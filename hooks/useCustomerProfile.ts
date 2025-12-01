
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

export function useCustomerProfile() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setProfile(data || null);
    } catch (err) {
      console.error('Error fetching customer profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('customer_profile_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_profiles' }, () => {
        console.log('Customer profile changed, refetching...');
        fetchProfile();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const createProfile = async (profileData: {
    full_name: string;
    email: string;
    phone_number?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: createError } = await supabase
        .from('customer_profiles')
        .insert([{
          user_id: user.id,
          full_name: profileData.full_name,
          email: profileData.email,
          phone_number: profileData.phone_number || null,
        }])
        .select()
        .single();

      if (createError) throw createError;

      setProfile(data);
      return { success: true, profile: data };
    } catch (err) {
      console.error('Error creating profile:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create profile' };
    }
  };

  const updateProfile = async (updates: Partial<CustomerProfile>) => {
    try {
      if (!profile) throw new Error('No profile to update');

      const { data, error: updateError } = await supabase
        .from('customer_profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      return { success: true, profile: data };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
    }
  };

  return { profile, loading, error, refetch: fetchProfile, createProfile, updateProfile };
}
