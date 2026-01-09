import { getApiUrl, getAuthHeaders } from '@/config/api';

export interface UpdateEwayRequest {
  awb: string;
  dcn: string;
  ewbn: string;
}

export interface UpdateEwayResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  status?: number;
}

export const ewayService = {
  /**
   * Update eway bill
   */
  updateEwayBill: async (data: UpdateEwayRequest): Promise<UpdateEwayResponse> => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication token not found',
          status: 401
        };
      }

      if (!data.awb || !data.dcn || !data.ewbn) {
        return {
          success: false,
          error: 'AWB, Invoice Number (DCN), and Eway Number (EWBN) are required',
          status: 400
        };
      }

      // Validate eway number is 12 digits
      if (data.ewbn.length !== 12 || !/^\d+$/.test(data.ewbn)) {
        return {
          success: false,
          error: 'Eway Number must be exactly 12 digits',
          status: 400
        };
      }

      const url = getApiUrl('api/shipments/update-eway-bill');
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('awb', data.awb);
      formData.append('dcn', data.dcn);
      formData.append('ewbn', data.ewbn);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || `Failed to update eway bill (${response.status})`,
          error: result.error || result.message,
          status: response.status
        };
      }

      return {
        success: true,
        message: result.message || 'Eway bill updated successfully',
        data: result.data,
        status: response.status
      };
    } catch (error) {
      console.error('Error updating eway bill:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update eway bill',
        status: 0
      };
    }
  }
};

