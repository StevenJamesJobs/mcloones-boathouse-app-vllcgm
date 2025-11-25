
export interface Message {
  id: string;
  sender_id: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string;
    job_title: string;
    profile_picture_url?: string;
  };
}

export interface MessageRecipient {
  id: string;
  message_id: string;
  recipient_id: string;
  is_read: boolean;
  is_deleted: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  recipient?: {
    id: string;
    full_name: string;
    job_title: string;
    profile_picture_url?: string;
  };
}

export interface MessageWithRecipients extends Message {
  recipients: MessageRecipient[];
}

export interface InboxMessage extends Message {
  recipient_info: MessageRecipient;
}

export interface RecipientOption {
  id: string;
  full_name: string;
  job_title: string;
  profile_picture_url?: string;
}

export interface JobTitleGroup {
  job_title: string;
  count: number;
  users: RecipientOption[];
}
