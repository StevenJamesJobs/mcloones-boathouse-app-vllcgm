
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Tables } from '@/app/integrations/supabase/types';

export type MenuCategory = Tables<'menu_categories'>;
export type MenuItem = Tables<'menu_items'>;

export interface MenuItemWithCategory extends MenuItem {
  category?: MenuCategory;
}

export function useMenu(mealType?: 'lunch' | 'dinner' | 'both') {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      let categoriesQuery = supabase
        .from('menu_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (mealType && mealType !== 'both') {
        categoriesQuery = categoriesQuery.or(`meal_type.eq.${mealType},meal_type.eq.both`);
      }

      const { data: categoriesData, error: categoriesError } = await categoriesQuery;

      if (categoriesError) throw categoriesError;

      // Fetch menu items
      let itemsQuery = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('display_order', { ascending: true });

      if (mealType && mealType !== 'both') {
        itemsQuery = itemsQuery.or(`meal_type.eq.${mealType},meal_type.eq.both`);
      }

      const { data: itemsData, error: itemsError } = await itemsQuery;

      if (itemsError) throw itemsError;

      // Combine items with their categories
      const itemsWithCategories = itemsData.map(item => ({
        ...item,
        category: categoriesData.find(cat => cat.id === item.category_id),
      }));

      setCategories(categoriesData || []);
      setItems(itemsWithCategories || []);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  }, [mealType]);

  useEffect(() => {
    fetchMenu();
    
    // Subscribe to real-time changes
    const itemsSubscription = supabase
      .channel('menu_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        console.log('Menu items changed, refetching...');
        fetchMenu();
      })
      .subscribe();

    const categoriesSubscription = supabase
      .channel('menu_categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories' }, () => {
        console.log('Menu categories changed, refetching...');
        fetchMenu();
      })
      .subscribe();

    return () => {
      itemsSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  }, [fetchMenu]);

  const refetch = () => {
    fetchMenu();
  };

  return { categories, items, loading, error, refetch };
}

export function useMenuEditor() {
  const { categories, items, loading, error, refetch } = useMenu();

  const addCategory = async (category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      refetch();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding category:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add category' };
    }
  };

  const updateCategory = async (id: string, updates: Partial<MenuCategory>) => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating category:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update category' };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      return { error: null };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete category' };
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      refetch();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding menu item:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to add menu item' };
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      refetch();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating menu item:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update menu item' };
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
      return { error: null };
    } catch (err) {
      console.error('Error deleting menu item:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete menu item' };
    }
  };

  return {
    categories,
    items,
    loading,
    error,
    refetch,
    addCategory,
    updateCategory,
    deleteCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
}
