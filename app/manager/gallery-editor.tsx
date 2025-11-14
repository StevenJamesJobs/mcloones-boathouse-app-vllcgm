
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useGalleryEditor, GalleryImage } from '@/hooks/useGallery';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/app/integrations/supabase/client';

export default function GalleryEditorScreen() {
  const { images, loading, addImage, updateImage, deleteImage } = useGalleryEditor();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'dining' | 'banquets' | 'events'>('dining');
  const [caption, setCaption] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'dining' | 'banquets' | 'events'>('all');

  const filteredImages = filterCategory === 'all' 
    ? images 
    : images.filter(img => img.category === filterCategory);

  const groupedImages = filteredImages.reduce((acc, img) => {
    if (!acc[img.category]) {
      acc[img.category] = [];
    }
    acc[img.category].push(img);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  const openAddModal = () => {
    setEditingImage(null);
    setSelectedCategory('dining');
    setCaption('');
    setDisplayOrder('0');
    setImageUrl(null);
    setModalVisible(true);
  };

  const openEditModal = (image: GalleryImage) => {
    setEditingImage(image);
    setSelectedCategory(image.category);
    setCaption(image.caption || '');
    setDisplayOrder(image.display_order.toString());
    setImageUrl(image.image_url);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library');
        return;
      }

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

      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Generated filename:', fileName);

      const response = await fetch(uri);
      const blob = await response.blob();
      
      console.log('Blob created, size:', blob.size, 'type:', blob.type);

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

      const { data, error } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, arrayBuffer, {
          contentType: blob.type || `image/${fileExt}`,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      console.log('Upload successful, data:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setImageUrl(publicUrl);
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
          onPress: () => setImageUrl(null),
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please upload an image');
      return;
    }

    const imageData = {
      image_url: imageUrl,
      category: selectedCategory,
      caption: caption.trim() || null,
      display_order: parseInt(displayOrder) || 0,
      is_active: true,
    };

    console.log('Saving gallery image with data:', imageData);

    if (editingImage) {
      const { error } = await updateImage(editingImage.id, imageData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Gallery image updated successfully');
    } else {
      const { error } = await addImage(imageData as any);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Gallery image added successfully');
    }

    setModalVisible(false);
  };

  const handleDelete = (image: GalleryImage) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteImage(image.id, image.image_url);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Gallery image deleted successfully');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (image: GalleryImage) => {
    const { error } = await updateImage(image.id, { is_active: !image.is_active });
    if (error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gallery Editor',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <Pressable onPress={openAddModal} style={styles.headerButton}>
              <IconSymbol name="plus.circle.fill" color="#FFFFFF" size={28} />
            </Pressable>
          ),
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        {/* Category Filters */}
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['all', 'dining', 'banquets', 'events'] as const).map(cat => (
              <Pressable
                key={cat}
                style={[styles.filterButton, filterCategory === cat && styles.filterButtonActive]}
                onPress={() => setFilterCategory(cat)}
              >
                <Text style={[styles.filterButtonText, filterCategory === cat && styles.filterButtonTextActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.managerAccent} />
            <Text style={styles.loadingText}>Loading gallery...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.infoText}>
              Manage gallery images for the customer-facing gallery page. Images are organized by category: Dining, Banquets, and Events.
            </Text>

            {Object.keys(groupedImages).length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="photo.on.rectangle" color={colors.textSecondary} size={64} />
                <Text style={styles.emptyText}>No gallery images yet</Text>
                <Text style={styles.emptySubtext}>Tap the + button to add your first image</Text>
              </View>
            ) : (
              Object.entries(groupedImages).map(([category, categoryImages]) => (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <View style={styles.imagesGrid}>
                    {categoryImages.map(image => (
                      <Pressable
                        key={image.id}
                        style={styles.imageCard}
                        onPress={() => openEditModal(image)}
                      >
                        <Image
                          source={{ uri: image.image_url }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        {image.caption && (
                          <Text style={styles.imageCaption} numberOfLines={2}>
                            {image.caption}
                          </Text>
                        )}
                        <View style={styles.imageActions}>
                          <Pressable
                            style={[
                              styles.activeToggle,
                              image.is_active && styles.activeToggleOn,
                            ]}
                            onPress={() => toggleActive(image)}
                          >
                            <Text style={styles.activeToggleText}>
                              {image.is_active ? 'Active' : 'Inactive'}
                            </Text>
                          </Pressable>
                          <Pressable
                            style={styles.deleteIconButton}
                            onPress={() => handleDelete(image)}
                          >
                            <IconSymbol name="trash" color={colors.error} size={18} />
                          </Pressable>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Add/Edit Modal */}
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
                  {editingImage ? 'Edit Gallery Image' : 'Add Gallery Image'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Image *</Text>
                {imageUrl ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.imagePreviewLarge}
                      resizeMode="cover"
                    />
                    <View style={styles.imageActionsRow}>
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
                        <Text style={styles.uploadButtonText}>Upload Image</Text>
                      </>
                    )}
                  </Pressable>
                )}

                <Text style={styles.label}>Category *</Text>
                <View style={styles.categorySelector}>
                  {(['dining', 'banquets', 'events'] as const).map(cat => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.categoryButton,
                        selectedCategory === cat && styles.categoryButtonActive
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        selectedCategory === cat && styles.categoryButtonTextActive
                      ]}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Caption (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Enter a caption for this image"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
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
                  onPress={handleSave}
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
  headerButton: {
    padding: 4,
    marginRight: 8,
  },
  filters: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.border,
  },
  imageCaption: {
    fontSize: 12,
    color: colors.text,
    padding: 8,
    lineHeight: 16,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  activeToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  activeToggleOn: {
    backgroundColor: colors.managerAccent,
  },
  activeToggleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteIconButton: {
    padding: 4,
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
  imagePreviewLarge: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  imageActionsRow: {
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
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
