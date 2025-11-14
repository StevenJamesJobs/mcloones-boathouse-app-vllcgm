
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface GalleryImage {
  id: string;
  image_url: string;
  category: 'dining' | 'banquets' | 'events';
  caption: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useGallery(category?: 'dining' | 'banquets' | 'events') {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setImages(data || []);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery images');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchImages();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('gallery_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        console.log('Gallery changed, refetching...');
        fetchImages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchImages]);

  return { images, loading, error, refetch: fetchImages };
}

export function useGalleryEditor() {
  const { images, loading, error, refetch } = useGallery();
  const [allImages, setAllImages] = useState<GalleryImage[]>([]);

  const fetchAllImages = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('gallery')
        .select('*')
        .order('category', { ascending: true })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAllImages(data || []);
    } catch (err) {
      console.error('Error fetching all gallery images:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllImages();
  }, [fetchAllImages]);

  const addImage = async (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .insert([image])
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllImages();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding gallery image:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add gallery image' };
    }
  };

  const updateImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      fetchAllImages();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating gallery image:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update gallery image' };
    }
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    try {
      // Delete from storage first
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('gallery-images')
          .remove([fileName]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      fetchAllImages();
      return { error: null };
    } catch (err) {
      console.error('Error deleting gallery image:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete gallery image' };
    }
  };

  return {
    images: allImages,
    loading,
    error,
    refetch: fetchAllImages,
    addImage,
    updateImage,
    deleteImage,
  };
}
