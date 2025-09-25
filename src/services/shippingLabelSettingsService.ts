import API_CONFIG, { apiRequest } from '@/config/api';

// Types for shipping label settings
export interface ShippingLabelSettings {
  label_type: 'A6' | 'Thermal';
  show_sender_address: boolean;
  show_sender_number: boolean;
  show_custom_address: boolean;
  custom_address?: string;
  show_order_total: boolean;
  show_product_name: boolean;
  show_receiver_number: boolean;
  show_brand_logo: boolean;
  brand_logo_url?: string;
}

export interface ShippingLabelSettingsResponse {
  success: boolean;
  data?: ShippingLabelSettings;
  message?: string;
  error?: string;
}

export interface BrandLogoUploadResponse {
  success: boolean;
  data?: {
    logo_url: string;
    message: string;
  };
  message?: string;
  error?: string;
}

class ShippingLabelSettingsService {
  /**
   * Get current shipping label settings
   */
  async getSettings(): Promise<ShippingLabelSettingsResponse> {
    try {
      const response = await apiRequest(
        API_CONFIG.ENDPOINTS.SHIPPING_LABEL_SETTINGS,
        'GET'
      );
      
      return response;
    } catch (error) {
      console.error('Error fetching shipping label settings:', error);
      return {
        success: false,
        error: 'Failed to fetch shipping label settings'
      };
    }
  }

  /**
   * Update shipping label settings
   */
  async updateSettings(settings: Partial<ShippingLabelSettings>): Promise<ShippingLabelSettingsResponse> {
    try {
      const response = await apiRequest(
        API_CONFIG.ENDPOINTS.SHIPPING_LABEL_SETTINGS_UPDATE,
        'PUT',
        settings
      );
      
      return response;
    } catch (error) {
      console.error('Error updating shipping label settings:', error);
      return {
        success: false,
        error: 'Failed to update shipping label settings'
      };
    }
  }

  /**
   * Upload brand logo for shipping label
   */
  async uploadBrandLogo(file: File): Promise<BrandLogoUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('brand_logo', file);
      
      const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SHIPPING_LABEL_BRAND_LOGO, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
        },
        body: formData
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        data: result.data,
        message: result.message,
        error: !response.ok ? result.error || 'Upload failed' : undefined
      };
    } catch (error) {
      console.error('Error uploading brand logo:', error);
      return {
        success: false,
        error: 'Failed to upload brand logo'
      };
    }
  }

  /**
   * Remove brand logo from shipping label
   */
  async removeBrandLogo(): Promise<ShippingLabelSettingsResponse> {
    try {
      const response = await apiRequest(
        API_CONFIG.ENDPOINTS.SHIPPING_LABEL_BRAND_LOGO,
        'DELETE'
      );
      
      return response;
    } catch (error) {
      console.error('Error removing brand logo:', error);
      return {
        success: false,
        error: 'Failed to remove brand logo'
      };
    }
  }
}

export default new ShippingLabelSettingsService();
