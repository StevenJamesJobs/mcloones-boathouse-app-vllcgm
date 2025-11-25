
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useSpecialFeaturesEditor, SpecialFeature } from '@/hooks/useSpecialFeatures';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/app/integrations/supabase/client';

export default function SpecialFeaturesEditorScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFeature, setEditingFeature] = useState<SpecialFeature | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [displayStyle, setDisplayStyle] = useState<'banner' | 'square'>('banner');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const { features, loading, refetch, addFeature, updateFeature, deleteFeature } = useSpecialFeaturesEditor();

  const openAddModal = () => {
    setEditingFeature(null);
    setTitle('');
    setDescription('');
    setStartDate(null);
    setEndDate(null);
    setLinkUrl('');
    setDisplayOrder('0');
    setDisplayStyle('banner');
    setImageUrl(null);
    setModalVisible(true);
  };

  const openEditModal = (feature: SpecialFeature) => {
    setEditingFeature(feature);
    setTitle(feature.title);
    setDescription(feature.description);
    setStartDate(feature.start_date ? new Date(feature.start_date) : null);
    setEndDate(feature.end_date ? new Date(feature.end_date) : null);
    setLinkUrl(feature.link_url || '');
    setDisplayOrder(feature.display_order.toString());
    setDisplayStyle(feature.display_style);
    setImageUrl(feature.image_url || null);
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
        aspect: displayStyle === 'banner' ? [16, 9] : [1, 1],
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
        .from('special-features-thumbnails')
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
        .from('special-features-thumbnails')
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
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const featureData = {
      title: title.trim(),
      description: description.trim(),
      start_date: startDate ? startDate.toISOString().split('T')[0] : null,
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      link_url: linkUrl.trim() || null,
      image_url: imageUrl || null,
      display_style: displayStyle,
      is_active: true,
      display_order: parseInt(displayOrder) || 0,
    };

    if (editingFeature) {
      const { error } = await updateFeature(editingFeature.id, featureData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Special feature updated successfully');
    } else {
      const { error } = await addFeature(featureData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Special feature added successfully');
    }

    setModalVisible(false);
  };

  const handleDelete = (feature: SpecialFeature) => {
    Alert.alert(
      'Delete Special Feature',
      `Are you sure you want to delete "${feature.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteFeature(feature.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Special feature deleted successfully');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (feature: SpecialFeature) => {
    const { error } = await updateFeature(feature.id, { is_active: !feature.is_active });
    if (error) {
      Alert.alert('Error', error);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Special Features Editor',
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.managerAccent} />
            <Text style={styles.loadingText}>Loading special features...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.infoText}>
              Manage special features that will appear on the customer home screen. Choose between banner or square display styles.
            </Text>

            {features.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="star.fill" color={colors.textSecondary} size={64} />
                <Text style={styles.emptyText}>No special features yet</Text>
                <Text style={styles.emptySubtext}>Tap the + button to add your first special feature</Text>
              </View>
            ) : (
              features.map((feature) => (
                <View key={feature.id} style={styles.featureCard}>
                  {feature.image_url && (
                    <Pressable onPress={() => setExpandedImage(feature.image_url)}>
                      <Image
                        source={{ uri: feature.image_url }}
                        style={[
                          styles.featureThumbnail,
                          feature.display_style === 'square' && styles.featureThumbnailSquare
                        ]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  )}
                  <View style={styles.featureHeader}>
                    <View style={styles.featureTitleContainer}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <View style={styles.featureMeta}>
                        <View style={[
                          styles.displayStyleBadge,
                          feature.display_style === 'square' && styles.displayStyleBadgeSquare
                        ]}>
                          <Text style={styles.displayStyleText}>
                            {feature.display_style === 'banner' ? 'Banner' : 'Square'}
                          </Text>
                        </View>
                        {feature.start_date && (
                          <Text style={styles.featureDate}>
                            Starts: {new Date(feature.start_date).toLocaleDateString()}
                          </Text>
                        )}
                        {feature.end_date && (
                          <Text style={styles.featureDate}>
                            Ends: {new Date(feature.end_date).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Pressable
                      onPress={() => toggleActive(feature)}
                      style={[
                        styles.activeToggle,
                        feature.is_active && styles.activeToggleOn,
                      ]}
                    >
                      <Text style={styles.activeToggleText}>
                        {feature.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={styles.featureDescription} numberOfLines={2}>
                    {feature.description}
                  </Text>

                  {feature.link_url && (
                    <Text style={styles.featureLink} numberOfLines={1}>
                      Link: {feature.link_url}
                    </Text>
                  )}

                  <View style={styles.featureActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => openEditModal(feature)}
                    >
                      <IconSymbol name="pencil" color={colors.managerAccent} size={20} />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDelete(feature)}
                    >
                      <IconSymbol name="trash" color={colors.error} size={20} />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* Add/Edit Feature Modal */}
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
                {editingFeature ? 'Edit Special Feature' : 'Add Special Feature'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Feature title"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Feature description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Display Style *</Text>
                <View style={styles.displayStyleSelector}>
                  <Pressable
                    style={[
                      styles.displayStyleOption,
                      displayStyle === 'banner' && styles.displayStyleOptionSelected
                    ]}
                    onPress={() => setDisplayStyle('banner')}
                  >
                    <IconSymbol 
                      name="rectangle.fill" 
                      color={displayStyle === 'banner' ? '#FFFFFF' : colors.managerAccent} 
                      size={24} 
                    />
                    <Text style={[
                      styles.displayStyleOptionText,
                      displayStyle === 'banner' && styles.displayStyleOptionTextSelected
                    ]}>
                      Banner (Wide)
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.displayStyleOption,
                      displayStyle === 'square' && styles.displayStyleOptionSelected
                    ]}
                    onPress={() => setDisplayStyle('square')}
                  >
                    <IconSymbol 
                      name="square.fill" 
                      color={displayStyle === 'square' ? '#FFFFFF' : colors.managerAccent} 
                      size={24} 
                    />
                    <Text style={[
                      styles.displayStyleOptionText,
                      displayStyle === 'square' && styles.displayStyleOptionTextSelected
                    ]}>
                      Square
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Thumbnail Image (Optional)</Text>
                {imageUrl ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: imageUrl }}
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
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Start Date (Optional)</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {startDate ? startDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'Select start date'}
                  </Text>
                  <IconSymbol name="calendar" color={colors.accent} size={20} />
                </Pressable>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onStartDateChange}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>End Date (Optional)</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {endDate ? endDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'Select end date'}
                  </Text>
                  <IconSymbol name="calendar" color={colors.accent} size={20} />
                </Pressable>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onEndDateChange}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Link URL (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Display Order</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={displayOrder}
                  onChangeText={setDisplayOrder}
                  keyboardType="numeric"
                />
              </View>

              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingFeature ? 'Update Feature' : 'Add Feature'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Expanded Image Modal */}
      <Modal
        visible={expandedImage !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setExpandedImage(null)}
      >
        <View style={styles.expandedModalOverlay}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setExpandedImage(null)}
          >
            <IconSymbol name="xmark.circle.fill" color="#FFFFFF" size={36} />
          </Pressable>
          {expandedImage && (
            <Image
              source={{ uri: expandedImage }}
              style={styles.expandedImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.employeeBackground,
  },
  headerButton: {
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
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.border,
  },
  featureThumbnailSquare: {
    height: 200,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureMeta: {
    flexDirection: 'column',
    gap: 4,
  },
  displayStyleBadge: {
    backgroundColor: colors.managerAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  displayStyleBadgeSquare: {
    backgroundColor: colors.accent,
  },
  displayStyleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureDate: {
    fontSize: 12,
    color: colors.managerAccent,
    fontWeight: '500',
  },
  activeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  activeToggleOn: {
    backgroundColor: colors.managerAccent,
  },
  activeToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  featureLink: {
    fontSize: 12,
    color: colors.accent,
    marginBottom: 12,
  },
  featureActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.highlight,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  displayStyleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  displayStyleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.managerAccent,
    backgroundColor: colors.background,
  },
  displayStyleOptionSelected: {
    backgroundColor: colors.managerAccent,
  },
  displayStyleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  displayStyleOptionTextSelected: {
    color: '#FFFFFF',
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
    height: 150,
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.background,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.managerAccent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  expandedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  expandedImage: {
    width: '100%',
    height: '100%',
  },
});
