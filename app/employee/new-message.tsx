
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useMessages } from '@/hooks/useMessages';
import { RecipientOption, JobTitleGroup } from '@/types/messages';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function NewMessageScreen() {
  const { sendMessage, fetchRecipients, fetchJobTitleGroups, fetchManagers } = useMessages();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<RecipientOption[]>([]);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [recipients, setRecipients] = useState<RecipientOption[]>([]);
  const [jobTitleGroups, setJobTitleGroups] = useState<JobTitleGroup[]>([]);
  const [managers, setManagers] = useState<RecipientOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadRecipients = useCallback(async () => {
    console.log('Employee New Message: Starting to load recipients...');
    setLoading(true);
    setLoadError(null);
    
    try {
      const [recipientsList, groups, managersList] = await Promise.all([
        fetchRecipients(),
        fetchJobTitleGroups(),
        fetchManagers(),
      ]);
      
      console.log('Employee New Message: Recipients loaded:', {
        recipientsCount: recipientsList.length,
        groupsCount: groups.length,
        managersCount: managersList.length,
      });
      
      setRecipients(recipientsList);
      setJobTitleGroups(groups);
      setManagers(managersList);
      
      if (recipientsList.length === 0) {
        setLoadError('No recipients available. Please contact your manager.');
      }
    } catch (error) {
      console.error('Employee New Message: Error loading recipients:', error);
      setLoadError('Failed to load recipients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchRecipients, fetchJobTitleGroups, fetchManagers]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  const toggleRecipient = (recipient: RecipientOption) => {
    setSelectedRecipients((prev) => {
      const exists = prev.find((r) => r.id === recipient.id);
      if (exists) {
        return prev.filter((r) => r.id !== recipient.id);
      } else {
        return [...prev, recipient];
      }
    });
  };

  const selectJobTitleGroup = (group: JobTitleGroup) => {
    setSelectedRecipients((prev) => {
      const newRecipients = [...prev];
      group.users.forEach((user) => {
        if (!newRecipients.find((r) => r.id === user.id)) {
          newRecipients.push(user);
        }
      });
      return newRecipients;
    });
  };

  const selectAllManagers = () => {
    setSelectedRecipients((prev) => {
      const newRecipients = [...prev];
      managers.forEach((manager) => {
        if (!newRecipients.find((r) => r.id === manager.id)) {
          newRecipients.push(manager);
        }
      });
      return newRecipients;
    });
  };

  const removeRecipient = (recipientId: string) => {
    setSelectedRecipients((prev) => prev.filter((r) => r.id !== recipientId));
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    if (!body.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (selectedRecipients.length === 0) {
      Alert.alert('Error', 'Please select at least one recipient');
      return;
    }

    setSending(true);
    const result = await sendMessage(
      subject,
      body,
      selectedRecipients.map((r) => r.id)
    );
    setSending(false);

    if (result.success) {
      Alert.alert('Success', 'Message sent successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to send message');
    }
  };

  const filteredRecipients = recipients.filter(
    (r) =>
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = jobTitleGroups.filter((g) =>
    g.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Message',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recipients Section */}
          <View style={styles.section}>
            <Text style={styles.label}>To:</Text>
            <Pressable
              style={styles.recipientSelector}
              onPress={() => setShowRecipientPicker(!showRecipientPicker)}
            >
              <View style={styles.recipientSelectorContent}>
                {selectedRecipients.length === 0 ? (
                  <Text style={styles.recipientPlaceholder}>Select recipients...</Text>
                ) : (
                  <View style={styles.selectedRecipients}>
                    {selectedRecipients.map((recipient) => (
                      <View key={recipient.id} style={styles.recipientChip}>
                        <Text style={styles.recipientChipText} numberOfLines={1}>
                          {recipient.full_name}
                        </Text>
                        <Pressable onPress={() => removeRecipient(recipient.id)}>
                          <MaterialIcons name="close" size={16} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <MaterialIcons
                name={showRecipientPicker ? 'expand-less' : 'expand-more'}
                size={24}
                color={colors.text}
              />
            </Pressable>
          </View>

          {/* Recipient Picker */}
          {showRecipientPicker && (
            <View style={styles.recipientPicker}>
              {/* Search */}
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search users or job titles..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.employeeAccent} />
                  <Text style={styles.loadingText}>Loading recipients...</Text>
                </View>
              ) : loadError ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={48} color={colors.error} />
                  <Text style={styles.errorText}>{loadError}</Text>
                  <Pressable style={styles.retryButton} onPress={loadRecipients}>
                    <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </Pressable>
                </View>
              ) : (
                <ScrollView style={styles.recipientList} nestedScrollEnabled>
                  {/* Quick Select: All Managers - Highlighted */}
                  {managers.length > 0 && !searchQuery && (
                    <>
                      <Text style={styles.pickerSectionTitle}>Quick Select</Text>
                      <Pressable
                        style={styles.quickSelectItem}
                        onPress={selectAllManagers}
                      >
                        <MaterialIcons name="supervisor-account" size={28} color="#FFFFFF" />
                        <View style={styles.groupInfo}>
                          <Text style={styles.quickSelectTitle}>All Managers</Text>
                          <Text style={styles.quickSelectCount}>{managers.length} managers</Text>
                        </View>
                        <MaterialIcons name="add-circle" size={28} color="#FFFFFF" />
                      </Pressable>
                    </>
                  )}

                  {/* Job Title Groups */}
                  {filteredGroups.length > 0 && (
                    <>
                      <Text style={styles.pickerSectionTitle}>By Job Title</Text>
                      {filteredGroups.map((group) => (
                        <Pressable
                          key={group.job_title}
                          style={styles.groupItem}
                          onPress={() => selectJobTitleGroup(group)}
                        >
                          <MaterialIcons name="group" size={24} color={colors.employeeAccent} />
                          <View style={styles.groupInfo}>
                            <Text style={styles.groupTitle}>{group.job_title}</Text>
                            <Text style={styles.groupCount}>{group.count} employees</Text>
                          </View>
                          <MaterialIcons name="add-circle" size={24} color={colors.employeeAccent} />
                        </Pressable>
                      ))}
                    </>
                  )}

                  {/* Individual Users */}
                  {filteredRecipients.length > 0 && (
                    <>
                      <Text style={styles.pickerSectionTitle}>Individual Users</Text>
                      {filteredRecipients.map((recipient) => {
                        const isSelected = selectedRecipients.find((r) => r.id === recipient.id);
                        return (
                          <Pressable
                            key={recipient.id}
                            style={[styles.recipientItem, isSelected && styles.recipientItemSelected]}
                            onPress={() => toggleRecipient(recipient)}
                          >
                            <View style={styles.recipientInfo}>
                              <Text style={styles.recipientName}>{recipient.full_name}</Text>
                              <Text style={styles.recipientJobTitle}>{recipient.job_title}</Text>
                            </View>
                            {isSelected && (
                              <MaterialIcons name="check-circle" size={24} color={colors.employeeAccent} />
                            )}
                          </Pressable>
                        );
                      })}
                    </>
                  )}

                  {/* No Results */}
                  {filteredRecipients.length === 0 && filteredGroups.length === 0 && searchQuery && (
                    <View style={styles.noResultsContainer}>
                      <MaterialIcons name="search-off" size={48} color={colors.textSecondary} />
                      <Text style={styles.noResultsText}>No results found for &quot;{searchQuery}&quot;</Text>
                    </View>
                  )}

                  {/* No Recipients Available */}
                  {recipients.length === 0 && !searchQuery && (
                    <View style={styles.noResultsContainer}>
                      <MaterialIcons name="people-outline" size={48} color={colors.textSecondary} />
                      <Text style={styles.noResultsText}>No recipients available</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          )}

          {/* Subject */}
          <View style={styles.section}>
            <Text style={styles.label}>Subject:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter subject..."
              placeholderTextColor={colors.textSecondary}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Message Body */}
          <View style={styles.section}>
            <Text style={styles.label}>Message:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type your message here..."
              placeholderTextColor={colors.textSecondary}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>Send Message</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.employeeBackground,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  recipientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.employeeCard,
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
  },
  recipientSelectorContent: {
    flex: 1,
  },
  recipientPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  selectedRecipients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.employeeAccent,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    maxWidth: '100%',
  },
  recipientChipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flexShrink: 1,
  },
  recipientPicker: {
    backgroundColor: colors.employeeCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    maxHeight: 400,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.employeeBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.employeeAccent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recipientList: {
    maxHeight: 300,
  },
  pickerSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  quickSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.employeeAccent,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  quickSelectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickSelectCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.employeeBackground,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  groupCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.employeeBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  recipientItemSelected: {
    backgroundColor: 'rgba(50, 137, 168, 0.1)',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  recipientJobTitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.employeeCard,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.employeeCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeAccent,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
