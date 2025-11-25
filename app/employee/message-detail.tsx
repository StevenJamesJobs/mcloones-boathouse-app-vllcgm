
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useMessages } from '@/hooks/useMessages';
import { InboxMessage } from '@/types/messages';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inboxMessages, markAsRead, deleteMessage, replyToMessage } = useMessages();
  const [message, setMessage] = useState<InboxMessage | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const foundMessage = inboxMessages.find((msg) => msg.id === id);
    if (foundMessage) {
      setMessage(foundMessage);
      // Mark as read if not already read
      if (!foundMessage.recipient_info.is_read) {
        markAsRead(foundMessage.id);
      }
    }
  }, [id, inboxMessages]);

  const handleDelete = () => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMessage(id);
            Alert.alert('Success', 'Message deleted successfully', [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete message');
          }
        },
      },
    ]);
  };

  const handleReply = async () => {
    if (!replyBody.trim()) {
      Alert.alert('Error', 'Please enter a reply message');
      return;
    }

    if (!message) return;

    setSending(true);
    const result = await replyToMessage(message, replyBody);
    setSending(false);

    if (result.success) {
      Alert.alert('Success', 'Reply sent successfully', [
        {
          text: 'OK',
          onPress: () => {
            setShowReply(false);
            setReplyBody('');
          },
        },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to send reply');
    }
  };

  if (!message) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Message',
            headerStyle: {
              backgroundColor: colors.employeeBackground,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.employeeAccent} />
          <Text style={styles.loadingText}>Loading message...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Message',
          headerStyle: {
            backgroundColor: colors.employeeBackground,
          },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Message Header */}
          <View style={styles.messageHeader}>
            <View style={styles.senderInfo}>
              <Text style={styles.senderName}>From: {message.sender?.full_name || 'Unknown'}</Text>
              <Text style={styles.senderJobTitle}>{message.sender?.job_title}</Text>
            </View>
            <Text style={styles.messageDate}>
              {new Date(message.created_at).toLocaleString()}
            </Text>
          </View>

          {/* Subject */}
          <View style={styles.subjectContainer}>
            <Text style={styles.subject}>{message.subject}</Text>
          </View>

          {/* Message Body */}
          <View style={styles.bodyContainer}>
            <Text style={styles.body}>{message.body}</Text>
          </View>

          {/* Reply Section */}
          {showReply && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyLabel}>Reply:</Text>
              <TextInput
                style={styles.replyInput}
                placeholder="Type your reply here..."
                placeholderTextColor={colors.textSecondary}
                value={replyBody}
                onChangeText={setReplyBody}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.replyActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowReply(false);
                    setReplyBody('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.sendReplyButton, sending && styles.sendReplyButtonDisabled]}
                  onPress={handleReply}
                  disabled={sending}
                >
                  {sending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.sendReplyButtonText}>Send Reply</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          {!showReply && (
            <Pressable style={styles.replyButton} onPress={() => setShowReply(true)}>
              <MaterialIcons name="reply" size={20} color="#FFFFFF" />
              <Text style={styles.replyButtonText}>Reply</Text>
            </Pressable>
          )}
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete</Text>
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
  senderInfo: {
    marginBottom: 8,
  },
  senderName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  senderJobTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  messageDate: {
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
  replyContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.employeeAccent,
  },
  replyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  replyInput: {
    backgroundColor: colors.employeeBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    marginBottom: 12,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sendReplyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.employeeAccent,
    alignItems: 'center',
  },
  sendReplyButtonDisabled: {
    opacity: 0.6,
  },
  sendReplyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.employeeCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  replyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.employeeAccent,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  replyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
