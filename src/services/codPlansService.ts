import { apiRequest } from '@/config/api';

export interface CODPlan {
  id: number;
  name: string;
  description: string;
  percentage: number;
  days: string;
  remittance_frequency: string | null;
  is_default: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CODPlansResponse {
  cod_plans: CODPlan[];
  current_plan: CODPlan;
  pagination: {
    current_page: number;
    last_page: number;
    total_page: number;
    per_page: number;
    total: number;
  };
}

export interface CODPlansApiResponse {
  status: boolean;
  message: string;
  data: CODPlansResponse;
  error: string | null;
}

export interface AssignPlanRequest {
  plan_id: number;
  agreed_to_terms: string;
}

export interface AssignPlanResponse {
  status: boolean;
  message: string;
  data?: any;
  error: string | null;
}

/**
 * COD Plans Service
 * Handles all COD plans related API calls
 */
export class CODPlansService {
  /**
   * Get COD plans list
   */
  static async getCODPlans(): Promise<{
    success: boolean;
    data?: CODPlansResponse;
    message?: string;
    error?: string;
    status: number;
  }> {
    try {
      const response = await apiRequest('api/cod-plans/list', 'GET');
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as CODPlansResponse,
          message: response.message,
          status: response.status
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to fetch COD plans',
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching COD plans:', error);
      return {
        success: false,
        error: 'Network error occurred',
        status: 0
      };
    }
  }

  /**
   * Assign COD plan to user
   */
  static async assignPlanToUser(planId: number, agreedToTerms: boolean): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    status: number;
  }> {
    try {
      const requestData: AssignPlanRequest = {
        plan_id: planId,
        agreed_to_terms: agreedToTerms ? 'yes' : 'no'
      };

      const response = await apiRequest('api/cod-plans/assign-to-user', 'POST', requestData);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message,
          status: response.status
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to assign COD plan',
        status: response.status
      };
    } catch (error) {
      console.error('Error assigning COD plan:', error);
      return {
        success: false,
        error: 'Network error occurred',
        status: 0
      };
    }
  }
}
