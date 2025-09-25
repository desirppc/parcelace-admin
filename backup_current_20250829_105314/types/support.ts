
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subCategory: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'awaiting-response' | 'resolved' | 'closed';
  awbNumbers: string[];
  subject: string;
  description: string;
  attachments: File[];
  createdAt: Date;
  updatedAt: Date;
  expectedClosureDate: Date;
  customerEmail: string;
  assignedAgent?: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: 'customer' | 'agent';
  senderName: string;
  message: string;
  attachments?: File[];
  timestamp: Date;
  isRead: boolean;
}

export interface CategoryMapping {
  [key: string]: string[];
}

export interface KeywordMapping {
  [key: string]: {
    category: string;
    subCategory: string;
  };
}

export interface TicketStats {
  open: number;
  inProgress: number;
  awaitingResponse: number;
  overdue: number;
  resolvedWithinSLA: number;
}
