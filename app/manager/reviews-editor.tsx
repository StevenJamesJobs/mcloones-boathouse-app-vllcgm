
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { useReviewsEditor, Review } from '@/hooks/useReviews';
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
    alignItems: 'flex-start',
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
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  displayOrder: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  ratingSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  ratingButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 40,
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  ratingButtonTextSelected: {
    color: '#fff',
  },
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
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

export default function ReviewsEditorScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Review | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    author_name: '',
    rating: 5,
    review_text: '',
    review_date: new Date().toISOString().split('T')[0],
    is_active: true,
    display_order: 0,
  });

  const { reviews, loading, error, refetch, addReview, updateReview, deleteReview } = useReviewsEditor();

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      author_name: '',
      rating: 5,
      review_text: '',
      review_date: new Date().toISOString().split('T')[0],
      is_active: true,
      display_order: reviews.length,
    });
    setModalVisible(true);
  };

  const openEditModal = (review: Review) => {
    setEditingItem(review);
    setFormData({
      author_name: review.author_name,
      rating: review.rating,
      review_text: review.review_text,
      review_date: review.review_date,
      is_active: review.is_active,
      display_order: review.display_order,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.author_name.trim() || !formData.review_text.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      Alert.alert('Error', 'Rating must be between 1 and 5');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await updateReview(editingItem.id, formData);
        if (error) {
          Alert.alert('Error', error);
          return;
        }
        Alert.alert('Success', 'Review updated successfully');
      } else {
        const { error } = await addReview(formData);
        if (error) {
          Alert.alert('Error', error);
          return;
        }
        Alert.alert('Success', 'Review added successfully');
      }
      setModalVisible(false);
      refetch();
    } catch (err) {
      console.error('Error saving review:', err);
      Alert.alert('Error', 'Failed to save review');
    }
  };

  const handleDelete = (review: Review) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteReview(review.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Review deleted successfully');
              refetch();
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (review: Review) => {
    const { error } = await updateReview(review.id, { is_active: !review.is_active });
    if (error) {
      Alert.alert('Error', error);
    } else {
      refetch();
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, review_date: selectedDate.toISOString().split('T')[0] });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconSymbol
            key={star}
            name="star.fill"
            size={16}
            color={star <= rating ? '#FFD700' : '#ccc'}
          />
        ))}
      </View>
    );
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
          title: 'Reviews Editor',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.header}>Manage Customer Reviews</Text>

        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add Review</Text>
        </Pressable>

        {reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reviews yet. Add one to get started!</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{review.author_name}</Text>
                  {renderStars(review.rating)}
                </View>
                <View style={styles.cardActions}>
                  <Pressable style={styles.actionButton} onPress={() => openEditModal(review)}>
                    <IconSymbol name="pencil" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleDelete(review)}>
                    <IconSymbol name="trash" size={20} color="#ff4444" />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.reviewText}>{review.review_text}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.review_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.displayOrder}>Display Order: {review.display_order}</Text>

              <Pressable style={styles.activeIndicator} onPress={() => toggleActive(review)}>
                <View style={[styles.activeDot, { backgroundColor: review.is_active ? '#4CAF50' : '#999' }]} />
                <Text style={[styles.activeText, { color: review.is_active ? '#4CAF50' : '#999' }]}>
                  {review.is_active ? 'Active' : 'Inactive'}
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
                {editingItem ? 'Edit Review' : 'Add Review'}
              </Text>

              <Text style={styles.label}>Author Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.author_name}
                onChangeText={(text) => setFormData({ ...formData, author_name: text })}
                placeholder="John Doe"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Rating *</Text>
              <View style={styles.ratingSelector}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Pressable
                    key={rating}
                    style={[
                      styles.ratingButton,
                      formData.rating === rating && styles.ratingButtonSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, rating })}
                  >
                    <Text
                      style={[
                        styles.ratingButtonText,
                        formData.rating === rating && styles.ratingButtonTextSelected,
                      ]}
                    >
                      {rating}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Review Text *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.review_text}
                onChangeText={(text) => setFormData({ ...formData, review_text: text })}
                placeholder="Write the review here..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />

              <Text style={styles.label}>Review Date *</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {new Date(formData.review_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.review_date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}

              <Text style={styles.label}>Display Order</Text>
              <TextInput
                style={styles.input}
                value={formData.display_order.toString()}
                onChangeText={(text) => setFormData({ ...formData, display_order: parseInt(text) || 0 })}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
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
