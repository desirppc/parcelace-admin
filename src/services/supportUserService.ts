import API_CONFIG from '@/config/api';
import { apiRequest } from '@/config/api';

export interface SupportUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
}

export interface SupportUsersResponse {
  status: boolean;
  message: string;
  data: {
    support_users: SupportUser[];
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

class SupportUserService {
  /**
   * Fetch support users list
   * @returns Promise<SupportUsersResponse>
   */
  async getSupportUsers(): Promise<SupportUsersResponse> {
    try {
      console.log('🔍 SupportUserService: Making API request to:', API_CONFIG.ENDPOINTS.SUPPORT_USERS);
      const response = await apiRequest(API_CONFIG.ENDPOINTS.SUPPORT_USERS, 'GET');
      
      console.log('🔍 SupportUserService: Raw API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ SupportUserService: Success response, data:', response.data);
        return {
          status: true,
          message: response.message || 'Support users fetched successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to fetch support users',
          data: {
            support_users: [],
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
      console.error('Error fetching support users:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: {
          support_users: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total_page: 1,
            per_page: 50,
            total: 0
          }
        },
        error: 'Failed to connect to support users service'
      };
    }
  }
}

export const supportUserService = new SupportUserService();
