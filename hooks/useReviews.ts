
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(4);

      if (fetchError) throw fetchError;

      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('reviews_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        console.log('Reviews changed, refetching...');
        fetchReviews();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}

export function useReviewsEditor() {
  const { reviews, loading, error, refetch } = useReviews();
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  const fetchAllReviews = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setAllReviews(data || []);
    } catch (err) {
      console.error('Error fetching all reviews:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  const addReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllReviews();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding review:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add review' };
    }
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllReviews();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating review:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update review' };
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      fetchAllReviews();
      return { error: null };
    } catch (err) {
      console.error('Error deleting review:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete review' };
    }
  };

  return {
    reviews: allReviews,
    loading,
    error,
    refetch: fetchAllReviews,
    addReview,
    updateReview,
    deleteReview,
  };
}
