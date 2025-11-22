import API_CONFIG from '@/config/api';
import { apiRequest } from '@/config/api';
import { 
  SupportTicketsResponse, 
  SupportTicketFilters 
} from '@/types/supportTicket';

export interface AssignTicketRequest {
  support_user_id: number;
  support_ticket_id: number;
  note?: string;
}

export interface AssignTicketResponse {
  status: boolean;
  message: string;
  data: any;
  error: any;
}

export interface UpdateTicketStatusRequest {
  ticket_id: number;
  status: string;
  priority: string;
  expected_closure_date?: string | null;
  close_date?: string | null;
  open_date?: string;
  status_update_date?: string;
  note?: string;
}

export interface UpdateTicketStatusResponse {
  status: boolean;
  message: string;
  data: any;
  error: any;
}

class SupportTicketService {
  /**
   * Fetch support tickets list with pagination and filters
   * @param filters - Optional filters for the tickets
   * @returns Promise<SupportTicketsResponse>
   */
  async getSupportTickets(filters?: SupportTicketFilters): Promise<SupportTicketsResponse> {
    try {
      console.log('🔍 SupportTicketService: Making API request to:', API_CONFIG.ENDPOINTS.SUPPORT_TICKETS);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const endpoint = queryParams.toString() 
        ? `${API_CONFIG.ENDPOINTS.SUPPORT_TICKETS}?${queryParams.toString()}`
        : API_CONFIG.ENDPOINTS.SUPPORT_TICKETS;
      
      console.log('🔍 SupportTicketService: Full endpoint:', endpoint);
      
      const response = await apiRequest(endpoint, 'GET');
      
      console.log('🔍 SupportTicketService: Raw API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ SupportTicketService: Success response, data:', response.data);
        return {
          status: true,
          message: response.message || 'Support tickets fetched successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to fetch support tickets',
          data: {
            tickets: [],
            pagination: {
              current_page: 1,
              last_page: 1,
              total_page: 1,
              per_page: 50,
              total: 0
            }
          },
          error: response.error || 'Unknown error occurred'
        };
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: {
          tickets: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total_page: 1,
            per_page: 50,
            total: 0
          }
        },
        error: 'Failed to connect to support tickets service'
      };
    }
  }

  /**
   * Get support ticket counts by status
   * @returns Promise<{open: number, inProgress: number, awaitingResponse: number, overdue: number, resolvedWithinSLA: number}>
   */
  async getSupportTicketCounts(): Promise<{
    open: number;
    inProgress: number;
    awaitingResponse: number;
    overdue: number;
    resolvedWithinSLA: number;
  }> {
    try {
      // For now, we'll calculate counts from the main tickets list
      // In a real implementation, you might have a separate endpoint for counts
      const response = await this.getSupportTickets({ per_page: 1000 }); // Get all tickets to count
      
      if (response.status && response.data.tickets) {
        const tickets = response.data.tickets;
        
        return {
          open: tickets.filter(ticket => !ticket.status || ticket.status === 'open').length,
          inProgress: tickets.filter(ticket => ticket.status === 'in-progress').length,
          awaitingResponse: tickets.filter(ticket => ticket.status === 'awaiting-response').length,
          overdue: tickets.filter(ticket => {
            // Check if ticket is overdue based on expected_closure_date
            if (!ticket.expected_closure_date) return false;
            const expectedDate = new Date(ticket.expected_closure_date);
            const now = new Date();
            return expectedDate < now && ticket.status !== 'resolved';
          }).length,
          resolvedWithinSLA: tickets.filter(ticket => ticket.status === 'resolved').length
        };
      }
      
      return {
        open: 0,
        inProgress: 0,
        awaitingResponse: 0,
        overdue: 0,
        resolvedWithinSLA: 0
      };
    } catch (error) {
      console.error('Error fetching support ticket counts:', error);
      return {
        open: 0,
        inProgress: 0,
        awaitingResponse: 0,
        overdue: 0,
        resolvedWithinSLA: 0
      };
    }
  }

  /**
   * Assign a support ticket to a support user
   * @param assignData - Assignment data including support_user_id, support_ticket_id, and optional note
   * @returns Promise<AssignTicketResponse>
   */
  async assignTicket(assignData: AssignTicketRequest): Promise<AssignTicketResponse> {
    try {
      console.log('🔍 SupportTicketService: Assigning ticket:', assignData);
      
      const response = await apiRequest(
        API_CONFIG.ENDPOINTS.SUPPORT_TICKET_ASSIGN, 
        'POST', 
        assignData
      );
      
      console.log('🔍 SupportTicketService: Assign ticket response:', response);
      
      return {
        status: response.success,
        message: response.message || 'Ticket assignment processed',
        data: response.data,
        error: response.error
      };
    } catch (error) {
      console.error('Error assigning ticket:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: null,
        error: 'Failed to connect to ticket assignment service'
      };
    }
  }

  /**
   * Update support ticket status
   * @param updateData - Update data including ticket_id, status, priority, dates, and optional note
   * @returns Promise<UpdateTicketStatusResponse>
   */
  async updateTicketStatus(updateData: UpdateTicketStatusRequest): Promise<UpdateTicketStatusResponse> {
    try {
      console.log('🔍 SupportTicketService: Updating ticket status:', updateData);
      
      const response = await apiRequest(
        API_CONFIG.ENDPOINTS.SUPPORT_TICKET_UPDATE_STATUS, 
        'POST', 
        updateData
      );
      
      console.log('🔍 SupportTicketService: Update ticket status response:', response);
      
      return {
        status: response.success,
        message: response.message || 'Ticket status updated successfully',
        data: response.data,
        error: response.error
      };
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: null,
        error: 'Failed to connect to ticket status update service'
      };
    }
  }
}

export const supportTicketService = new SupportTicketService();
