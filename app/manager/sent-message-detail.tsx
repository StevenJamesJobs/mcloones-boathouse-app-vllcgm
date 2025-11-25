
// Identical to employee version
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useMessages } from '@/hooks/useMessages';
import { MessageWithRecipients } from '@/types/messages';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ManagerSentMessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sentMessages } = useMessages();
  const [message, setMessage] = useState<MessageWithRecipients | null>(null);

  useEffect(() => {
    const foundMessage = sentMessages.find((msg) => msg.id === id);
    if (foundMessage) {
      setMessage(foundMessage);
    }
  }, [id, sentMessages]);

  if (!message) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Sent Message',
            headerStyle: {
              backgroundColor: colors.managerPrimary,
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.managerAccent} />
          <Text style={styles.loadingText}>Loading message...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sent Message',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.messageHeader}>
            <Text style={styles.headerLabel}>Sent:</Text>
            <Text style={styles.messageDate}>
              {new Date(message.created_at).toLocaleString()}
            </Text>
          </View>

          <View style={styles.recipientsContainer}>
            <Text style={styles.recipientsLabel}>To:</Text>
            <View style={styles.recipientsList}>
              {message.recipients.map((recipient) => (
                <View key={recipient.id} style={styles.recipientItem}>
                  <Text style={styles.recipientName}>
                    {recipient.recipient?.full_name || 'Unknown'}
                  </Text>
                  <Text style={styles.recipientJobTitle}>
                    {recipient.recipient?.job_title}
                  </Text>
                  <View style={styles.recipientStatus}>
                    {recipient.is_read ? (
                      <>
                        <MaterialIcons name="check-circle" size={16} color={colors.success} />
                        <Text style={styles.statusRead}>Read</Text>
                      </>
                    ) : (
                      <>
                        <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
                        <Text style={styles.statusUnread}>Unread</Text>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.subjectContainer}>
            <Text style={styles.subject}>{message.subject}</Text>
          </View>

          <View style={styles.bodyContainer}>
            <Text style={styles.body}>{message.body}</Text>
          </View>
        </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  messageHeader: {
    backgroundColor: colors.employeeCard,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 16,
    color: colors.text,
  },
  recipientsContainer: {
    backgroundColor: colors.employeeCard,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recipientsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  recipientsList: {
    gap: 12,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.employeeBackground,
    borderRadius: 8,
  },
  recipientName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  recipientJobTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  recipientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusRead: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  statusUnread: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  subjectContainer: {
    backgroundColor: colors.employeeCard,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subject: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  bodyContainer: {
    padding: 16,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
});
