
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useWeeklySpecialsEditor, WeeklySpecial } from '@/hooks/useWeeklySpecials';

export default function WeeklySpecialsEditorScreen() {
  const { specials, loading, error, addSpecial, updateSpecial, deleteSpecial } = useWeeklySpecialsEditor();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<WeeklySpecial | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('0');

  const openAddModal = () => {
    setEditingSpecial(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setValidUntil('');
    setIsActive(true);
    setDisplayOrder('0');
    setModalVisible(true);
  };

  const openEditModal = (special: WeeklySpecial) => {
    setEditingSpecial(special);
    setTitle(special.title);
    setDescription(special.description);
    setPrice(special.price?.toString() || '');
    setValidUntil(special.valid_until || '');
    setIsActive(special.is_active);
    setDisplayOrder(special.display_order.toString());
    setModalVisible(true);
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

    const specialData = {
      title: title.trim(),
      description: description.trim(),
      price: price ? parseFloat(price) : null,
      valid_until: validUntil || null,
      is_active: isActive,
      display_order: parseInt(displayOrder) || 0,
    };

    if (editingSpecial) {
      const { error } = await updateSpecial(editingSpecial.id, specialData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Weekly special updated successfully');
    } else {
      const { error } = await addSpecial(specialData as any);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Weekly special added successfully');
    }

    setModalVisible(false);
  };

  const handleDelete = (special: WeeklySpecial) => {
    Alert.alert(
      'Delete Special',
      `Are you sure you want to delete "${special.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteSpecial(special.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Weekly special deleted successfully');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (special: WeeklySpecial) => {
    const { error } = await updateSpecial(special.id, { is_active: !special.is_active });
    if (error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Weekly Specials Editor',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <View style={[commonStyles.employeeContainer, styles.container]}>
        {/* Add Button */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <IconSymbol name="plus.circle.fill" color="#FFFFFF" size={20} />
            <Text style={styles.addButtonText}>Add Weekly Special</Text>
          </Pressable>
        </View>

        {/* Specials List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.managerAccent} />
            <Text style={styles.loadingText}>Loading specials...</Text>
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
            {specials.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="star.slash" color={colors.textSecondary} size={48} />
                <Text style={styles.emptyText}>No weekly specials yet</Text>
                <Text style={styles.emptySubtext}>Tap the button above to add your first special</Text>
              </View>
            ) : (
              specials.map(special => (
                <Pressable
                  key={special.id}
                  style={[styles.specialCard, !special.is_active && styles.specialCardInactive]}
                  onPress={() => openEditModal(special)}
                >
                  <View style={styles.specialHeader}>
                    <View style={styles.specialTitleRow}>
                      <Text style={[styles.specialTitle, !special.is_active && styles.specialTitleInactive]}>
                        {special.title}
                      </Text>
                      {!special.is_active && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>Inactive</Text>
                        </View>
                      )}
                    </View>
                    {special.price && (
                      <Text style={styles.specialPrice}>${special.price.toFixed(2)}</Text>
                    )}
                  </View>
                  
                  <Text style={styles.specialDescription}>{special.description}</Text>
                  
                  {special.valid_until && (
                    <Text style={styles.specialValidUntil}>
                      Valid until: {new Date(special.valid_until).toLocaleDateString()}
                    </Text>
                  )}
                  
                  <View style={styles.specialActions}>
                    <Pressable
                      style={[styles.actionButton, styles.toggleButton]}
                      onPress={() => toggleActive(special)}
                    >
                      <IconSymbol 
                        name={special.is_active ? "eye.slash" : "eye"} 
                        color={colors.managerAccent} 
                        size={18} 
                      />
                      <Text style={styles.actionButtonText}>
                        {special.is_active ? 'Deactivate' : 'Activate'}
                      </Text>
                    </Pressable>
                    
                    <Pressable
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(special)}
                    >
                      <IconSymbol name="trash" color={colors.error} size={18} />
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))
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
                  {editingSpecial ? 'Edit Weekly Special' : 'Add Weekly Special'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter special title"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.label}>Price (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Valid Until (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={validUntil}
                  onChangeText={setValidUntil}
                  placeholder="YYYY-MM-DD"
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

                <View style={styles.checkboxContainer}>
                  <Pressable
                    style={styles.checkbox}
                    onPress={() => setIsActive(!isActive)}
                  >
                    <IconSymbol 
                      name={isActive ? "checkmark.square.fill" : "square"} 
                      color={isActive ? colors.managerAccent : colors.textSecondary} 
                      size={24} 
                    />
                    <Text style={styles.checkboxLabel}>Active (visible to customers)</Text>
                  </Pressable>
                </View>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  specialCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specialCardInactive: {
    opacity: 0.6,
  },
  specialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  specialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  specialTitleInactive: {
    color: colors.textSecondary,
  },
  inactiveBadge: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  specialPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.managerAccent,
    marginLeft: 12,
  },
  specialDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  specialValidUntil: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  specialActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
  },
  toggleButton: {
    backgroundColor: colors.background,
    borderColor: colors.managerAccent,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.background,
    borderColor: colors.error,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.managerAccent,
  },
  deleteButtonText: {
    color: colors.error,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  checkboxContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
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
