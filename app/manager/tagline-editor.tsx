
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useTaglineEditor, Tagline } from '@/hooks/useTagline';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    ...commonStyles.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  taglineText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  textArea: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  previewSection: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  previewTagline: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});

export default function TaglineEditorScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Tagline | null>(null);
  const [formData, setFormData] = useState({
    tagline_text: '',
    is_active: true,
  });

  const { taglines, loading, error, refetch, addTagline, updateTagline, deleteTagline } = useTaglineEditor();

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      tagline_text: '',
      is_active: true,
    });
    setModalVisible(true);
  };

  const openEditModal = (tagline: Tagline) => {
    setEditingItem(tagline);
    setFormData({
      tagline_text: tagline.tagline_text,
      is_active: tagline.is_active,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.tagline_text.trim()) {
      Alert.alert('Error', 'Please enter a tagline');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await updateTagline(editingItem.id, formData);
        if (error) {
          Alert.alert('Error', error);
          return;
        }
        Alert.alert('Success', 'Tagline updated successfully');
      } else {
        const { error } = await addTagline(formData);
        if (error) {
          Alert.alert('Error', error);
          return;
        }
        Alert.alert('Success', 'Tagline added successfully');
      }
      setModalVisible(false);
      refetch();
    } catch (err) {
      console.error('Error saving tagline:', err);
      Alert.alert('Error', 'Failed to save tagline');
    }
  };

  const handleDelete = (tagline: Tagline) => {
    Alert.alert(
      'Delete Tagline',
      'Are you sure you want to delete this tagline?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteTagline(tagline.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Tagline deleted successfully');
              refetch();
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (tagline: Tagline) => {
    const { error } = await updateTagline(tagline.id, { is_active: !tagline.is_active });
    if (error) {
      Alert.alert('Error', error);
    } else {
      refetch();
    }
  };

  // Get the active tagline for preview
  const activeTagline = taglines.find(t => t.is_active);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Tagline Editor',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.header}>Manage Taglines</Text>
        <Text style={styles.description}>
          Edit the tagline that appears on the public home page below &quot;McLoone&apos;s Boathouse&quot;. 
          Only one tagline can be active at a time.
        </Text>

        {/* Preview Section */}
        {activeTagline && (
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Current Preview</Text>
            <Text style={styles.previewTitle}>McLoone&apos;s Boathouse</Text>
            <Text style={styles.previewTagline}>{activeTagline.tagline_text}</Text>
          </View>
        )}

        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add New Tagline</Text>
        </Pressable>

        {taglines.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No taglines yet. Add one to get started!</Text>
          </View>
        ) : (
          taglines.map((tagline) => (
            <View key={tagline.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardContent}>
                  <Text style={styles.taglineText}>{tagline.tagline_text}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable style={styles.actionButton} onPress={() => openEditModal(tagline)}>
                    <IconSymbol name="pencil" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleDelete(tagline)}>
                    <IconSymbol name="trash" size={20} color="#ff4444" />
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.activeIndicator} onPress={() => toggleActive(tagline)}>
                <View style={[styles.activeDot, { backgroundColor: tagline.is_active ? '#4CAF50' : '#999' }]} />
                <Text style={[styles.activeText, { color: tagline.is_active ? '#4CAF50' : '#999' }]}>
                  {tagline.is_active ? 'Active' : 'Inactive'}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalHeader}>
                {editingItem ? 'Edit Tagline' : 'Add New Tagline'}
              </Text>

              <Text style={styles.label}>Tagline Text *</Text>
              <TextInput
                style={styles.textArea}
                value={formData.tagline_text}
                onChangeText={(text) => setFormData({ ...formData, tagline_text: text })}
                placeholder="Experience waterfront dining at its finest on the Shrewsbury River"
                placeholderTextColor={colors.textSecondary}
                multiline
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
