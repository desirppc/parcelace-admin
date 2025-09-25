import API_CONFIG, { apiRequest } from '@/config/api';

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
  };
  error: string | null;
}

export class TrackingAuthService {
  /**
   * Send OTP to the phone number associated with the AWB
   * @param awbNumber - The AWB number for tracking
   * @returns Promise<SendOTPResponse>
   */
  static async sendOTP(awbNumber: string): Promise<SendOTPResponse> {
    try {
      const response = await apiRequest(
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
      const response = await apiRequest(
        API_CONFIG.ENDPOINTS.TRACKING_VERIFY_OTP,
        'POST',
        { awb: awbNumber, otp: otp }
      );
      
      if (response.success && response.data) {
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
}

export default TrackingAuthService;
