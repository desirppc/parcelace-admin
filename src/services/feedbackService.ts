import API_CONFIG from '@/config/api';
import TrackingAuthService from '@/services/trackingAuthService';

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

export interface FeedbackResponse {
  status: boolean;
  message: string;
  data: any;
  error: {
    message: string;
  } | null;
}

export interface RateUsRequest {
  rate: 'excellent' | 'good' | 'okay' | 'bad' | 'terrible';
  awb: string;
}

export interface NPSRequest {
  remark_score: number;
  remark: string;
  awb: string;
}

export class FeedbackService {
  /**
   * Submit delivery rating
   * @param rate - The rating value (excellent, good, okay, bad, terrible)
   * @param awbNumber - The AWB number
   * @returns Promise<FeedbackResponse>
   */
  static async submitRating(rate: RateUsRequest['rate'], awbNumber: string): Promise<FeedbackResponse> {
    try {
      const token = TrackingAuthService.getToken();
      
      if (!token) {
        return {
          status: false,
          message: 'Authentication required',
          data: null,
          error: {
            message: 'Please authenticate first to submit feedback'
          }
        };
      }

      const response = await trackingApiRequest(
        API_CONFIG.ENDPOINTS.FEEDBACK_RATE_US,
        'POST',
        {
          rate,
          awb: awbNumber
        },
        TrackingAuthService.getAuthHeaders()
      );

      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'Rating submitted successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to submit rating',
          data: response.data,
          error: response.error ? { message: response.error } : { message: 'Unknown error occurred' }
        };
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: null,
        error: {
          message: 'Failed to connect to feedback service'
        }
      };
    }
  }

  /**
   * Submit NPS score and remarks
   * @param score - The NPS score (0-10)
   * @param remark - The remark text
   * @param awbNumber - The AWB number
   * @returns Promise<FeedbackResponse>
   */
  static async submitNPS(score: number, remark: string, awbNumber: string): Promise<FeedbackResponse> {
    try {
      const token = TrackingAuthService.getToken();
      
      if (!token) {
        return {
          status: false,
          message: 'Authentication required',
          data: null,
          error: {
            message: 'Please authenticate first to submit feedback'
          }
        };
      }

      const response = await trackingApiRequest(
        API_CONFIG.ENDPOINTS.FEEDBACK_NPS,
        'POST',
        {
          remark_score: score,
          remark: remark,
          awb: awbNumber
        },
        TrackingAuthService.getAuthHeaders()
      );

      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'NPS submitted successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to submit NPS',
          data: response.data,
          error: response.error ? { message: response.error } : { message: 'Unknown error occurred' }
        };
      }
    } catch (error) {
      console.error('Error submitting NPS:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: null,
        error: {
          message: 'Failed to connect to feedback service'
        }
      };
    }
  }

  /**
   * Submit both rating and NPS in a single call
   * @param rating - The delivery rating
   * @param npsScore - The NPS score
   * @param remark - The remark text
   * @param awbNumber - The AWB number
   * @returns Promise<{rating: FeedbackResponse, nps: FeedbackResponse}>
   */
  static async submitBoth(
    rating: RateUsRequest['rate'], 
    npsScore: number, 
    remark: string, 
    awbNumber: string
  ): Promise<{rating: FeedbackResponse, nps: FeedbackResponse}> {
    const ratingResult = await this.submitRating(rating, awbNumber);
    const npsResult = await this.submitNPS(npsScore, remark, awbNumber);
    
    return {
      rating: ratingResult,
      nps: npsResult
    };
  }

  /**
   * Convert numeric rating to API format
   * @param rating - Numeric rating (1-5)
   * @returns API format rating
   */
  static convertNumericRatingToAPI(rating: number): RateUsRequest['rate'] {
    switch (rating) {
      case 1: return 'terrible';
      case 2: return 'bad';
      case 3: return 'okay';
      case 4: return 'good';
      case 5: return 'excellent';
      default: return 'okay';
    }
  }

  /**
   * Convert API rating to display text
   * @param rating - API format rating
   * @returns Display text
   */
  static convertAPIRatingToDisplay(rating: RateUsRequest['rate']): string {
    switch (rating) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'okay': return 'Okay';
      case 'bad': return 'Bad';
      case 'terrible': return 'Terrible';
      default: return 'Okay';
    }
  }
}

export default FeedbackService;
