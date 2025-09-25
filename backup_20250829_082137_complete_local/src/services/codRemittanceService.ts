import { apiRequest, getApiUrl, getAuthHeaders } from '@/config/api';
import API_CONFIG from '@/config/api';

export interface CODRemittance {
  id: number;
  reference_id: string;
  total_awb: number;
  due_date: string;
  total_amount: string;
  utr_no: string | null;
  check_payment: boolean;
  utr_date: string | null;
}

export interface CODRemittanceResponse {
  cod_remittances: CODRemittance[];
  pagination: {
    current_page: number;
    last_page: number;
    total_page: number;
    per_page: number;
    total: number;
  };
}

export interface CODRemittanceApiResponse {
  status: boolean;
  message: string;
  data: CODRemittanceResponse;
  error: string | null;
}

export interface CODRemittanceDetail {
  id: number;
  awb: string;
  due_date: string;
  invoice_value: string;
  utr_no: string | null;
  cod_remittance_id: number;
  remittance: {
    id: number;
    reference_id: string;
  };
}

export interface CODRemittanceDetailsResponse {
  cod_remittance_details: CODRemittanceDetail[];
  pagination: {
    current_page: number;
    last_page: number;
    total_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * COD Remittance Service
 * Handles all COD remittance related API calls
 */
export class CODRemittanceService {
  /**
   * Get COD remittance data with pagination
   */
  static async getCODRemittances(page: number = 1, perPage: number = 50): Promise<{
    success: boolean;
    data?: CODRemittanceResponse;
    message?: string;
    error?: string;
    status: number;
  }> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.COD_REMITTANCE}?page=${page}&per_page=${perPage}`;
      const response = await apiRequest(endpoint, 'GET');
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as CODRemittanceResponse,
          message: response.message,
          status: response.status
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to fetch COD remittances',
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching COD remittances:', error);
      return {
        success: false,
        error: 'Network error occurred',
        status: 0
      };
    }
  }

  /**
   * Get COD remittance by ID
   */
  static async getCODRemittanceById(id: number): Promise<{
    success: boolean;
    data?: CODRemittance;
    message?: string;
    error?: string;
    status: number;
  }> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.COD_REMITTANCE}/${id}`;
      const response = await apiRequest(endpoint, 'GET');
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as CODRemittance,
          message: response.message,
          status: response.status
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to fetch COD remittance',
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching COD remittance:', error);
      return {
        success: false,
        error: 'Network error occurred',
        status: 0
      };
    }
  }

  /**
   * Get COD remittance details by ID
   */
  static async getCODRemittanceDetails(id: number): Promise<{
    success: boolean;
    data?: CODRemittanceDetailsResponse;
    message?: string;
    error?: string;
    status: number;
  }> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.COD_REMITTANCE}/${id}`;
      const response = await apiRequest(endpoint, 'GET');
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as CODRemittanceDetailsResponse,
          message: response.message,
          status: response.status
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to fetch COD remittance details',
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching COD remittance details:', error);
      return {
        success: false,
        error: 'Network error occurred',
        status: 0
      };
    }
  }

  /**
   * Update UTR number for a COD remittance
   */
  static async updateUTRNumber(id: number, utrNo: string, utrDate?: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    status: number;
  }> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.COD_REMITTANCE}/${id}/utr`;
      const data = {
        utr_no: utrNo,
        utr_date: utrDate || new Date().toISOString().split('T')[0]
      };
      
      const response = await apiRequest(endpoint, 'PUT', data);
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'UTR number updated successfully',
          status: response.status
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to update UTR number',
        status: response.status
      };
    } catch (error) {
      console.error('Error updating UTR number:', error);
      return {
        success: false,
        error: 'Network error occurred',
        status: 0
      };
    }
  }

  /**
   * Mark COD remittance as paid
   */
  static async markAsPaid(id: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    status: number;
  }> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.COD_REMITTANCE}/${id}/mark-paid`;
      const response = await apiRequest(endpoint, 'PUT');
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'COD remittance marked as paid',
          status: response.status
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to mark as paid',
        status: response.status
      };
    } catch (error) {
      console.error('Error marking COD remittance as paid:', error);
      return {
        success: false,
        error: 'Network error occurred',
        status: 0
      };
    }
  }

  /**
   * Export COD remittance data
   */
  static async exportCODRemittances(format: 'csv' | 'excel' = 'csv'): Promise<{
    success: boolean;
    data?: Blob;
    message?: string;
    error?: string;
    status: number;
  }> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.COD_REMITTANCE}/export?format=${format}`;
      const response = await fetch(getApiUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        return {
          success: true,
          data: blob,
          message: 'Export successful',
          status: response.status
        };
      }
      
      return {
        success: false,
        error: 'Failed to export data',
        status: response.status
      };
    } catch (error) {
      console.error('Error exporting COD remittances:', error);
      return {
        success: false,
        error: 'Network error occurred',
        status: 0
      };
    }
  }
}



export default CODRemittanceService;
