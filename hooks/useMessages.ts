
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

  // Fetch inbox messages
  const fetchInboxMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: recipientData, error: recipientError } = await supabase
        .from('message_recipients')
        .select(`
          *,
          messages:message_id (
            *,
            sender:sender_id (
              id,
              full_name,
              job_title,
              profile_picture_url
            )
          )
        `)
        .eq('recipient_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (recipientError) throw recipientError;

      const formattedMessages: InboxMessage[] = (recipientData || [])
        .filter((item: any) => item.messages)
        .map((item: any) => ({
          ...item.messages,
          sender: item.messages.sender,
          recipient_info: {
            id: item.id,
            message_id: item.message_id,
            recipient_id: item.recipient_id,
            is_read: item.is_read,
            is_deleted: item.is_deleted,
            read_at: item.read_at,
            created_at: item.created_at,
            updated_at: item.updated_at,
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

  // Fetch sent messages
  const fetchSentMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          recipients:message_recipients (
            *,
            recipient:recipient_id (
              id,
              full_name,
              job_title,
              profile_picture_url
            )
          )
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      const formattedMessages: MessageWithRecipients[] = (messagesData || []).map((msg: any) => ({
        ...msg,
        recipients: (msg.recipients || []).map((r: any) => ({
          ...r,
          recipient: r.recipient,
        })),
      }));

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
      const { error } = await supabase
        .from('message_recipients')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('message_id', messageId)
        .eq('recipient_id', user.id);

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

  // Reply to a message
  const replyToMessage = async (
    originalMessage: InboxMessage,
    body: string
  ): Promise<{ success: boolean; error?: string }> => {
    const subject = originalMessage.subject.startsWith('Re: ')
      ? originalMessage.subject
      : `Re: ${originalMessage.subject}`;

    return sendMessage(subject, body, [originalMessage.sender_id]);
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
    replyToMessage,
    fetchRecipients,
    fetchJobTitleGroups,
    refreshInbox: fetchInboxMessages,
    refreshSent: fetchSentMessages,
  };
}
