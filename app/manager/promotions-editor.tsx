
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { usePromotions, AppPromotion } from '@/hooks/usePromotions';
import { supabase } from '@/app/integrations/supabase/client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PromotionsEditorScreen() {
  const { promotions, loading, refetch } = usePromotions();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<AppPromotion | null>(null);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed-amount' | 'free-item'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const openEditModal = (promotion?: AppPromotion) => {
    if (promotion) {
      setSelectedPromotion(promotion);
      setTitle(promotion.title);
      setDescription(promotion.description);
      setPromoCode(promotion.promo_code || '');
      setDiscountType(promotion.discount_type);
      setDiscountValue(promotion.discount_value?.toString() || '');
      setMinOrderAmount(promotion.min_order_amount?.toString() || '');
      setMaxUses(promotion.max_uses?.toString() || '');
      setValidFrom(promotion.valid_from.split('T')[0]);
      setValidUntil(promotion.valid_until.split('T')[0]);
      setImageUrl(promotion.image_url || '');
    } else {
      setSelectedPromotion(null);
      setTitle('');
      setDescription('');
      setPromoCode('');
      setDiscountType('percentage');
      setDiscountValue('');
      setMinOrderAmount('');
      setMaxUses('');
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setValidFrom(today);
      setValidUntil(nextMonth);
      setImageUrl('');
    }
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      try {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const fileExt = asset.uri.split('.').pop();
        const fileName = `promotion-${Date.now()}.${fileExt}`;
        const filePath = `promotions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        setImageUrl(publicUrl);
        Alert.alert('Success', 'Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!discountValue) {
      Alert.alert('Error', 'Please enter a discount value');
      return;
    }

    if (!validFrom || !validUntil) {
      Alert.alert('Error', 'Please enter valid dates');
      return;
    }

    setSaving(true);

    try {
      const promotionData = {
        title,
        description,
        promo_code: promoCode.toUpperCase() || null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        max_uses: maxUses ? parseInt(maxUses) : null,
        valid_from: new Date(validFrom).toISOString(),
        valid_until: new Date(validUntil).toISOString(),
        image_url: imageUrl || null,
        is_active: true,
      };

      if (selectedPromotion) {
        const { error } = await supabase
          .from('app_promotions')
          .update(promotionData)
          .eq('id', selectedPromotion.id);

        if (error) throw error;
        Alert.alert('Success', 'Promotion updated successfully');
      } else {
        const { error } = await supabase
          .from('app_promotions')
          .insert([promotionData]);

        if (error) throw error;
        Alert.alert('Success', 'Promotion created successfully');
      }

      setEditModalVisible(false);
      refetch();
    } catch (error) {
      console.error('Error saving promotion:', error);
      Alert.alert('Error', 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (promotion: AppPromotion) => {
    Alert.alert(
      'Delete Promotion',
      'Are you sure you want to delete this promotion?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('app_promotions')
                .delete()
                .eq('id', promotion.id);

              if (error) throw error;
              Alert.alert('Success', 'Promotion deleted successfully');
              refetch();
            } catch (error) {
              console.error('Error deleting promotion:', error);
              Alert.alert('Error', 'Failed to delete promotion');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (promotion: AppPromotion) => {
    try {
      const { error } = await supabase
        .from('app_promotions')
        .update({ is_active: !promotion.is_active })
        .eq('id', promotion.id);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      Alert.alert('Error', 'Failed to update promotion');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manage Promotions',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={[styles.container, { paddingTop: insets.top }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.managerAccent} />
            <Text style={styles.loadingText}>Loading promotions...</Text>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
              ]}
              showsVerticalScrollIndicator={false}
            >
              {promotions.map((promo) => (
                <View key={promo.id} style={styles.promoCard}>
                  {promo.image_url && (
                    <Image
                      source={{ uri: promo.image_url }}
                      style={styles.promoImage}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.promoHeader}>
                    <View style={styles.promoTitleRow}>
                      <Text style={styles.promoTitle}>{promo.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: promo.is_active ? colors.success : colors.error }]}>
                        <Text style={styles.statusText}>{promo.is_active ? 'Active' : 'Inactive'}</Text>
                      </View>
                    </View>
                    <Text style={styles.promoDescription}>{promo.description}</Text>
                  </View>

                  <View style={styles.promoDetails}>
                    <Text style={styles.detailText}>
                      Discount: {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                    </Text>
                    {promo.promo_code && (
                      <Text style={styles.detailText}>Code: {promo.promo_code}</Text>
                    )}
                    {promo.max_uses && (
                      <Text style={styles.detailText}>
                        Uses: {promo.current_uses}/{promo.max_uses}
                      </Text>
                    )}
                    <Text style={styles.detailText}>
                      Valid: {new Date(promo.valid_from).toLocaleDateString()} - {new Date(promo.valid_until).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.promoActions}>
                    <Pressable
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => openEditModal(promo)}
                    >
                      <MaterialIcons name="edit" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, styles.toggleButton]}
                      onPress={() => toggleActive(promo)}
                    >
                      <MaterialIcons name={promo.is_active ? 'visibility-off' : 'visibility'} size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>{promo.is_active ? 'Deactivate' : 'Activate'}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(promo)}
                    >
                      <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              <View style={styles.bottomPadding} />
            </ScrollView>

            <Pressable style={styles.fab} onPress={() => openEditModal()}>
              <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </Pressable>
          </>
        )}

        {/* Edit Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPromotion ? 'Edit Promotion' : 'New Promotion'}
              </Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter promotion title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter promotion description"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Promo Code (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., SAVE20"
                placeholderTextColor={colors.textSecondary}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Discount Type *</Text>
              <View style={styles.discountTypeButtons}>
                <Pressable
                  style={[styles.discountTypeButton, discountType === 'percentage' && styles.discountTypeButtonActive]}
                  onPress={() => setDiscountType('percentage')}
                >
                  <Text style={[styles.discountTypeText, discountType === 'percentage' && styles.discountTypeTextActive]}>
                    Percentage
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.discountTypeButton, discountType === 'fixed-amount' && styles.discountTypeButtonActive]}
                  onPress={() => setDiscountType('fixed-amount')}
                >
                  <Text style={[styles.discountTypeText, discountType === 'fixed-amount' && styles.discountTypeTextActive]}>
                    Fixed Amount
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Discount Value *</Text>
              <TextInput
                style={styles.input}
                placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 10.00'}
                placeholderTextColor={colors.textSecondary}
                value={discountValue}
                onChangeText={setDiscountValue}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Minimum Order Amount (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 25.00"
                placeholderTextColor={colors.textSecondary}
                value={minOrderAmount}
                onChangeText={setMinOrderAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Maximum Uses (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 100"
                placeholderTextColor={colors.textSecondary}
                value={maxUses}
                onChangeText={setMaxUses}
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Valid From *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={validFrom}
                onChangeText={setValidFrom}
              />

              <Text style={styles.label}>Valid Until *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={validUntil}
                onChangeText={setValidUntil}
              />

              <Text style={styles.label}>Image (Optional)</Text>
              {imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                  <Pressable style={styles.removeImageButton} onPress={() => setImageUrl('')}>
                    <MaterialIcons name="close" size={20} color="#FFFFFF" />
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.uploadButton} onPress={pickImage}>
                  <MaterialIcons name="add-photo-alternate" size={24} color={colors.managerAccent} />
                  <Text style={styles.uploadButtonText}>Upload Image</Text>
                </Pressable>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalButtonText}>Save Promotion</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.employeeBackground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  scrollContentWithTabBar: {
    paddingBottom: 180,
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
  promoCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    height: 150,
    backgroundColor: colors.border,
  },
  promoHeader: {
    padding: 16,
  },
  promoTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  promoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  promoDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: colors.text,
  },
  promoActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: colors.managerAccent,
  },
  toggleButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.managerAccent,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  bottomPadding: {
    height: 80,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.employeeBackground,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.employeeCard,
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
  discountTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  discountTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.employeeCard,
    borderWidth: 2,
    borderColor: colors.managerAccent,
    alignItems: 'center',
  },
  discountTypeButtonActive: {
    backgroundColor: colors.managerAccent,
  },
  discountTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  discountTypeTextActive: {
    color: '#FFFFFF',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeCard,
    borderWidth: 2,
    borderColor: colors.managerAccent,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 32,
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    marginTop: 24,
    marginBottom: 40,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.managerAccent,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
