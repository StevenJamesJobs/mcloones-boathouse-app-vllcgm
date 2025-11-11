
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';
import { useContactUsEditor, ContactUs } from '@/hooks/useContactUs';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';

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
    marginBottom: 20,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 100,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
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
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
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
});

export default function ContactUsEditorScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ContactUs | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: '',
    hours_weekday: '',
    hours_weekend: '',
    is_active: true,
  });

  const { contactInfo, loading, error, refetch, addContactInfo, updateContactInfo, deleteContactInfo } = useContactUsEditor();

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      phone: '',
      email: '',
      address: '',
      hours_weekday: '',
      hours_weekend: '',
      is_active: true,
    });
    setModalVisible(true);
  };

  const openEditModal = (info: ContactUs) => {
    setEditingItem(info);
    setFormData({
      phone: info.phone,
      email: info.email,
      address: info.address,
      hours_weekday: info.hours_weekday || '',
      hours_weekend: info.hours_weekend || '',
      is_active: info.is_active,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.phone.trim() || !formData.email.trim() || !formData.address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await updateContactInfo(editingItem.id, formData);
        if (error) {
          Alert.alert('Error', error);
          return;
        }
        Alert.alert('Success', 'Contact information updated successfully');
      } else {
        const { error } = await addContactInfo(formData);
        if (error) {
          Alert.alert('Error', error);
          return;
        }
        Alert.alert('Success', 'Contact information added successfully');
      }
      setModalVisible(false);
      refetch();
    } catch (err) {
      console.error('Error saving contact info:', err);
      Alert.alert('Error', 'Failed to save contact information');
    }
  };

  const handleDelete = (info: ContactUs) => {
    Alert.alert(
      'Delete Contact Information',
      'Are you sure you want to delete this contact information?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteContactInfo(info.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Contact information deleted successfully');
              refetch();
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (info: ContactUs) => {
    const { error } = await updateContactInfo(info.id, { is_active: !info.is_active });
    if (error) {
      Alert.alert('Error', error);
    } else {
      refetch();
    }
  };

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
          title: 'Contact Us Editor',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.header}>Manage Contact Information</Text>

        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add Contact Information</Text>
        </Pressable>

        {contactInfo.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No contact information yet. Add one to get started!</Text>
          </View>
        ) : (
          contactInfo.map((info) => (
            <View key={info.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Contact Information</Text>
                <View style={styles.cardActions}>
                  <Pressable style={styles.actionButton} onPress={() => openEditModal(info)}>
                    <IconSymbol name="pencil" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleDelete(info)}>
                    <IconSymbol name="trash" size={20} color="#ff4444" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoText}>{info.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoText}>{info.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoText}>{info.address}</Text>
                </View>
                {info.hours_weekday && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Weekday:</Text>
                    <Text style={styles.infoText}>{info.hours_weekday}</Text>
                  </View>
                )}
                {info.hours_weekend && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Weekend:</Text>
                    <Text style={styles.infoText}>{info.hours_weekend}</Text>
                  </View>
                )}
              </View>

              <Pressable style={styles.activeIndicator} onPress={() => toggleActive(info)}>
                <View style={[styles.activeDot, { backgroundColor: info.is_active ? '#4CAF50' : '#999' }]} />
                <Text style={[styles.activeText, { color: info.is_active ? '#4CAF50' : '#999' }]}>
                  {info.is_active ? 'Active' : 'Inactive'}
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
                {editingItem ? 'Edit Contact Information' : 'Add Contact Information'}
              </Text>

              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(732) 872-1245"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="info@mcloones.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="1 Ocean Avenue, West End, NJ 07740"
                placeholderTextColor={colors.textSecondary}
                multiline
              />

              <Text style={styles.label}>Weekday Hours</Text>
              <TextInput
                style={styles.input}
                value={formData.hours_weekday}
                onChangeText={(text) => setFormData({ ...formData, hours_weekday: text })}
                placeholder="11:30 AM - 9:00 PM"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Weekend Hours</Text>
              <TextInput
                style={styles.input}
                value={formData.hours_weekend}
                onChangeText={(text) => setFormData({ ...formData, hours_weekend: text })}
                placeholder="10:00 AM - 9:00 PM"
                placeholderTextColor={colors.textSecondary}
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
