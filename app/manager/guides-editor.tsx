
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useGuidesEditor, Guide, GuideCategory } from '@/hooks/useGuides';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/app/integrations/supabase/client';

export default function GuidesEditorScreen() {
  const { guides, loading, error, addGuide, updateGuide, deleteGuide } = useGuidesEditor();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Form states
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [guideTitle, setGuideTitle] = useState('');
  const [guideDescription, setGuideDescription] = useState('');
  const [guideCategory, setGuideCategory] = useState<GuideCategory>('Employee HandBooks');
  const [guideDisplayOrder, setGuideDisplayOrder] = useState('0');
  const [guideFileUrl, setGuideFileUrl] = useState<string | null>(null);
  const [guideFileType, setGuideFileType] = useState<string>('');
  const [guideFileSize, setGuideFileSize] = useState<number | null>(null);

  const categories: GuideCategory[] = [
    'Employee HandBooks',
    'Full Menus',
    'Cheat Sheets',
    'Events Flyers',
  ];

  // Filter guides by selected category
  const filteredGuides = selectedCategoryFilter === 'all' 
    ? guides 
    : guides.filter(guide => guide.category === selectedCategoryFilter);

  // Group guides by category
  const groupedGuides = filteredGuides.reduce((acc, guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<string, Guide[]>);

  const openAddGuideModal = () => {
    setEditingGuide(null);
    setGuideTitle('');
    setGuideDescription('');
    setGuideCategory('Employee HandBooks');
    setGuideDisplayOrder('0');
    setGuideFileUrl(null);
    setGuideFileType('');
    setGuideFileSize(null);
    setModalVisible(true);
  };

  const openEditGuideModal = (guide: Guide) => {
    setEditingGuide(guide);
    setGuideTitle(guide.title);
    setGuideDescription(guide.description || '');
    setGuideCategory(guide.category as GuideCategory);
    setGuideDisplayOrder(guide.display_order.toString());
    setGuideFileUrl(guide.file_url);
    setGuideFileType(guide.file_type);
    setGuideFileSize(guide.file_size);
    setModalVisible(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadFile = async (file: DocumentPicker.DocumentPickerAsset) => {
    try {
      setUploadingFile(true);
      console.log('Starting file upload:', file);

      // Get file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Generated filename:', fileName);

      // Fetch the file as a blob
      const response = await fetch(file.uri);
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
        .from('guides')
        .upload(filePath, arrayBuffer, {
          contentType: blob.type || file.mimeType || 'application/octet-stream',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      console.log('Upload successful, data:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('guides')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setGuideFileUrl(publicUrl);
      setGuideFileType(fileExt);
      setGuideFileSize(file.size || null);
      
      // Auto-fill title if empty
      if (!guideTitle) {
        setGuideTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      Alert.alert('Success', 'File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = () => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setGuideFileUrl(null);
            setGuideFileType('');
            setGuideFileSize(null);
          },
        },
      ]
    );
  };

  const handleSaveGuide = async () => {
    if (!guideTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!guideFileUrl) {
      Alert.alert('Error', 'Please upload a file');
      return;
    }

    const guideData = {
      title: guideTitle.trim(),
      description: guideDescription.trim() || null,
      file_url: guideFileUrl,
      file_type: guideFileType,
      file_size: guideFileSize,
      category: guideCategory,
      display_order: parseInt(guideDisplayOrder) || 0,
      is_active: true,
    };

    console.log('Saving guide with data:', guideData);

    if (editingGuide) {
      const { error } = await updateGuide(editingGuide.id, guideData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Guide updated successfully');
    } else {
      const { error } = await addGuide(guideData as any);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Guide added successfully');
    }

    setModalVisible(false);
  };

  const handleDeleteGuide = (guide: Guide) => {
    Alert.alert(
      'Delete Guide',
      `Are you sure you want to delete "${guide.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteGuide(guide.id, guide.file_url);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Guide deleted successfully');
            }
          },
        },
      ]
    );
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return { ios: 'doc.fill', android: 'description' };
      case 'jpg':
      case 'jpeg':
      case 'png':
        return { ios: 'photo.fill', android: 'image' };
      case 'xlsx':
      case 'xls':
        return { ios: 'tablecells.fill', android: 'table_chart' };
      case 'doc':
      case 'docx':
        return { ios: 'doc.text.fill', android: 'article' };
      default:
        return { ios: 'doc.fill', android: 'description' };
    }
  };

  const isImageFile = (fileType: string) => {
    return ['jpg', 'jpeg', 'png'].includes(fileType.toLowerCase());
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Guides Editor',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        {/* Action Button */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.addButton} onPress={openAddGuideModal}>
            <IconSymbol 
              ios_icon_name="plus.circle.fill" 
              android_material_icon_name="add_circle" 
              color="#FFFFFF" 
              size={20} 
            />
            <Text style={styles.addButtonText}>Add Guide</Text>
          </Pressable>
        </View>

        {/* Category Filter */}
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <Pressable
              style={[styles.filterButton, selectedCategoryFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedCategoryFilter('all')}
            >
              <Text style={[styles.filterButtonText, selectedCategoryFilter === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[styles.filterButton, selectedCategoryFilter === category && styles.filterButtonActive]}
                onPress={() => setSelectedCategoryFilter(category)}
              >
                <Text style={[styles.filterButtonText, selectedCategoryFilter === category && styles.filterButtonTextActive]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Guides List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.managerAccent} />
            <Text style={styles.loadingText}>Loading guides...</Text>
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
            {Object.entries(groupedGuides).map(([category, categoryGuides]) => (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {categoryGuides.map((guide) => {
                  const icon = getIconForType(guide.file_type);
                  return (
                    <Pressable
                      key={guide.id}
                      style={styles.guideCard}
                      onPress={() => openEditGuideModal(guide)}
                    >
                      <View style={styles.guideContent}>
                        {isImageFile(guide.file_type) ? (
                          <Image
                            source={{ uri: guide.file_url }}
                            style={styles.guideThumbnail}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.guideIconContainer}>
                            <IconSymbol 
                              ios_icon_name={icon.ios as any}
                              android_material_icon_name={icon.android}
                              color={colors.managerAccent} 
                              size={32} 
                            />
                          </View>
                        )}
                        <View style={styles.guideDetails}>
                          <Text style={styles.guideName}>{guide.title}</Text>
                          {guide.description && (
                            <Text style={styles.guideDescription} numberOfLines={2}>
                              {guide.description}
                            </Text>
                          )}
                          <View style={styles.guideFooter}>
                            <Text style={styles.guideType}>{guide.file_type.toUpperCase()}</Text>
                            {guide.file_size && (
                              <Text style={styles.guideSize}>
                                {(guide.file_size / 1024 / 1024).toFixed(2)} MB
                              </Text>
                            )}
                            <Pressable
                              style={styles.deleteButton}
                              onPress={() => handleDeleteGuide(guide)}
                            >
                              <IconSymbol 
                                ios_icon_name="trash" 
                                android_material_icon_name="delete" 
                                color={colors.error} 
                                size={18} 
                              />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {guides.length === 0 && (
              <View style={styles.emptyState}>
                <IconSymbol 
                  ios_icon_name="doc.text.magnifyingglass" 
                  android_material_icon_name="search" 
                  color={colors.textSecondary} 
                  size={64} 
                />
                <Text style={styles.emptyStateText}>No guides yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add your first guide to get started
                </Text>
              </View>
            )}
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
                  {editingGuide ? 'Edit Guide' : 'Add Guide'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel" 
                    color={colors.textSecondary} 
                    size={28} 
                  />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={guideTitle}
                  onChangeText={setGuideTitle}
                  placeholder="Enter guide title"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={guideDescription}
                  onChangeText={setGuideDescription}
                  placeholder="Enter description"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.label}>Category *</Text>
                <View style={styles.categorySelector}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.categoryButton,
                        guideCategory === cat && styles.categoryButtonActive
                      ]}
                      onPress={() => setGuideCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        guideCategory === cat && styles.categoryButtonTextActive
                      ]}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>File *</Text>
                {guideFileUrl ? (
                  <View style={styles.filePreviewContainer}>
                    {isImageFile(guideFileType) ? (
                      <Image
                        source={{ uri: guideFileUrl }}
                        style={styles.filePreview}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.filePreviewPlaceholder}>
                        <IconSymbol 
                          ios_icon_name={getIconForType(guideFileType).ios as any}
                          android_material_icon_name={getIconForType(guideFileType).android}
                          color={colors.managerAccent} 
                          size={48} 
                        />
                        <Text style={styles.filePreviewText}>{guideFileType.toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.fileActions}>
                      <Pressable
                        style={styles.changeFileButton}
                        onPress={pickDocument}
                        disabled={uploadingFile}
                      >
                        <IconSymbol 
                          ios_icon_name="arrow.triangle.2.circlepath" 
                          android_material_icon_name="sync" 
                          color="#FFFFFF" 
                          size={16} 
                        />
                        <Text style={styles.changeFileButtonText}>Change</Text>
                      </Pressable>
                      <Pressable
                        style={styles.removeFileButton}
                        onPress={removeFile}
                        disabled={uploadingFile}
                      >
                        <IconSymbol 
                          ios_icon_name="trash" 
                          android_material_icon_name="delete" 
                          color="#FFFFFF" 
                          size={16} 
                        />
                        <Text style={styles.removeFileButtonText}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    style={styles.uploadButton}
                    onPress={pickDocument}
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <IconSymbol 
                          ios_icon_name="doc.badge.plus" 
                          android_material_icon_name="upload_file" 
                          color="#FFFFFF" 
                          size={24} 
                        />
                        <Text style={styles.uploadButtonText}>Upload File</Text>
                        <Text style={styles.uploadButtonSubtext}>
                          PDF, JPG, PNG, Excel, Word
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}

                <Text style={styles.label}>Display Order</Text>
                <TextInput
                  style={styles.input}
                  value={guideDisplayOrder}
                  onChangeText={setGuideDisplayOrder}
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
                  onPress={handleSaveGuide}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.managerAccent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
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
  guideCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guideContent: {
    flexDirection: 'row',
    gap: 12,
  },
  guideThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  guideIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.employeePrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideDetails: {
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  guideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guideType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  guideSize: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
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
  categorySelector: {
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.managerAccent,
    borderColor: colors.managerAccent,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: colors.managerAccent,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  filePreviewContainer: {
    gap: 12,
  },
  filePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  filePreviewPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  filePreviewText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  fileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  changeFileButton: {
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
  changeFileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeFileButton: {
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
  removeFileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
