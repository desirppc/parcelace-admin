export interface EmailAttachment {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface EmailThread {
  id: number;
  email_thread_id: number;
  subject: string;
  from_email: string;
  from_name: string;
  to_email: string;
  cc?: string;
  bcc?: string;
  body: string;
  body_html?: string;
  status: 'open' | 'closed' | 'pending' | 'resolved' | 'spam' | 'answered';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  assigned_user?: {
    id: number;
    name: string;
    email: string;
  };
  tags?: string[];
  created_at: string;
  updated_at: string;
  attachments?: EmailAttachment[];
  is_internal?: boolean;
  parent_thread_id?: number;
}

export interface EmailResponse {
  id: number;
  thread_id: number;
  from_email: string;
  from_name: string;
  to_email: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  body_html?: string;
  created_at: string;
  updated_at: string;
  attachments?: EmailAttachment[];
  is_internal?: boolean;
  is_reply?: boolean;
}

export interface InternalNote {
  id: number;
  thread_id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  note: string;
  created_at: string;
  updated_at: string;
}

export interface CannedResponse {
  id: number;
  title: string;
  content: string;
  content_html?: string;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailPagination {
  current_page: number;
  last_page: number;
  total_page: number;
  per_page: number;
  total: number;
}

export interface EmailFilters {
  status?: 'open' | 'closed' | 'pending' | 'resolved' | 'spam' | 'answered' | '';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | '';
  assigned_to?: number;
  search?: string;
  page?: number;
  per_page?: number;
  from_date?: string;
  to_date?: string;
}

export interface EmailThreadsResponse {
  status: boolean;
  message: string;
  data: {
    threads: EmailThread[];
    pagination: EmailPagination;
  };
  error: null;
}

export interface EmailThreadDetailsResponse {
  status: boolean;
  message: string;
  data: {
    thread: EmailThread;
    responses: EmailResponse[];
    internal_notes: InternalNote[];
  };
  error: null;
}

export interface SendEmailRequest {
  thread_id?: number;
  to_email: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  body_html?: string;
  attachments?: File[];
  is_internal?: boolean;
}

export interface SendEmailResponse {
  status: boolean;
  message: string;
  data: EmailResponse;
  error: any;
}

export interface UpdateThreadStatusRequest {
  thread_id: number;
  status: 'open' | 'closed' | 'pending' | 'resolved' | 'spam' | 'answered';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  note?: string;
}

export interface AddInternalNoteRequest {
  thread_id: number;
  note: string;
}

export interface CannedResponsesResponse {
  status: boolean;
  message: string;
  data: CannedResponse[];
  error: null;
}

