
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useEventsEditor, Event } from '@/hooks/useEvents';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EventsEditorScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState('');
  const [rsvpLink, setRsvpLink] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { events, loading, refetch, addEvent, updateEvent, deleteEvent } = useEventsEditor();

  const openAddModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setEventDate(new Date());
    setEventTime('');
    setRsvpLink('');
    setDisplayOrder('0');
    setModalVisible(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setEventDate(new Date(event.event_date));
    setEventTime(event.event_time);
    setRsvpLink(event.rsvp_link || '');
    setDisplayOrder(event.display_order.toString());
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !eventTime.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      event_date: eventDate.toISOString().split('T')[0],
      event_time: eventTime.trim(),
      rsvp_link: rsvpLink.trim() || null,
      image_url: null,
      is_active: true,
      display_order: parseInt(displayOrder) || 0,
    };

    if (editingEvent) {
      const { error } = await updateEvent(editingEvent.id, eventData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Event updated successfully');
    } else {
      const { error } = await addEvent(eventData);
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      Alert.alert('Success', 'Event added successfully');
    }

    setModalVisible(false);
  };

  const handleDelete = (event: Event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteEvent(event.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Event deleted successfully');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (event: Event) => {
    const { error } = await updateEvent(event.id, { is_active: !event.is_active });
    if (error) {
      Alert.alert('Error', error);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Events Editor',
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
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.infoText}>
              Manage upcoming events and entertainment. Events will appear on the customer home screen and events page.
            </Text>

            {events.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="calendar.badge.plus" color={colors.textSecondary} size={64} />
                <Text style={styles.emptyText}>No events yet</Text>
                <Text style={styles.emptySubtext}>Tap the + button to add your first event</Text>
              </View>
            ) : (
              events.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleContainer}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View style={styles.eventMeta}>
                        <Text style={styles.eventDate}>
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })} at {event.event_time}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => toggleActive(event)}
                      style={[
                        styles.activeToggle,
                        event.is_active && styles.activeToggleOn,
                      ]}
                    >
                      <Text style={styles.activeToggleText}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>

                  {event.rsvp_link && (
                    <Text style={styles.eventRsvp} numberOfLines={1}>
                      RSVP: {event.rsvp_link}
                    </Text>
                  )}

                  <View style={styles.eventActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => openEditModal(event)}
                    >
                      <IconSymbol name="pencil" color={colors.managerAccent} size={20} />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDelete(event)}
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
                {editingEvent ? 'Edit Event' : 'Add Event'}
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
                  placeholder="Event title"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Event description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Event Date *</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <IconSymbol name="calendar" color={colors.accent} size={20} />
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={eventDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Event Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 7:00 PM"
                  value={eventTime}
                  onChangeText={setEventTime}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>RSVP Link</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/rsvp"
                  value={rsvpLink}
                  onChangeText={setRsvpLink}
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
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
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
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 14,
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
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  eventRsvp: {
    fontSize: 12,
    color: colors.accent,
    marginBottom: 12,
  },
  eventActions: {
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
});
