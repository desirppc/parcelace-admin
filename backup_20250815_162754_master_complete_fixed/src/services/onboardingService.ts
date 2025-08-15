import API_CONFIG from '@/config/api';

export interface OnboardingData {
  business_name?: string;
  business_type?: string;
  gst_number?: string;
  pan_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

export const submitOnboarding = async (data: OnboardingData, authToken?: string) => {
  try {
    const token = authToken || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ONBOARDING}`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.message || 'Onboarding submission failed' };
    }
  } catch (error) {
    console.error('Onboarding submission error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const getOnboardingStatus = async () => {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ONBOARDING}/status`, {
      method: 'GET',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`,
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.message || 'Failed to get onboarding status' };
    }
  } catch (error) {
    console.error('Get onboarding status error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}; 