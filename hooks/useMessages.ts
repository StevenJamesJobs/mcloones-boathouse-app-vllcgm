
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message, MessageRecipient, InboxMessage, MessageWithRecipients, RecipientOption, JobTitleGroup } from '@/types/messages';

export function useMessages() {
  const { user } = useAuth();
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<MessageWithRecipients[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inbox messages using the new function
  const fetchInboxMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_inbox_messages', { user_uuid: user.id });

      if (fetchError) throw fetchError;

      // Transform the flat data into the expected structure
      const formattedMessages: InboxMessage[] = (data || []).map((row: any) => ({
        id: row.message_id,
        sender_id: row.sender_id,
        subject: row.subject,
        body: row.body,
        created_at: row.message_created_at,
        updated_at: row.message_updated_at,
        sender: {
          id: row.sender_id,
          full_name: row.sender_full_name,
          job_title: row.sender_job_title,
          profile_picture_url: row.sender_profile_picture_url,
        },
        recipient_info: {
          id: row.recipient_info_id,
          message_id: row.message_id,
          recipient_id: row.recipient_id,
          is_read: row.is_read,
          is_deleted: row.is_deleted,
          read_at: row.read_at,
          created_at: row.recipient_created_at,
          updated_at: row.recipient_updated_at,
        },
      }));

      setInboxMessages(formattedMessages);

      // Update unread count
      const unread = formattedMessages.filter((msg) => !msg.recipient_info.is_read).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Error fetching inbox messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch sent messages using the new function
  const fetchSentMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_sent_messages', { user_uuid: user.id });

      if (fetchError) throw fetchError;

      // Group recipients by message_id
      const messageMap = new Map<string, any>();
      
      (data || []).forEach((row: any) => {
        if (!messageMap.has(row.message_id)) {
          messageMap.set(row.message_id, {
            id: row.message_id,
            sender_id: row.sender_id,
            subject: row.subject,
            body: row.body,
            created_at: row.message_created_at,
            updated_at: row.message_updated_at,
            recipients: [],
          });
        }
        
        messageMap.get(row.message_id).recipients.push({
          id: row.recipient_info_id,
          message_id: row.message_id,
          recipient_id: row.recipient_id,
          is_read: row.is_read,
          is_deleted: row.is_deleted,
          read_at: row.read_at,
          created_at: row.recipient_created_at,
          updated_at: row.recipient_updated_at,
          recipient: {
            id: row.recipient_id,
            full_name: row.recipient_full_name,
            job_title: row.recipient_job_title,
            profile_picture_url: row.recipient_profile_picture_url,
          },
        });
      });

      const formattedMessages: MessageWithRecipients[] = Array.from(messageMap.values());
      setSentMessages(formattedMessages);
    } catch (err: any) {
      console.error('Error fetching sent messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Send a new message
  const sendMessage = async (
    subject: string,
    body: string,
    recipientIds: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Insert the message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          subject,
          body,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Insert recipients
      const recipients = recipientIds.map((recipientId) => ({
        message_id: messageData.id,
        recipient_id: recipientId,
      }));

      const { error: recipientsError } = await supabase
        .from('message_recipients')
        .insert(recipients);

      if (recipientsError) throw recipientsError;

      // Send push notifications via Edge Function
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          const response = await fetch(
            `${supabase.supabaseUrl}/functions/v1/send-message-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                messageId: messageData.id,
                senderId: user.id,
                recipientIds,
                subject,
                body,
              }),
            }
          );

          if (!response.ok) {
            console.error('Failed to send push notifications:', await response.text());
          } else {
            console.log('Push notifications sent successfully');
          }
        }
      } catch (notificationError) {
        // Don't fail the message send if notifications fail
        console.error('Error sending push notifications:', notificationError);
      }

      // Refresh sent messages
      await fetchSentMessages();

      return { success: true };
    } catch (err: any) {
      console.error('Error sending message:', err);
      return { success: false, error: err.message };
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('mark_message_as_read', {
        user_uuid: user.id,
        message_uuid: messageId,
      });

      if (error) throw error;

      // Update local state
      setInboxMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                recipient_info: {
                  ...msg.recipient_info,
                  is_read: true,
                  read_at: new Date().toISOString(),
                },
              }
            : msg
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  };

  // Delete message from inbox
  const deleteMessage = async (messageId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('message_recipients')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq('message_id', messageId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      // Update local state
      setInboxMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (err: any) {
      console.error('Error deleting message:', err);
      throw err;
    }
  };

  // Mark all messages as read
  const markAllAsRead = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('mark_all_messages_as_read', {
        user_uuid: user.id,
      });

      if (error) throw error;

      // Update local state
      setInboxMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          recipient_info: {
            ...msg.recipient_info,
            is_read: true,
            read_at: msg.recipient_info.is_read ? msg.recipient_info.read_at : new Date().toISOString(),
          },
        }))
      );

      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all messages as read:', err);
      throw err;
    }
  };

  // Delete all messages
  const deleteAllMessages = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('delete_all_messages', {
        user_uuid: user.id,
      });

      if (error) throw error;

      // Update local state
      setInboxMessages([]);
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error deleting all messages:', err);
      throw err;
    }
  };

  // Mark selected messages as read
  const markSelectedAsRead = async (messageIds: string[]): Promise<void> => {
    if (!user?.id || messageIds.length === 0) return;

    try {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        user_uuid: user.id,
        message_ids: messageIds,
      });

      if (error) throw error;

      // Update local state
      setInboxMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id)
            ? {
                ...msg,
                recipient_info: {
                  ...msg.recipient_info,
                  is_read: true,
                  read_at: msg.recipient_info.is_read ? msg.recipient_info.read_at : new Date().toISOString(),
                },
              }
            : msg
        )
      );

      // Recalculate unread count
      const unread = inboxMessages.filter(
        (msg) => !messageIds.includes(msg.id) && !msg.recipient_info.is_read
      ).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Error marking selected messages as read:', err);
      throw err;
    }
  };

  // Delete selected messages
  const deleteSelectedMessages = async (messageIds: string[]): Promise<void> => {
    if (!user?.id || messageIds.length === 0) return;

    try {
      const { error } = await supabase.rpc('delete_messages', {
        user_uuid: user.id,
        message_ids: messageIds,
      });

      if (error) throw error;

      // Update local state
      setInboxMessages((prev) => prev.filter((msg) => !messageIds.includes(msg.id)));

      // Recalculate unread count
      const unread = inboxMessages.filter(
        (msg) => !messageIds.includes(msg.id) && !msg.recipient_info.is_read
      ).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Error deleting selected messages:', err);
      throw err;
    }
  };

  // Reply to a message with threading
  const replyToMessage = async (
    originalMessage: InboxMessage,
    body: string
  ): Promise<{ success: boolean; error?: string }> => {
    const subject = originalMessage.subject.startsWith('Re: ')
      ? originalMessage.subject
      : `Re: ${originalMessage.subject}`;

    // Format the reply with the original message quoted
    const formattedBody = `${body}

────────────────────────────────
On ${new Date(originalMessage.created_at).toLocaleString()}, ${originalMessage.sender?.full_name} wrote:

${originalMessage.body}`;

    return sendMessage(subject, formattedBody, [originalMessage.sender_id]);
  };

  // Fetch all users for recipient selection
  const fetchRecipients = async (): Promise<RecipientOption[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, job_title, profile_picture_url')
        .eq('is_active', true)
        .neq('id', user?.id || '')
        .order('full_name');

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching recipients:', err);
      return [];
    }
  };

  // Fetch job title groups
  const fetchJobTitleGroups = async (): Promise<JobTitleGroup[]> => {
    try {
      const recipients = await fetchRecipients();
      
      const groupMap = new Map<string, RecipientOption[]>();
      
      recipients.forEach((recipient) => {
        const jobTitle = recipient.job_title || 'No Job Title';
        if (!groupMap.has(jobTitle)) {
          groupMap.set(jobTitle, []);
        }
        groupMap.get(jobTitle)!.push(recipient);
      });

      const groups: JobTitleGroup[] = Array.from(groupMap.entries()).map(([job_title, users]) => ({
        job_title,
        count: users.length,
        users,
      }));

      return groups.sort((a, b) => a.job_title.localeCompare(b.job_title));
    } catch (err: any) {
      console.error('Error fetching job title groups:', err);
      return [];
    }
  };

  // Fetch all managers for default selection
  const fetchManagers = async (): Promise<RecipientOption[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, job_title, profile_picture_url')
        .eq('is_active', true)
        .in('role', ['manager', 'owner_manager'])
        .neq('id', user?.id || '')
        .order('full_name');

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching managers:', err);
      return [];
    }
  };

  // Get inbox message count
  const getInboxMessageCount = async (): Promise<number> => {
    if (!user?.id) return 0;

    try {
      const { data, error } = await supabase.rpc('get_inbox_message_count', {
        user_uuid: user.id,
      });

      if (error) throw error;

      return data || 0;
    } catch (err: any) {
      console.error('Error getting inbox message count:', err);
      return 0;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInboxMessages();
      fetchSentMessages();
    }
  }, [user?.id, fetchInboxMessages, fetchSentMessages]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('message_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_recipients',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchInboxMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchInboxMessages]);

  return {
    inboxMessages,
    sentMessages,
    unreadCount,
    loading,
    error,
    sendMessage,
    markAsRead,
    deleteMessage,
    markAllAsRead,
    deleteAllMessages,
    markSelectedAsRead,
    deleteSelectedMessages,
    replyToMessage,
    fetchRecipients,
    fetchJobTitleGroups,
    fetchManagers,
    refreshInbox: fetchInboxMessages,
    refreshSent: fetchSentMessages,
    getInboxMessageCount,
  };
}
