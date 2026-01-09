import { apiRequest } from '@/config/api';

export interface AddPincodeRequest {
  pincode: string;
  state: string;
  city: string;
}

export interface AddPincodeResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  status?: number;
}

export const pincodeService = {
  /**
   * Add a new delivery pincode
   */
  addPincode: async (data: AddPincodeRequest): Promise<AddPincodeResponse> => {
    try {
      const response = await apiRequest(
        'api/delivery-pincodes/create',
        'POST',
        data
      );
      
      return response;
    } catch (error) {
      console.error('Error adding pincode:', error);
      return {
        success: false,
        error: 'Failed to add pincode',
        status: 0
      };
    }
  }
};

