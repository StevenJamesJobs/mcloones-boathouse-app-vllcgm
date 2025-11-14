
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import { useMenuEditor, MenuItem, MenuCategory } from '@/hooks/useMenu';
import { supabase } from '@/app/integrations/supabase/client';

type EditMode = 'add' | 'edit';

export default function MenuEditorScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('add');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);

  // Item form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [mealType, setMealType] = useState<'lunch' | 'dinner' | 'both'>('both');
  const [subcategory, setSubcategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [dietaryInfo, setDietaryInfo] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryMealType, setCategoryMealType] = useState<'lunch' | 'dinner' | 'both'>('both');
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState('0');

  const { categories, items, loading, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, updateCategory, deleteCategory } = useMenuEditor();

  const openAddItemModal = () => {
    setEditMode('add');
    setSelectedItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setMealType('both');
    setSubcategory('');
    setImageUri(null);
    setImageUrl(null);
    setIsAvailable(true);
    setDisplayOrder('0');
    setDietaryInfo([]);
    setModalVisible(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditMode('edit');
    setSelectedItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price?.toString() || '');
    setCategoryId(item.category_id || '');
    setMealType(item.meal_type);
    setSubcategory(item.subcategory || '');
    setImageUri(null);
    setImageUrl(item.image_url || null);
    setIsAvailable(item.is_available);
    setDisplayOrder(item.display_order?.toString() || '0');
    setDietaryInfo(item.dietary_info || []);
    setModalVisible(true);
  };

  const openAddCategoryModal = () => {
    setEditMode('add');
    setSelectedCategory(null);
    setCategoryName('');
    setCategoryMealType('both');
    setCategoryDisplayOrder('0');
    setCategoryModalVisible(true);
  };

  const openEditCategoryModal = (category: MenuCategory) => {
    setEditMode('edit');
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryMealType(category.meal_type);
    setCategoryDisplayOrder(category.display_order?.toString() || '0');
    setCategoryModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('menu-thumbnails')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('menu-thumbnails')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageUrl(null);
  };

  const handleSaveItem = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Validation: Prevent Wine, Libations, or Happy Hour from being added to Lunch or Dinner
    const selectedCategoryObj = categories.find(cat => cat.id === categoryId);
    if (selectedCategoryObj && (mealType === 'lunch' || mealType === 'dinner')) {
      if (selectedCategoryObj.name === 'Wine' || selectedCategoryObj.name === 'Libations' || selectedCategoryObj.name === 'Happy Hour') {
        Alert.alert(
          'Invalid Category',
          `${selectedCategoryObj.name} items cannot be added to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} menu. Please select "Both" as the meal type or choose a different category.`
        );
        return;
      }
    }

    let finalImageUrl = imageUrl;
    if (imageUri) {
      const uploadedUrl = await uploadImage(imageUri);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    }

    const itemData = {
      name: name.trim(),
      description: description.trim() || null,
      price: price ? parseFloat(price) : null,
      category_id: categoryId,
      meal_type: mealType,
      subcategory: subcategory.trim() || null,
      image_url: finalImageUrl,
      is_available: isAvailable,
      display_order: parseInt(displayOrder) || 0,
      dietary_info: dietaryInfo.length > 0 ? dietaryInfo : null,
    };

    if (editMode === 'add') {
      const result = await addMenuItem(itemData);
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Menu item added successfully');
        setModalVisible(false);
      }
    } else if (selectedItem) {
      const result = await updateMenuItem(selectedItem.id, itemData);
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Menu item updated successfully');
        setModalVisible(false);
      }
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteMenuItem(item.id);
            if (result.error) {
              Alert.alert('Error', result.error);
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

    if (editMode === 'add') {
      const result = await addCategory(categoryData);
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Category added successfully');
        setCategoryModalVisible(false);
      }
    } else if (selectedCategory) {
      const result = await updateCategory(selectedCategory.id, categoryData);
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Category updated successfully');
        setCategoryModalVisible(false);
      }
    }
  };

  const handleDeleteCategory = async (category: MenuCategory) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This will also delete all items in this category.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCategory(category.id);
            if (result.error) {
              Alert.alert('Error', result.error);
            } else {
              Alert.alert('Success', 'Category deleted successfully');
            }
          },
        },
      ]
    );
  };

  const toggleDietaryInfo = (info: string) => {
    if (dietaryInfo.includes(info)) {
      setDietaryInfo(dietaryInfo.filter(i => i !== info));
    } else {
      setDietaryInfo([...dietaryInfo, info]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Menu Editor',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.text,
        }}
      />

      <View style={[commonStyles.container, styles.container]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Categories Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <Pressable style={styles.addButton} onPress={openAddCategoryModal}>
                  <IconSymbol name="plus.circle.fill" color="#FFFFFF" size={20} />
                  <Text style={styles.addButtonText}>Add Category</Text>
                </Pressable>
              </View>

              {categories.map((category) => (
                <View key={category.id} style={commonStyles.card}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{category.name}</Text>
                      <Text style={styles.itemDetail}>
                        Meal Type: {category.meal_type} • Order: {category.display_order}
                      </Text>
                    </View>
                    <View style={styles.itemActions}>
                      <Pressable
                        style={styles.actionButton}
                        onPress={() => openEditCategoryModal(category)}
                      >
                        <IconSymbol name="pencil" color={colors.accent} size={20} />
                      </Pressable>
                      <Pressable
                        style={styles.actionButton}
                        onPress={() => handleDeleteCategory(category)}
                      >
                        <IconSymbol name="trash" color={colors.error} size={20} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Menu Items Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Menu Items</Text>
                <Pressable style={styles.addButton} onPress={openAddItemModal}>
                  <IconSymbol name="plus.circle.fill" color="#FFFFFF" size={20} />
                  <Text style={styles.addButtonText}>Add Item</Text>
                </Pressable>
              </View>

              {items.map((item) => {
                const category = categories.find(cat => cat.id === item.category_id);
                return (
                  <View key={item.id} style={commonStyles.card}>
                    <View style={styles.itemRow}>
                      {item.image_url && (
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.itemThumbnail}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemDetail}>
                          {category?.name} • {item.meal_type}
                          {item.subcategory && ` • ${item.subcategory}`}
                        </Text>
                        {item.price && (
                          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                        )}
                        <Text style={[styles.itemStatus, !item.is_available && styles.itemStatusInactive]}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Text>
                      </View>
                      <View style={styles.itemActions}>
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => openEditItemModal(item)}
                        >
                          <IconSymbol name="pencil" color={colors.accent} size={20} />
                        </Pressable>
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => handleDeleteItem(item)}
                        >
                          <IconSymbol name="trash" color={colors.error} size={20} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Item Modal */}
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
                  {editMode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Item name"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Item description"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Category *</Text>
                <View style={styles.pickerContainer}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.pickerOption,
                        categoryId === cat.id && styles.pickerOptionActive,
                      ]}
                      onPress={() => setCategoryId(cat.id)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          categoryId === cat.id && styles.pickerOptionTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Meal Type *</Text>
                <View style={styles.pickerContainer}>
                  {(['lunch', 'dinner', 'both'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.pickerOption,
                        mealType === type && styles.pickerOptionActive,
                      ]}
                      onPress={() => setMealType(type)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          mealType === type && styles.pickerOptionTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Subcategory (for Wine/Libations/Happy Hour)</Text>
                <TextInput
                  style={styles.input}
                  value={subcategory}
                  onChangeText={setSubcategory}
                  placeholder="e.g., Red Wine, Cocktails, Appetizers"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Display Order</Text>
                <TextInput
                  style={styles.input}
                  value={displayOrder}
                  onChangeText={setDisplayOrder}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />

                <Text style={styles.label}>Dietary Information</Text>
                <View style={styles.dietaryContainer}>
                  {['gf', 'gfa', 'v', 'va'].map((info) => (
                    <Pressable
                      key={info}
                      style={[
                        styles.dietaryButton,
                        dietaryInfo.includes(info) && styles.dietaryButtonActive,
                      ]}
                      onPress={() => toggleDietaryInfo(info)}
                    >
                      <Text
                        style={[
                          styles.dietaryButtonText,
                          dietaryInfo.includes(info) && styles.dietaryButtonTextActive,
                        ]}
                      >
                        {info.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Image</Text>
                {(imageUri || imageUrl) && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: imageUri || imageUrl || '' }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <Pressable style={styles.removeImageButton} onPress={removeImage}>
                      <IconSymbol name="xmark.circle.fill" color={colors.error} size={24} />
                    </Pressable>
                  </View>
                )}
                <Pressable style={styles.uploadButton} onPress={pickImage} disabled={uploading}>
                  <IconSymbol name="photo" color={colors.accent} size={20} />
                  <Text style={styles.uploadButtonText}>
                    {uploading ? 'Uploading...' : 'Upload Thumbnail'}
                  </Text>
                </Pressable>

                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Available</Text>
                  <Pressable
                    style={[styles.switch, isAvailable && styles.switchActive]}
                    onPress={() => setIsAvailable(!isAvailable)}
                  >
                    <View style={[styles.switchThumb, isAvailable && styles.switchThumbActive]} />
                  </Pressable>
                </View>

                <Pressable style={styles.saveButton} onPress={handleSaveItem} disabled={uploading}>
                  <Text style={styles.saveButtonText}>
                    {uploading ? 'Uploading...' : editMode === 'add' ? 'Add Item' : 'Save Changes'}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Category Modal */}
        <Modal
          visible={categoryModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMode === 'add' ? 'Add Category' : 'Edit Category'}
                </Text>
                <Pressable onPress={() => setCategoryModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder="Category name"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Meal Type *</Text>
                <View style={styles.pickerContainer}>
                  {(['lunch', 'dinner', 'both'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.pickerOption,
                        categoryMealType === type && styles.pickerOptionActive,
                      ]}
                      onPress={() => setCategoryMealType(type)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          categoryMealType === type && styles.pickerOptionTextActive,
                        ]}
                      >
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

                <Pressable style={styles.saveButton} onPress={handleSaveCategory}>
                  <Text style={styles.saveButtonText}>
                    {editMode === 'add' ? 'Add Category' : 'Save Changes'}
                  </Text>
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  itemThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  itemStatusInactive: {
    color: colors.error,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerOptionActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pickerOptionTextActive: {
    color: '#FFFFFF',
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dietaryButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dietaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  dietaryButtonTextActive: {
    color: '#FFFFFF',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    padding: 2,
  },
  switchActive: {
    backgroundColor: colors.accent,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
