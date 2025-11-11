
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';

export function MenuDataSeeder() {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const seedMenuData = async () => {
    try {
      setLoading(true);

      // Check if data already exists
      const { data: existingItems } = await supabase
        .from('menu_items')
        .select('id')
        .limit(1);

      if (existingItems && existingItems.length > 0) {
        Alert.alert('Info', 'Menu data already exists. Clear the database first if you want to reseed.');
        setSeeded(true);
        return;
      }

      // Get categories
      const { data: categories, error: catError } = await supabase
        .from('menu_categories')
        .select('id, name');

      if (catError) throw catError;

      const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      }, {} as Record<string, string>);

      // Sample menu items (you can expand this)
      const sampleItems = [
        // Starters
        { name: 'Artisan Bread', description: 'Honey butter, sun-dried tomato pesto', price: 6.00, category: 'Starters', meal_type: 'both', dietary_info: ['v'], display_order: 1 },
        { name: 'Cheese Board', description: 'Chef selection of cheese, seasonal fruit, mixed nuts, honey, raspberry preserves, assorted crackers', price: 30.00, category: 'Starters', meal_type: 'both', dietary_info: ['gf'], display_order: 2 },
        { name: 'Wings', description: 'Choice of sauce: Buffalo, thai chili or BBQ, carrots, celery, bleu cheese dressing', price: 16.00, category: 'Starters', meal_type: 'both', dietary_info: ['gf'], display_order: 3 },
        
        // Tacos
        { name: 'Chicken Tacos', description: 'Cheddar jack, lettuce, jalapeño, pico de gallo, chipotle mayo', price: 16.00, category: 'Tacos', meal_type: 'both', dietary_info: null, display_order: 1 },
        { name: 'Blackened Shrimp Tacos', description: 'Avocado, red cabbage, pineapple salsa, lime', price: 17.00, category: 'Tacos', meal_type: 'both', dietary_info: null, display_order: 2 },
        
        // Salads
        { name: 'Classic Caesar', description: 'Romaine hearts, buttered croutons, caesar dressing, shaved parmesan', price: 12.00, category: 'Salads', meal_type: 'both', dietary_info: ['gf'], display_order: 1 },
        { name: 'Greek', description: 'Romaine, feta, grape tomatoes, cucumber, olives, red onion, lemon vinaigrette', price: 16.00, category: 'Salads', meal_type: 'both', dietary_info: ['gf'], display_order: 2 },
        
        // Entrées
        { name: 'Prime Burger', description: '10 oz black angus beef patty, cheddar, lettuce, tomato, red onion, toasted brioche bun, french fries', price: 22.00, category: 'Entrées', meal_type: 'both', dietary_info: ['gf'], display_order: 1 },
        { name: 'Salmon', description: 'Fennel & leek risotto, orange beurre blanc', price: 32.00, category: 'Entrées', meal_type: 'both', dietary_info: ['gf'], display_order: 2 },
        { name: 'NY Strip', description: 'Prosciutto wrapped asparagus, garlic whipped potatoes, peppercorn cream, frizzled onion', price: 42.00, category: 'Entrées', meal_type: 'both', dietary_info: ['gf'], display_order: 3 },
      ];

      const itemsToInsert = sampleItems.map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: categoryMap[item.category],
        meal_type: item.meal_type,
        dietary_info: item.dietary_info,
        display_order: item.display_order,
        is_available: true,
      }));

      const { error: insertError } = await supabase
        .from('menu_items')
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      Alert.alert('Success', `Successfully seeded ${sampleItems.length} menu items!`);
      setSeeded(true);
    } catch (error) {
      console.error('Error seeding menu data:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to seed menu data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu Data Seeder</Text>
      <Text style={styles.description}>
        This will add sample menu items to your database. Only use this once to populate initial data.
      </Text>
      <Pressable
        style={[styles.button, (loading || seeded) && styles.buttonDisabled]}
        onPress={seedMenuData}
        disabled={loading || seeded}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Seeding...' : seeded ? 'Data Seeded' : 'Seed Menu Data'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
