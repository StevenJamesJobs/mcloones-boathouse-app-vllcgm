
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAboutUsEditor, AboutUsSection } from '@/hooks/useAboutUs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function AboutUsEditorScreen() {
  const { sections, loading, error, addSection, updateSection, deleteSection } = useAboutUsEditor();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutUsSection | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sectionOrder, setSectionOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  const openAddModal = () => {
    setEditingSection(null);
    setTitle('');
    setContent('');
    setSectionOrder('0');
    setIsActive(true);
    setWebsiteUrl('');
    setFacebookUrl('');
    setInstagramUrl('');
    setModalVisible(true);
  };

  const openEditModal = (section: AboutUsSection) => {
    setEditingSection(section);
    setTitle(section.title);
    setContent(section.content);
    setSectionOrder(section.section_order.toString());
    setIsActive(section.is_active);
    setWebsiteUrl(section.website_url || '');
    setFacebookUrl(section.facebook_url || '');
    setInstagramUrl(section.instagram_url || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return;
    }

    const sectionData = {
      title: title.trim(),
      content: content.trim(),
      section_order: parseInt(sectionOrder) || 0,
      is_active: isActive,
      website_url: websiteUrl.trim() || null,
      facebook_url: facebookUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
    };

    if (editingSection) {
      const { error } = await updateSection(editingSection.id, sectionData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'About us section updated successfully');
    } else {
      const { error } = await addSection(sectionData as any);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'About us section added successfully');
    }

    setModalVisible(false);
  };

  const handleDelete = (section: AboutUsSection) => {
    Alert.alert(
      'Delete Section',
      `Are you sure you want to delete "${section.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteSection(section.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'About us section deleted successfully');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (section: AboutUsSection) => {
    const { error } = await updateSection(section.id, { is_active: !section.is_active });
    if (error) {
      Alert.alert('Error', error);
    }
  };

  // Check if this is the "Visit Us" section
  const isVisitUsSection = (section: AboutUsSection) => {
    return section.title.toLowerCase().includes('visit') || section.title.toLowerCase().includes('contact');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'About Us Editor',
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
            <Text style={styles.addButtonText}>Add Section</Text>
          </Pressable>
        </View>

        {/* Sections List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.managerAccent} />
            <Text style={styles.loadingText}>Loading sections...</Text>
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
            {sections.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="doc.text.slash" color={colors.textSecondary} size={48} />
                <Text style={styles.emptyText}>No sections yet</Text>
                <Text style={styles.emptySubtext}>Tap the button above to add your first section</Text>
              </View>
            ) : (
              sections.map(section => (
                <Pressable
                  key={section.id}
                  style={[styles.sectionCard, !section.is_active && styles.sectionCardInactive]}
                  onPress={() => openEditModal(section)}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Text style={[styles.sectionTitle, !section.is_active && styles.sectionTitleInactive]}>
                        {section.title}
                      </Text>
                      {!section.is_active && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>Inactive</Text>
                        </View>
                      )}
                      {isVisitUsSection(section) && (
                        <View style={styles.socialBadge}>
                          <MaterialIcons name="link" size={12} color="#FFFFFF" />
                          <Text style={styles.socialBadgeText}>Social Links</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sectionOrder}>Order: {section.section_order}</Text>
                  </View>
                  
                  <Text style={styles.sectionContent} numberOfLines={3}>
                    {section.content}
                  </Text>
                  
                  {/* Show social media links if this is Visit Us section */}
                  {isVisitUsSection(section) && (section.website_url || section.facebook_url || section.instagram_url) && (
                    <View style={styles.socialLinksPreview}>
                      <Text style={styles.socialLinksTitle}>Social Media Links:</Text>
                      {section.website_url && (
                        <View style={styles.socialLinkRow}>
                          <MaterialIcons name="language" size={16} color={colors.managerAccent} />
                          <Text style={styles.socialLinkText} numberOfLines={1}>{section.website_url}</Text>
                        </View>
                      )}
                      {section.facebook_url && (
                        <View style={styles.socialLinkRow}>
                          <MaterialIcons name="facebook" size={16} color={colors.managerAccent} />
                          <Text style={styles.socialLinkText} numberOfLines={1}>{section.facebook_url}</Text>
                        </View>
                      )}
                      {section.instagram_url && (
                        <View style={styles.socialLinkRow}>
                          <MaterialIcons name="camera-alt" size={16} color={colors.managerAccent} />
                          <Text style={styles.socialLinkText} numberOfLines={1}>{section.instagram_url}</Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  <View style={styles.sectionActions}>
                    <Pressable
                      style={[styles.actionButton, styles.toggleButton]}
                      onPress={() => toggleActive(section)}
                    >
                      <IconSymbol 
                        name={section.is_active ? "eye.slash" : "eye"} 
                        color={colors.managerAccent} 
                        size={18} 
                      />
                      <Text style={styles.actionButtonText}>
                        {section.is_active ? 'Deactivate' : 'Activate'}
                      </Text>
                    </Pressable>
                    
                    <Pressable
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(section)}
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editingSection ? 'Edit Section' : 'Add Section'}
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
                      placeholder="Enter section title"
                      placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={styles.label}>Content *</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={content}
                      onChangeText={setContent}
                      placeholder="Enter section content"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={6}
                    />

                    <Text style={styles.label}>Section Order</Text>
                    <TextInput
                      style={styles.input}
                      value={sectionOrder}
                      onChangeText={setSectionOrder}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                    />

                    {/* Social Media Links Section - Only show for Visit Us sections */}
                    {(editingSection && isVisitUsSection(editingSection)) || title.toLowerCase().includes('visit') || title.toLowerCase().includes('contact') ? (
                      <View style={styles.socialMediaSection}>
                        <View style={styles.socialMediaHeader}>
                          <MaterialIcons name="link" size={20} color={colors.managerAccent} />
                          <Text style={styles.socialMediaTitle}>Social Media Links</Text>
                        </View>
                        <Text style={styles.socialMediaSubtitle}>
                          These links will appear at the bottom of the Visit Us section
                        </Text>

                        <Text style={styles.label}>Website URL</Text>
                        <TextInput
                          style={styles.input}
                          value={websiteUrl}
                          onChangeText={setWebsiteUrl}
                          placeholder="https://www.mcloonesboathouse.com"
                          placeholderTextColor={colors.textSecondary}
                          autoCapitalize="none"
                          keyboardType="url"
                        />

                        <Text style={styles.label}>Facebook URL</Text>
                        <TextInput
                          style={styles.input}
                          value={facebookUrl}
                          onChangeText={setFacebookUrl}
                          placeholder="https://www.facebook.com/mcloonesboathouse/"
                          placeholderTextColor={colors.textSecondary}
                          autoCapitalize="none"
                          keyboardType="url"
                        />

                        <Text style={styles.label}>Instagram URL</Text>
                        <TextInput
                          style={styles.input}
                          value={instagramUrl}
                          onChangeText={setInstagramUrl}
                          placeholder="https://www.instagram.com/mcloones_boathouse/"
                          placeholderTextColor={colors.textSecondary}
                          autoCapitalize="none"
                          keyboardType="url"
                        />
                      </View>
                    ) : null}

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
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
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
  sectionCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionCardInactive: {
    opacity: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitleInactive: {
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
  socialBadge: {
    backgroundColor: colors.managerAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionOrder: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.managerAccent,
    marginLeft: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  socialLinksPreview: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  socialLinksTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  socialLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  socialLinkText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  sectionActions: {
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  socialMediaSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  socialMediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  socialMediaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  socialMediaSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
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
