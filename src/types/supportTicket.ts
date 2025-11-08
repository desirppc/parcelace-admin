export interface SupportTicketDetail {
  id: number;
  support_ticket_id: number;
  shipment_id: number;
  awb: string;
  status: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  assigned_user_id: number | null;
  status: string | null;
  assigned_date: string | null;
  open_date: string | null;
  close_date: string | null;
  category: string;
  sub_category: string;
  status_update_date: string | null;
  remark: string;
  priority: string | null;
  expected_closure_date: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  details: SupportTicketDetail[];
  user: SupportTicketUser;
}

export interface SupportTicketPagination {
  current_page: number;
  last_page: number;
  total_page: number;
  per_page: number;
  total: number;
}

export interface SupportTicketsResponse {
  status: boolean;
  message: string;
  data: {
    tickets: SupportTicket[];
    pagination: SupportTicketPagination;
  };
  error: null;
}

export interface SupportTicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
