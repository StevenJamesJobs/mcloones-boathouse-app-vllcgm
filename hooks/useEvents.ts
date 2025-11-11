
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  rsvp_link: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true })
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        console.log('Events changed, refetching...');
        fetchEvents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

export function useEventsEditor() {
  const { events, loading, error, refetch } = useEvents();
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  const fetchAllEvents = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setAllEvents(data || []);
    } catch (err) {
      console.error('Error fetching all events:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  const addEvent = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllEvents();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding event:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add event' };
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllEvents();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating event:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update event' };
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      fetchAllEvents();
      return { error: null };
    } catch (err) {
      console.error('Error deleting event:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete event' };
    }
  };

  return {
    events: allEvents,
    loading,
    error,
    refetch: fetchAllEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
