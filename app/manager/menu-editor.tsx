
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useMenuEditor, MenuItem, MenuCategory } from '@/hooks/useMenu';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/app/integrations/supabase/client';

type EditMode = 'item' | 'category' | null;

export default function MenuEditorScreen() {
  const { categories, items, loading, error, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, updateCategory, deleteCategory } = useMenuEditor();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner' | 'both'>('both');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form states for menu item
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemMealType, setItemMealType] = useState<'lunch' | 'dinner' | 'both'>('both');
  const [itemDietaryInfo, setItemDietaryInfo] = useState<string[]>([]);
  const [itemDisplayOrder, setItemDisplayOrder] = useState('0');
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(null);
  const [itemSubcategory, setItemSubcategory] = useState('');
  
  // Form states for category
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryMealType, setCategoryMealType] = useState<'lunch' | 'dinner' | 'both'>('both');
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState('0');

  const filteredItems = items.filter(item => {
    const mealTypeMatch = selectedMealType === 'both' || item.meal_type === selectedMealType || item.meal_type === 'both';
    const categoryMatch = selectedCategoryFilter === 'all' || item.category_id === selectedCategoryFilter;
    return mealTypeMatch && categoryMatch;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const categoryName = item.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemCategoryId(categories[0]?.id || '');
    setItemMealType('both');
    setItemDietaryInfo([]);
    setItemDisplayOrder('0');
    setItemImageUrl(null);
    setItemSubcategory('');
    setEditMode('item');
    setModalVisible(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description || '');
    setItemPrice(item.price?.toString() || '');
    setItemCategoryId(item.category_id || '');
    setItemMealType(item.meal_type as 'lunch' | 'dinner' | 'both');
    setItemDietaryInfo(item.dietary_info || []);
    setItemDisplayOrder(item.display_order.toString());
    setItemImageUrl(item.image_url || null);
    setItemSubcategory((item as any).subcategory || '');
    setEditMode('item');
    setModalVisible(true);
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryMealType('both');
    setCategoryDisplayOrder('0');
    setEditMode('category');
    setModalVisible(true);
  };

  const openEditCategoryModal = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryMealType(category.meal_type as 'lunch' | 'dinner' | 'both');
    setCategoryDisplayOrder(category.display_order.toString());
    setEditMode('category');
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploadingImage(true);
      console.log('Starting image upload for URI:', uri);

      // Generate unique filename
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Generated filename:', fileName);

      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      console.log('Blob created, size:', blob.size, 'type:', blob.type);

      // Convert blob to ArrayBuffer for upload
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert blob to ArrayBuffer'));
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('menu-thumbnails')
        .upload(filePath, arrayBuffer, {
          contentType: blob.type || `image/${fileExt}`,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      console.log('Upload successful, data:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-thumbnails')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setItemImageUrl(publicUrl);
      Alert.alert('Success', 'Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setItemImageUrl(null),
        },
      ]
    );
  };

  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    // Check if selected category is Wine or Libations
    const selectedCategory = categories.find(cat => cat.id === itemCategoryId);
    const isWineOrLibations = selectedCategory?.name === 'Wine' || selectedCategory?.name === 'Libations';

    // Prevent adding Wine/Libations items to Lunch or Dinner meal types
    if (isWineOrLibations && (itemMealType === 'lunch' || itemMealType === 'dinner')) {
      Alert.alert(
        'Invalid Configuration',
        'Wine and Libations items cannot be assigned to Lunch or Dinner meal types. They must be set to "Both" to appear in their own dedicated categories.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Prevent adding Lunch/Dinner items to Wine/Libations categories
    if (isWineOrLibations && itemMealType !== 'both') {
      Alert.alert(
        'Invalid Configuration',
        'Wine and Libations items must have meal type set to "Both".',
        [{ text: 'OK' }]
      );
      return;
    }

    const itemData = {
      name: itemName.trim(),
      description: itemDescription.trim() || null,
      price: itemPrice ? parseFloat(itemPrice) : null,
      category_id: itemCategoryId || null,
      meal_type: itemMealType,
      dietary_info: itemDietaryInfo.length > 0 ? itemDietaryInfo : null,
      display_order: parseInt(itemDisplayOrder) || 0,
      is_available: true,
      image_url: itemImageUrl || null,
      subcategory: itemSubcategory.trim() || null,
    };

    console.log('Saving item with data:', itemData);

    if (editingItem) {
      const { error } = await updateMenuItem(editingItem.id, itemData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Menu item updated successfully');
    } else {
      const { error } = await addMenuItem(itemData as any);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Menu item added successfully');
    }

    setModalVisible(false);
  };

  const handleDeleteItem = (item: MenuItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteMenuItem(item.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Menu item deleted successfully');
            }
          },
        },
      ]
    );
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const categoryData = {
      name: categoryName.trim(),
      meal_type: categoryMealType,
      display_order: parseInt(categoryDisplayOrder) || 0,
    };

    if (editingCategory) {
      const { error } = await updateCategory(editingCategory.id, categoryData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Category updated successfully');
    } else {
      const { error } = await addCategory(categoryData as any);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Category added successfully');
    }

    setModalVisible(false);
  };

  const handleDeleteCategory = (category: MenuCategory) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This will also delete all items in this category.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteCategory(category.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Category deleted successfully');
            }
          },
        },
      ]
    );
  };

  const toggleDietaryInfo = (info: string) => {
    if (itemDietaryInfo.includes(info)) {
      setItemDietaryInfo(itemDietaryInfo.filter(i => i !== info));
    } else {
      setItemDietaryInfo([...itemDietaryInfo, info]);
    }
  };

  // Check if selected category is Wine or Libations
  const selectedCategory = categories.find(cat => cat.id === itemCategoryId);
  const isWineOrLibations = selectedCategory?.name === 'Wine' || selectedCategory?.name === 'Libations';

  // Get available categories - filter out Wine/Libations when meal type is lunch or dinner
  const availableCategories = categories.filter(cat => {
    // If meal type is lunch or dinner, exclude Wine and Libations
    if (itemMealType === 'lunch' || itemMealType === 'dinner') {
      return cat.name !== 'Wine' && cat.name !== 'Libations';
    }
    return true;
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Menu Editor',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.addButton} onPress={openAddItemModal}>
            <IconSymbol name="plus.circle.fill" color="#FFFFFF" size={20} />
            <Text style={styles.addButtonText}>Add Item</Text>
          </Pressable>
          <Pressable style={[styles.addButton, styles.addCategoryButton]} onPress={openAddCategoryModal}>
            <IconSymbol name="folder.badge.plus" color="#FFFFFF" size={20} />
            <Text style={styles.addButtonText}>Add Category</Text>
          </Pressable>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <Pressable
              style={[styles.filterButton, selectedMealType === 'both' && styles.filterButtonActive]}
              onPress={() => setSelectedMealType('both')}
            >
              <Text style={[styles.filterButtonText, selectedMealType === 'both' && styles.filterButtonTextActive]}>
                All
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, selectedMealType === 'lunch' && styles.filterButtonActive]}
              onPress={() => setSelectedMealType('lunch')}
            >
              <Text style={[styles.filterButtonText, selectedMealType === 'lunch' && styles.filterButtonTextActive]}>
                Lunch
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, selectedMealType === 'dinner' && styles.filterButtonActive]}
              onPress={() => setSelectedMealType('dinner')}
            >
              <Text style={[styles.filterButtonText, selectedMealType === 'dinner' && styles.filterButtonTextActive]}>
                Dinner
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Categories List */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map(category => (
            <Pressable
              key={category.id}
              style={styles.categoryCard}
              onLongPress={() => openEditCategoryModal(category)}
            >
              <Text style={styles.categoryCardName}>{category.name}</Text>
              <Text style={styles.categoryCardMealType}>{category.meal_type}</Text>
              <Pressable
                style={styles.categoryDeleteButton}
                onPress={() => handleDeleteCategory(category)}
              >
                <IconSymbol name="trash" color={colors.error} size={16} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>

        {/* Menu Items */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.managerAccent} />
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
              <View key={categoryName} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{categoryName}</Text>
                {categoryItems.map(item => (
                  <Pressable
                    key={item.id}
                    style={styles.menuItemCard}
                    onPress={() => openEditItemModal(item)}
                  >
                    <View style={styles.menuItemContent}>
                      {item.image_url && (
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.menuItemThumbnail}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.menuItemDetails}>
                        <View style={styles.menuItemHeader}>
                          <Text style={styles.menuItemName}>{item.name}</Text>
                          <Text style={styles.menuItemPrice}>
                            {item.price ? `$${item.price.toFixed(2)}` : 'N/A'}
                          </Text>
                        </View>
                        {item.description && (
                          <Text style={styles.menuItemDescription} numberOfLines={2}>
                            {item.description}
                          </Text>
                        )}
                        {(item as any).subcategory && (
                          <Text style={styles.menuItemSubcategory}>
                            {(item as any).subcategory}
                          </Text>
                        )}
                        <View style={styles.menuItemFooter}>
                          <Text style={styles.menuItemMealType}>{item.meal_type}</Text>
                          {item.dietary_info && item.dietary_info.length > 0 && (
                            <Text style={styles.menuItemDietary}>
                              {item.dietary_info.join(', ').toUpperCase()}
                            </Text>
                          )}
                          <Pressable
                            style={styles.deleteButton}
                            onPress={() => handleDeleteItem(item)}
                          >
                            <IconSymbol name="trash" color={colors.error} size={18} />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMode === 'item' 
                    ? (editingItem ? 'Edit Menu Item' : 'Add Menu Item')
                    : (editingCategory ? 'Edit Category' : 'Add Category')
                  }
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {editMode === 'item' ? (
                  <>
                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={itemName}
                      onChangeText={setItemName}
                      placeholder="Enter item name"
                      placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={itemDescription}
                      onChangeText={setItemDescription}
                      placeholder="Enter description"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />

                    <Text style={styles.label}>Price</Text>
                    <TextInput
                      style={styles.input}
                      value={itemPrice}
                      onChangeText={setItemPrice}
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                    />

                    <Text style={styles.label}>Thumbnail Image (Optional)</Text>
                    {itemImageUrl ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri: itemImageUrl }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        <View style={styles.imageActions}>
                          <Pressable
                            style={styles.changeImageButton}
                            onPress={pickImage}
                            disabled={uploadingImage}
                          >
                            <IconSymbol name="photo" color="#FFFFFF" size={16} />
                            <Text style={styles.changeImageButtonText}>Change</Text>
                          </Pressable>
                          <Pressable
                            style={styles.removeImageButton}
                            onPress={removeImage}
                            disabled={uploadingImage}
                          >
                            <IconSymbol name="trash" color="#FFFFFF" size={16} />
                            <Text style={styles.removeImageButtonText}>Remove</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <Pressable
                        style={styles.uploadButton}
                        onPress={pickImage}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <>
                            <IconSymbol name="photo.badge.plus" color="#FFFFFF" size={24} />
                            <Text style={styles.uploadButtonText}>Upload Thumbnail</Text>
                          </>
                        )}
                      </Pressable>
                    )}

                    <Text style={styles.label}>Meal Type *</Text>
                    <View style={styles.mealTypeSelector}>
                      {(['lunch', 'dinner', 'both'] as const).map(type => (
                        <Pressable
                          key={type}
                          style={[
                            styles.mealTypeButton,
                            itemMealType === type && styles.mealTypeButtonActive
                          ]}
                          onPress={() => setItemMealType(type)}
                        >
                          <Text style={[
                            styles.mealTypeButtonText,
                            itemMealType === type && styles.mealTypeButtonTextActive
                          ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.label}>Category *</Text>
                    {availableCategories.length === 0 ? (
                      <View style={styles.warningBox}>
                        <IconSymbol name="exclamationmark.triangle.fill" color={colors.warning} size={20} />
                        <Text style={styles.warningText}>
                          No categories available for {itemMealType === 'both' ? 'this meal type' : itemMealType}. 
                          {itemMealType !== 'both' && ' Wine and Libations can only be added with meal type "Both".'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.pickerContainer}>
                        {availableCategories.map(cat => (
                          <Pressable
                            key={cat.id}
                            style={[
                              styles.pickerOption,
                              itemCategoryId === cat.id && styles.pickerOptionActive
                            ]}
                            onPress={() => setItemCategoryId(cat.id)}
                          >
                            <Text style={[
                              styles.pickerOptionText,
                              itemCategoryId === cat.id && styles.pickerOptionTextActive
                            ]}>
                              {cat.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    {isWineOrLibations && (
                      <>
                        <Text style={styles.label}>Subcategory (for Wine/Libations)</Text>
                        <TextInput
                          style={styles.input}
                          value={itemSubcategory}
                          onChangeText={setItemSubcategory}
                          placeholder="e.g., Sparkling, Chardonnay, Signature Cocktails"
                          placeholderTextColor={colors.textSecondary}
                        />
                        <View style={styles.infoBox}>
                          <IconSymbol name="info.circle.fill" color={colors.accent} size={20} />
                          <Text style={styles.infoText}>
                            Wine and Libations items must have meal type set to "Both" to appear in their dedicated categories.
                          </Text>
                        </View>
                      </>
                    )}

                    <Text style={styles.label}>Dietary Info</Text>
                    <View style={styles.dietarySelector}>
                      {['gf', 'gfa', 'v', 'va'].map(info => (
                        <Pressable
                          key={info}
                          style={[
                            styles.dietaryButton,
                            itemDietaryInfo.includes(info) && styles.dietaryButtonActive
                          ]}
                          onPress={() => toggleDietaryInfo(info)}
                        >
                          <Text style={[
                            styles.dietaryButtonText,
                            itemDietaryInfo.includes(info) && styles.dietaryButtonTextActive
                          ]}>
                            {info.toUpperCase()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.label}>Display Order</Text>
                    <TextInput
                      style={styles.input}
                      value={itemDisplayOrder}
                      onChangeText={setItemDisplayOrder}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Category Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={categoryName}
                      onChangeText={setCategoryName}
                      placeholder="Enter category name"
                      placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={styles.label}>Meal Type</Text>
                    <View style={styles.mealTypeSelector}>
                      {(['lunch', 'dinner', 'both'] as const).map(type => (
                        <Pressable
                          key={type}
                          style={[
                            styles.mealTypeButton,
                            categoryMealType === type && styles.mealTypeButtonActive
                          ]}
                          onPress={() => setCategoryMealType(type)}
                        >
                          <Text style={[
                            styles.mealTypeButtonText,
                            categoryMealType === type && styles.mealTypeButtonTextActive
                          ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.label}>Display Order</Text>
                    <TextInput
                      style={styles.input}
                      value={categoryDisplayOrder}
                      onChangeText={setCategoryDisplayOrder}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                    />
                  </>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={editMode === 'item' ? handleSaveItem : handleSaveCategory}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.managerAccent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addCategoryButton: {
    backgroundColor: colors.managerSecondary,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filters: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoriesHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
  },
  categoryCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryCardMealType: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  categoryDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  menuItemCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemContent: {
    flexDirection: 'row',
    gap: 12,
  },
  menuItemThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  menuItemDetails: {
    flex: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.managerAccent,
    marginLeft: 12,
  },
  menuItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  menuItemSubcategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.managerAccent,
    marginBottom: 4,
  },
  menuItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemMealType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.managerAccent,
    textTransform: 'capitalize',
  },
  menuItemDietary: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: colors.managerAccent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    gap: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  changeImageButton: {
    flex: 1,
    backgroundColor: colors.managerAccent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  changeImageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  removeImageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerOptionActive: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  pickerOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mealTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  mealTypeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dietarySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dietaryButtonActive: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
  },
  dietaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  dietaryButtonTextActive: {
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning || '#FFA500',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.managerAccent,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
