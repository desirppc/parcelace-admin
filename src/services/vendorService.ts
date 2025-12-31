import API_CONFIG from '@/config/api';
import { apiRequest } from '@/config/api';

export interface SupportUser {
  id: number;
  email: string;
  name?: string;
}

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
  support_user_count?: number;
  support_users?: SupportUser[];
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

export interface VendorPOCData {
  vendor_id: number;
  name: string;
  number: string;
  role: string;
  email: string;
  whatsapp_number: string;
}

export interface VendorPOCResponse {
  status: boolean;
  message: string;
  data?: any;
  error?: string | null;
}

export interface VendorPOC {
  id: number;
  user_id: number;
  name: string;
  number: string;
  role: string;
  email: string;
  whatsapp_number: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface VendorPOCListResponse {
  status: boolean;
  message: string;
  data: {
    vendor_pocs_data: VendorPOC[];
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
        
        // Map API response fields to Vendor interface
        const mappedVendors = (response.data.vendor_users || []).map((vendor: any) => ({
          id: vendor.vendor_id || vendor.id,
          name: (vendor.vendor_name || vendor.name || '').toString(),
          email: (vendor.vendor_email || vendor.email || '').toString(),
          phone: (vendor.vendor_phone || vendor.phone || '').toString(),
          created_at: vendor.created_at,
          support_user_count: vendor.support_user_count || 0,
          support_users: vendor.support_users || []
        }));
        
        return {
          status: true,
          message: response.message || 'Vendor users fetched successfully',
          data: {
            ...response.data,
            vendor_users: mappedVendors
          },
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

  /**
   * Create a vendor POC (Point of Contact)
   * @param pocData VendorPOCData
   * @returns Promise<VendorPOCResponse>
   */
  async createVendorPOC(pocData: VendorPOCData): Promise<VendorPOCResponse> {
    try {
      console.log('🔍 VendorService: Creating vendor POC:', pocData);
      const response = await apiRequest(API_CONFIG.ENDPOINTS.VENDOR_POC, 'POST', {
        vendor_id: pocData.vendor_id,
        name: pocData.name,
        number: pocData.number,
        role: pocData.role,
        email: pocData.email,
        whatsapp_number: pocData.whatsapp_number
      });
      
      console.log('🔍 VendorService: Create POC response:', response);
      
      if (response.success) {
        return {
          status: true,
          message: response.message || 'Vendor POC created successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to create vendor POC',
          error: response.error || 'Unknown error occurred'
        };
      }
    } catch (error) {
      console.error('Error creating vendor POC:', error);
      return {
        status: false,
        message: 'Network error occurred',
        error: 'Failed to connect to vendor service'
      };
    }
  }

  /**
   * Fetch vendor POC list
   * @param vendorId Optional vendor ID to filter POCs
   * @returns Promise<VendorPOCListResponse>
   */
  async getVendorPOCs(vendorId?: number): Promise<VendorPOCListResponse> {
    try {
      console.log('🔍 VendorService: Fetching vendor POC list', vendorId ? `for vendor ${vendorId}` : '');
      
      // Build endpoint with optional vendor_id query parameter
      let endpoint = API_CONFIG.ENDPOINTS.VENDOR_POC;
      if (vendorId) {
        endpoint = `${endpoint}?vendor_id=${vendorId}`;
      }
      
      const response = await apiRequest(endpoint, 'GET');
      
      console.log('🔍 VendorService: Vendor POC list response:', response);
      
      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'Vendor POC data',
          data: {
            vendor_pocs_data: response.data.vendor_pocs_data || [],
            pagination: response.data.pagination || {
              current_page: 1,
              last_page: 1,
              total_page: 1,
              per_page: 50,
              total: 0
            }
          },
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to fetch vendor POCs',
          data: {
            vendor_pocs_data: [],
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
      console.error('Error fetching vendor POCs:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: {
          vendor_pocs_data: [],
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
