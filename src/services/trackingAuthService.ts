import API_CONFIG from '@/config/api';

// Custom API request function for tracking pages (no session expiry redirect)
const trackingApiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data?: any,
  customHeaders?: Record<string, string>
) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    
    console.log(`🌐 Tracking API Request (${method} ${endpoint}):`, {
      url,
      status: response.status,
      ok: response.ok,
      result
    });
    
    return {
      success: response.ok,
      data: result.data,
      message: result.message,
      status: response.status,
      error: !response.ok ? result.error || 'Request failed' : null
    };
  } catch (error) {
    console.error(`❌ Tracking API Request Error (${method} ${endpoint}):`, error);
    return {
      success: false,
      error: 'Network error occurred',
      status: 0
    };
  }
};

export interface SendOTPResponse {
  status: boolean;
  message: string;
  data: {
    message: string;
  };
  error: string | null;
}

export interface VerifyOTPResponse {
  status: boolean;
  message: string;
  data: {
    message: string;
    token: string;
  };
  error: string | null;
}

export class TrackingAuthService {
  // Token storage keys
  private static readonly TOKEN_KEY = 'tracking_auth_token';
  private static readonly TOKEN_EXPIRY_KEY = 'tracking_auth_token_expiry';
  
  // Token expiry time (24 hours)
  private static readonly TOKEN_EXPIRY_HOURS = 24;
  /**
   * Send OTP to the phone number associated with the AWB
   * @param awbNumber - The AWB number for tracking
   * @returns Promise<SendOTPResponse>
   */
  static async sendOTP(awbNumber: string): Promise<SendOTPResponse> {
    try {
      const response = await trackingApiRequest(
        API_CONFIG.ENDPOINTS.TRACKING_SEND_OTP,
        'POST',
        { awb: awbNumber }
      );
      
      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'OTP sent successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to send OTP',
          data: response.data,
          error: response.error || 'Unknown error occurred'
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: null,
        error: 'Failed to connect to OTP service'
      };
    }
  }

  /**
   * Verify OTP for the given AWB number
   * @param awbNumber - The AWB number for tracking
   * @param otp - The 6-digit OTP to verify
   * @returns Promise<VerifyOTPResponse>
   */
  static async verifyOTP(awbNumber: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      const response = await trackingApiRequest(
        API_CONFIG.ENDPOINTS.TRACKING_VERIFY_OTP,
        'POST',
        { awb: awbNumber, otp: otp }
      );
      
      if (response.success && response.data) {
        // Store the token if verification is successful
        if (response.data.token) {
          this.storeToken(response.data.token);
        }
        
        return {
          status: true,
          message: response.message || 'OTP verified successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to verify OTP',
          data: response.data,
          error: response.error || 'Unknown error occurred'
        };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: null,
        error: 'Failed to connect to OTP service'
      };
    }
  }

  /**
   * Store authentication token in localStorage with expiry
   * @param token - The authentication token to store
   */
  static storeToken(token: string): void {
    try {
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + this.TOKEN_EXPIRY_HOURS);
      
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toISOString());
      
      console.log('🔐 Tracking auth token stored successfully');
    } catch (error) {
      console.error('Error storing tracking auth token:', error);
    }
  }

  /**
   * Retrieve authentication token from localStorage
   * @returns string | null - The stored token or null if not found/expired
   */
  static getToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const expiryString = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (!token || !expiryString) {
        return null;
      }
      
      const expiryTime = new Date(expiryString);
      const now = new Date();
      
      if (now > expiryTime) {
        // Token expired, remove it
        this.clearToken();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error retrieving tracking auth token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated for tracking
   * @returns boolean - True if authenticated, false otherwise
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Clear authentication token from localStorage
   */
  static clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      console.log('🔐 Tracking auth token cleared');
    } catch (error) {
      console.error('Error clearing tracking auth token:', error);
    }
  }

  /**
   * Get authentication headers for API requests
   * @returns Record<string, string> - Headers with auth token
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'customer-token': token })
    };
  }
}

export default TrackingAuthService;
