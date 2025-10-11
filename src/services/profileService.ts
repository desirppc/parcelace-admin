import API_CONFIG, { getApiUrl, getAuthHeaders, handleSessionExpiry } from '@/config/api';

export interface ProfileInfo {
  name: string;
  email: string;
  email_verified: boolean | null;
  phone: string;
  phone_verified: boolean | null;
  kyc_verified: boolean;
}

export interface LegalDetails {
  legal_entity: string;
  legal_name: string;
  gstin: string;
  address: string;
}

export interface BusinessDetails {
  sales_platform: string;
  monthly_orders: string;
  brand_name: string | null;
  brand_website: string | null;
}

export interface BankDetails {
  payee_name: string;
  account_number: string;
  ifsc: string;
  bank_verified: boolean;
}

export interface BrandDetails {
  support_contact_number: string | null;
  support_email: string | null;
  facebook_link: string | null;
  twitter_link: string | null;
  linkedin_link: string | null;
  instagram_link: string | null;
  youtube_link: string | null;
  brand_logo: string | null;
}

export interface ProfileDashboardData {
  profile_info: ProfileInfo;
  legal_details: LegalDetails;
  business_details: BusinessDetails;
  bank_details: BankDetails;
  brand_details: BrandDetails;
}

export interface ProfileDashboardResponse {
  status: boolean;
  message: string;
  data: ProfileDashboardData;
  error: string | null;
}

class ProfileService {
  /**
   * Fetch profile dashboard data
   */
  async getProfileDashboard(): Promise<ProfileDashboardResponse> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_DASHBOARD}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: ProfileDashboardResponse = await response.json();
      
      // Check for session expiry
      if (response.status === 401 || 
          data.message === 'Session expired' || 
          data.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (data.status === false && data.message === 'Session expired')) {
        console.log('🔒 Session expired detected in ProfileService.getProfileDashboard');
        handleSessionExpiry();
        throw new Error('Session expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile dashboard API response:', data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile dashboard:', error);
      throw error;
    }
  }

  /**
   * Update profile information
   */
  async updateProfile(profileData: Partial<ProfileInfo>): Promise<ProfileDashboardResponse> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_DASHBOARD}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data: ProfileDashboardResponse = await response.json();
      
      // Check for session expiry
      if (response.status === 401 || 
          data.message === 'Session expired' || 
          data.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (data.status === false && data.message === 'Session expired')) {
        console.log('🔒 Session expired detected in ProfileService.updateProfile');
        handleSessionExpiry();
        throw new Error('Session expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile update API response:', data);
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Update business details
   */
  async updateBusinessDetails(businessData: Partial<BusinessDetails>): Promise<ProfileDashboardResponse> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_DASHBOARD}/business`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      const data: ProfileDashboardResponse = await response.json();
      
      // Check for session expiry
      if (response.status === 401 || 
          data.message === 'Session expired' || 
          data.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (data.status === false && data.message === 'Session expired')) {
        console.log('🔒 Session expired detected in ProfileService.updateBusinessDetails');
        handleSessionExpiry();
        throw new Error('Session expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Business details update API response:', data);
      }

      return data;
    } catch (error) {
      console.error('Error updating business details:', error);
      throw error;
    }
  }

  /**
   * Update bank details
   */
  async updateBankDetails(bankData: Partial<BankDetails>): Promise<ProfileDashboardResponse> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_DASHBOARD}/bank`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bankData),
      });

      const data: ProfileDashboardResponse = await response.json();
      
      // Check for session expiry
      if (response.status === 401 || 
          data.message === 'Session expired' || 
          data.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (data.status === false && data.message === 'Session expired')) {
        console.log('🔒 Session expired detected in ProfileService.updateBankDetails');
        handleSessionExpiry();
        throw new Error('Session expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Bank details update API response:', data);
      }

      return data;
    } catch (error) {
      console.error('Error updating bank details:', error);
      throw error;
    }
  }

  /**
   * Update brand details
   */
  async updateBrandDetails(brandData: Partial<BrandDetails>): Promise<ProfileDashboardResponse> {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_DASHBOARD}/brand`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });

      const data: ProfileDashboardResponse = await response.json();
      
      // Check for session expiry
      if (response.status === 401 || 
          data.message === 'Session expired' || 
          data.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (data.status === false && data.message === 'Session expired')) {
        console.log('🔒 Session expired detected in ProfileService.updateBrandDetails');
        handleSessionExpiry();
        throw new Error('Session expired');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Brand details update API response:', data);
      }

      return data;
    } catch (error) {
      console.error('Error updating brand details:', error);
      throw error;
    }
  }
}

export default new ProfileService();
