
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useMessages } from '@/hooks/useMessages';
import { InboxMessage } from '@/types/messages';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type TabType = 'inbox' | 'sent';

export default function ManagerInboxScreen() {
  const { inboxMessages, sentMessages, unreadCount, loading, deleteMessage } = useMessages();
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(messageId);
              Alert.alert('Success', 'Message deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const filteredInboxMessages = inboxMessages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSentMessages = sentMessages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = activeTab === 'inbox' ? filteredInboxMessages : filteredSentMessages;

  const renderProfileImage = (message: any) => {
    if (activeTab === 'inbox') {
      // Inbox: show sender's profile picture
      const profileUrl = message.sender?.profile_picture_url;
      if (profileUrl) {
        return (
          <Image
            source={{ uri: profileUrl }}
            style={styles.profileImage}
          />
        );
      } else {
        return (
          <View style={styles.profileImagePlaceholder}>
            <MaterialIcons name="person" size={24} color={colors.textSecondary} />
          </View>
        );
      }
    } else {
      // Sent: show multiple recipients icon or single recipient
      const recipients = message.recipients || [];
      if (recipients.length > 1) {
        return (
          <View style={styles.profileImagePlaceholder}>
            <MaterialIcons name="group" size={24} color={colors.textSecondary} />
          </View>
        );
      } else if (recipients.length === 1 && recipients[0].recipient?.profile_picture_url) {
        return (
          <Image
            source={{ uri: recipients[0].recipient.profile_picture_url }}
            style={styles.profileImage}
          />
        );
      } else {
        return (
          <View style={styles.profileImagePlaceholder}>
            <MaterialIcons name="person" size={24} color={colors.textSecondary} />
          </View>
        );
      }
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerStyle: {
            backgroundColor: colors.managerPrimary,
          },
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={styles.container}>
        {/* Header with New Message Button */}
        <View style={styles.header}>
          <Pressable
            style={styles.newMessageButton}
            onPress={() => router.push('/manager/new-message' as any)}
          >
            <MaterialIcons name="edit" size={20} color="#FFFFFF" />
            <Text style={styles.newMessageButtonText}>New Message</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'inbox' && styles.tabActive]}
            onPress={() => setActiveTab('inbox')}
          >
            <Text style={[styles.tabText, activeTab === 'inbox' && styles.tabTextActive]}>
              Inbox {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
              Sent
            </Text>
          </Pressable>
        </View>

        {/* Messages List */}
        <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading messages...</Text>
            </View>
          ) : currentMessages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No messages found' : 'No messages yet'}
              </Text>
            </View>
          ) : (
            currentMessages.map((message) => (
              <Pressable
                key={message.id}
                style={styles.messageCard}
                onPress={() => {
                  if (activeTab === 'inbox') {
                    router.push(`/manager/message-detail?id=${message.id}` as any);
                  } else {
                    router.push(`/manager/sent-message-detail?id=${message.id}` as any);
                  }
                }}
              >
                <View style={styles.messageContent}>
                  {renderProfileImage(message)}
                  <View style={styles.messageTextContainer}>
                    <View style={styles.messageHeader}>
                      <View style={styles.messageHeaderLeft}>
                        {activeTab === 'inbox' && !(message as InboxMessage).recipient_info?.is_read && (
                          <View style={styles.unreadDot} />
                        )}
                        <Text style={styles.messageSender} numberOfLines={1}>
                          {activeTab === 'inbox'
                            ? message.sender?.full_name || 'Unknown'
                            : `To: ${(message as any).recipients?.length || 0} recipient(s)`}
                        </Text>
                      </View>
                      <Text style={styles.messageDate}>
                        {new Date(message.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.messageSubject} numberOfLines={1}>
                      {message.subject}
                    </Text>
                    <Text style={styles.messagePreview} numberOfLines={2}>
                      {message.body}
                    </Text>
                  </View>
                </View>
                {activeTab === 'inbox' && (
                  <View style={styles.messageActions}>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message.id);
                      }}
                    >
                      <MaterialIcons name="delete" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                )}
              </Pressable>
            ))
          )}
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
  header: {
    padding: 16,
    backgroundColor: colors.managerPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  newMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  newMessageButtonText: {
    color: colors.managerPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.employeeCard,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.employeeCard,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: colors.managerAccent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageCard: {
    backgroundColor: colors.employeeCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  messageContent: {
    flexDirection: 'row',
    gap: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageTextContainer: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.managerAccent,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  messageDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
