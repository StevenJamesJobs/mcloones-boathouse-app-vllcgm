
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface TableReservation {
  id: string;
  customer_id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  seating_preference: 'indoor' | 'outdoor' | 'bar' | 'window' | 'no-preference' | null;
  special_requests: string | null;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  confirmation_code: string;
  created_at: string;
  updated_at: string;
}

export function useReservations() {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReservations([]);
        return;
      }

      // Get customer profile
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        setReservations([]);
        return;
      }

      // Fetch reservations
      const { data, error: fetchError } = await supabase
        .from('table_reservations')
        .select('*')
        .eq('customer_id', profile.id)
        .order('reservation_date', { ascending: false })
        .order('reservation_time', { ascending: false });

      if (fetchError) throw fetchError;
      setReservations(data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('table_reservations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_reservations' }, () => {
        console.log('Reservations changed, refetching...');
        fetchReservations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReservations]);

  const createReservation = async (reservationData: {
    reservation_date: string;
    reservation_time: string;
    party_size: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    seating_preference?: 'indoor' | 'outdoor' | 'bar' | 'window' | 'no-preference';
    special_requests?: string;
  }) => {
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
            full_name: reservationData.customer_name,
            email: reservationData.customer_email,
            phone_number: reservationData.customer_phone,
          }])
          .select()
          .single();

        if (profileError) throw profileError;
        profile = newProfile;
      }

      // Create reservation
      const { data, error: createError } = await supabase
        .from('table_reservations')
        .insert([{
          customer_id: profile.id,
          reservation_date: reservationData.reservation_date,
          reservation_time: reservationData.reservation_time,
          party_size: reservationData.party_size,
          customer_name: reservationData.customer_name,
          customer_email: reservationData.customer_email,
          customer_phone: reservationData.customer_phone,
          seating_preference: reservationData.seating_preference || 'no-preference',
          special_requests: reservationData.special_requests || null,
          status: 'pending',
        }])
        .select()
        .single();

      if (createError) throw createError;

      fetchReservations();
      return { success: true, reservation: data };
    } catch (err) {
      console.error('Error creating reservation:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create reservation' };
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('table_reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (updateError) throw updateError;

      fetchReservations();
      return { success: true };
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to cancel reservation' };
    }
  };

  return { reservations, loading, error, refetch: fetchReservations, createReservation, cancelReservation };
}
