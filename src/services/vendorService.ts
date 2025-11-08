import API_CONFIG from '@/config/api';
import { apiRequest } from '@/config/api';

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
}

export interface VendorsResponse {
  status: boolean;
  message: string;
  data: {
    vendor_users: Vendor[];
    pagination: {
      current_page: number;
      last_page: number;
      total_page: number;
      per_page: number;
      total: number;
    };
  };
  error: null;
}

class VendorService {
  /**
   * Fetch vendors list
   * @returns Promise<VendorsResponse>
   */
  async getVendors(): Promise<VendorsResponse> {
    try {
      console.log('🔍 VendorService: Making API request to:', API_CONFIG.ENDPOINTS.VENDORS);
      const response = await apiRequest(API_CONFIG.ENDPOINTS.VENDORS, 'GET');
      
      console.log('🔍 VendorService: Raw API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ VendorService: Success response, data:', response.data);
        return {
          status: true,
          message: response.message || 'Vendor users fetched successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to fetch vendor users',
          data: {
            vendor_users: [],
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
      console.error('Error fetching vendor users:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: {
          vendor_users: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total_page: 1,
            per_page: 50,
            total: 0
          }
        },
        error: 'Failed to connect to vendor service'
      };
    }
  }
}

export const vendorService = new VendorService();
