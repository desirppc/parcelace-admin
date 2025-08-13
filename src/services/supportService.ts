import { apiRequest } from '@/config/api';

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

export interface SupportTicketResponse {
  id: number;
  user_id: number;
  assigned_user_id: number | null;
  status: string | null;
  assigned_date: string;
  open_date: string;
  close_date: string;
  category: string;
  sub_category: string;
  status_update_date: string;
  remark: string;
  priority: string | null;
  expected_closure_date: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  details: SupportTicketDetail[];
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

export interface SupportTicketsResponse {
  status: boolean;
  message: string;
  data: {
    tickets: SupportTicketResponse[];
    pagination: {
      current_page: number;
      last_page: number;
      total_page: number;
      per_page: number;
      total: number;
    };
  };
  error: string | null;
}

export interface SupportTicketStats {
  open: number;
  inProgress: number;
  awaitingResponse: number;
  overdue: number;
  resolvedWithinSLA: number;
}

class SupportService {
  /**
   * Get all support tickets for the current user
   */
  async getSupportTickets(): Promise<SupportTicketsResponse> {
    try {
      console.log('🔍 Fetching support tickets from API...');
      const response = await apiRequest('api/support-ticket', 'GET');
      console.log('📡 Support tickets API response:', response);
      
      // Validate response structure
      if (!response) {
        console.error('❌ No response from API');
        throw new Error('No response from API');
      }
      
      if (!response.data) {
        console.warn('⚠️ API response missing data field:', response);
        // Return empty data structure
        return {
          status: false,
          message: 'No data received from API',
          data: { tickets: [], pagination: { current_page: 1, last_page: 1, total_page: 1, per_page: 50, total: 0 } },
          error: 'Missing data field in response'
        };
      }
      
      if (!response.data.tickets || !Array.isArray(response.data.tickets)) {
        console.warn('⚠️ API response missing tickets array:', response.data);
        // Return empty data structure
        return {
          status: false,
          message: 'Invalid data format from API',
          data: { tickets: [], pagination: { current_page: 1, last_page: 1, total_page: 1, per_page: 50, total: 0 } },
          error: 'Tickets array is missing or invalid'
        };
      }
      
      console.log(`✅ Successfully fetched ${response.data.tickets.length} support tickets`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching support tickets:', error);
      throw error;
    }
  }

  /**
   * Get support ticket details by ID
   */
  async getTicketDetails(ticketId: number): Promise<any> {
    try {
      const response = await apiRequest(`api/support-ticket/${ticketId}`, 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(ticketData: {
    category: string;
    subcategory: string;
    remark: string;
    AWBValues: string[];
  }): Promise<any> {
    try {
      const response = await apiRequest('api/support-ticket', 'POST', ticketData);
      return response;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  /**
   * Update a support ticket
   */
  async updateTicket(ticketId: number, updateData: any): Promise<any> {
    try {
      const response = await apiRequest(`api/support-ticket/${ticketId}`, 'PUT', updateData);
      return response;
    } catch (error) {
      console.error('Error updating support ticket:', error);
      throw error;
    }
  }

  /**
   * Reply to a support ticket
   */
  async replyToTicket(ticketId: number, replyData: any): Promise<any> {
    try {
      const response = await apiRequest(`api/support-ticket/${ticketId}/reply`, 'POST', replyData);
      return response;
    } catch (error) {
      console.error('Error replying to support ticket:', error);
      throw error;
    }
  }

  /**
   * Close a support ticket
   */
  async closeTicket(ticketId: number): Promise<any> {
    try {
      const response = await apiRequest(`api/support-ticket/${ticketId}/close`, 'POST');
      return response;
    } catch (error) {
      console.error('Error closing support ticket:', error);
      throw error;
    }
  }

  /**
   * Calculate ticket statistics from API data
   */
  calculateStats(tickets: SupportTicketResponse[]): SupportTicketStats {
    // Add safety check for tickets parameter
    if (!tickets || !Array.isArray(tickets)) {
      console.warn('calculateStats: tickets parameter is not an array:', tickets);
      return {
        open: 0,
        inProgress: 0,
        awaitingResponse: 0,
        overdue: 0,
        resolvedWithinSLA: 0,
      };
    }

    const now = new Date();

    const statusCounts = {
      open: 0,
      inProgress: 0,
      awaitingResponse: 0,
      overdue: 0,
      resolvedWithinSLA: 0,
    };

    for (const t of tickets) {
      if (!t || typeof t !== 'object') {
        console.warn('calculateStats: Invalid ticket object:', t);
        continue;
      }

      const status = t.status || '';
      if (status === 'open_ticket') statusCounts.open += 1;
      else if (status === 'work_in_progress') statusCounts.inProgress += 1;
      else if (status === 'ticket_awaiting_response') statusCounts.awaitingResponse += 1;
      else if (status === 'resolved') statusCounts.resolvedWithinSLA += 1;
      else if (!status || status === null) statusCounts.open += 1; // Handle null status as open

      if (t.expected_closure_date && !['resolved', 'closed'].includes(status)) {
        const expected = new Date(t.expected_closure_date);
        if (!isNaN(expected.getTime()) && now > expected) statusCounts.overdue += 1;
      }
    }

    return statusCounts;
  }

  /**
   * Transform API response to match frontend interface
   */
  transformTicketForFrontend(apiTicket: SupportTicketResponse): any {
    // Add safety check for apiTicket parameter
    if (!apiTicket || typeof apiTicket !== 'object') {
      console.warn('transformTicketForFrontend: Invalid apiTicket parameter:', apiTicket);
      return {
        id: '0',
        ticketNumber: 'TKT-0',
        category: 'Unknown',
        subCategory: 'Unknown',
        priority: 'medium',
        status: 'open',
        awbNumbers: [],
        subject: 'Invalid ticket data',
        description: 'Invalid ticket data',
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedClosureDate: new Date().toISOString(),
        customerEmail: 'customer@example.com',
        messages: []
      };
    }

    // Add safety check for details array
    const details = apiTicket.details && Array.isArray(apiTicket.details) ? apiTicket.details : [];
    
    return {
      id: apiTicket.id?.toString() || '0',
      ticketNumber: `TKT-${apiTicket.id || '0'}`,
      category: this.formatCategory(apiTicket.category || ''),
      subCategory: this.formatSubCategory(apiTicket.sub_category || ''),
      priority: apiTicket.priority || 'medium',
      status: this.mapStatus(apiTicket.status),
      awbNumbers: details.map(detail => detail?.awb || '').filter(awb => awb),
      subject: apiTicket.remark || 'No subject',
      description: apiTicket.remark || 'No description',
      attachments: [],
      createdAt: apiTicket.created_at || new Date().toISOString(),
      updatedAt: apiTicket.updated_at || new Date().toISOString(),
      expectedClosureDate: apiTicket.expected_closure_date || new Date().toISOString(),
      customerEmail: 'customer@example.com', // This might need to come from user context
      messages: []
    };
  }

  /**
   * Format category for display
   */
  private formatCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'pickup_delivery_related': 'Pickup & Delivery Related',
      'finance': 'Finance',
      'billing_remittance': 'Billing & Remittance',
      'shipment_ndr_and_rto': 'Shipment NDR and RTO',
      'technical_support': 'Technical Support',
      'claims': 'Claims',
      'delivery_issue_new': 'Delivery Issue',
      'Billing Remittance': 'Billing & Remittance',
      'Claims': 'Claims',
      'Finance': 'Finance',
      'Delivery Issue new': 'Delivery Issue',
      'Shipment NDR and RTO': 'Shipment NDR and RTO'
    };
    
    return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format sub-category for display
   */
  private formatSubCategory(subCategory: string): string {
    const subCategoryMap: { [key: string]: string } = {
      'delay_in_pickup': 'Delay in Pickup',
      'delay_in_cod_remittance': 'Delay in COD Remittance',
      'incorrect_invoice_amount_charges': 'Incorrect Invoice Amount/Charges',
      'fake_ndr_remarks': 'Fake NDR Remarks',
      'late_delivery_new': 'Late Delivery',
      'api_integration_issues': 'API Integration Issues',
      'damage_claims': 'Damage Claims',
      'Payment Gateway Problems': 'Payment Gateway Problems',
      'Lost Package Claims': 'Lost Package Claims',
      'Close account - transfer wallet balance to bank': 'Close Account - Transfer Wallet Balance to Bank',
      'Late Delivery new': 'Late Delivery'
    };
    
    return subCategoryMap[subCategory] || subCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Map API status to frontend status
   */
  private mapStatus(apiStatus: string | null): string {
    if (!apiStatus) return 'open';
    
    const statusMap: { [key: string]: string } = {
      'open_ticket': 'open',
      'work_in_progress': 'in-progress',
      'ticket_awaiting_response': 'awaiting-response',
      'resolved': 'resolved',
      'closed': 'closed'
    };
    
    return statusMap[apiStatus] || 'open';
  }
}

export default new SupportService();
