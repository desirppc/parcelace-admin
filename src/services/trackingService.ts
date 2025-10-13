import API_CONFIG, { apiRequest } from '@/config/api';

export interface TrackingOrderDetails {
  id: number;
  store_customer_id: number;
  store_customer_address_id: number;
  order_id: string;
  order_no: string;
  total: string;
  total_tax: string;
  total_discount: string;
  cod_charges: string;
  collectable_amount: string;
  height: string;
  width: string;
  length: string;
  weight: string;
  volumetric_weight: string;
  parcel_type: string;
  shipment_mod: string;
  sync_date: string;
  shipping_rate: number;
  awb: string;
  delivery_partner: string;
  shipment_status: string;
  estimated_pickup_date: string;
  estimated_delivery_date: string;
  shipment_date_time: string;
}

export interface TrackingCustomerDetails {
  id: number;
  store_order_id: number | null;
  shipping_first_name: string;
  shipping_last_name: string | null;
  shipping_email: string;
  shipping_address1: string;
  shipping_address2: string;
  shipping_city: string;
  shipping_zipcode: string;
  shipping_phone: string;
}

export interface TrackingProductDetails {
  id: number;
  store_order_id: number;
  name: string;
  quantity: number;
  price: string;
  total_price: string;
  sku: string | null;
  tax_rate: string | null;
  hsn_code: string | null;
  total_tax: string | null;
}

export interface TrackingWarehouseDetails {
  id: number;
  city: string;
}

export interface TrackingDetails {
  id: number;
  shipment_id: number;
  awb: string;
  status_type: string;
  status: string;
  status_code: string;
  parcelace_status: string | null;
  parcelace_additional_status: string | null;
  status_time: string;
  location: string;
  instructions: string;
  instruction_slug: string;
  geo_location: string | null;
}

export interface TrackingPageMenu {
  left_menu_1?: string;
  left_menu_2?: string;
  left_menu_3?: string;
  right_menu_1?: string;
  right_menu_2?: string;
  right_menu_3?: string;
  url: string;
}

export interface TrackingPageHeader {
  show_logo: boolean;
  menu_items: TrackingPageMenu[];
  sticky_header: boolean;
  sticky_header_text: string;
  button_label: string;
  button_link: string;
  button_color: string;
  show_support_email_phone: boolean;
}

export interface TrackingPageNPSSection {
  show_nps_section: boolean;
  show_delivery_feedback_section: boolean;
}

export interface TrackingPageFooter {
  show_support_email_phone: boolean;
  show_social_icons: boolean;
  sticky_footer: boolean;
  sticky_footer_text: string;
  button_label: string;
  button_link: string;
  button_color: string;
}

export interface TrackingPageVideo {
  title: string;
  description: string;
  youtube_url: string;
}

export interface TrackingPageVideoContent {
  show_video: boolean;
  videos: TrackingPageVideo[];
}

export interface TrackingPageYouTube {
  text_H1: string;
  text_H2: string;
  youtube_link: string;
}

export interface TrackingPageProduct {
  product_name: string;
  price: number;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
}

export interface TrackingPageProductShowcase {
  show_products: boolean;
  products: TrackingPageProduct[];
}

export interface TrackingPageBanner {
  title: string;
  description: string;
  link_url: string;
  banner_image: string;
}

export interface TrackingPageBannerCampaigns {
  show_banners: boolean;
  banners: TrackingPageBanner[];
}

export interface TrackingPageRewardsPromotions {
  offers: any[];
}

export interface TrackingPageConfig {
  track_ace_status: Array<{
    is_active: boolean;
  }>;
  browser_settings: Array<{
    page_title: string;
    favicon_url: string;
  }>;
  header_section: TrackingPageHeader[];
  nps_section: TrackingPageNPSSection[];
  footer_section: TrackingPageFooter[];
  product_showcase: TrackingPageProductShowcase[];
  banner_campaigns: TrackingPageBannerCampaigns[];
  video_content: TrackingPageVideoContent[];
  rewards_promotions: TrackingPageRewardsPromotions[];
}

export interface TrackingResponse {
  status: boolean;
  message: string;
  data: {
    order_details: TrackingOrderDetails;
    customer_details: TrackingCustomerDetails;
    product_details: TrackingProductDetails[];
    warehouse_details: TrackingWarehouseDetails;
    trakings_details: TrackingDetails[];
    tracking_page: TrackingPageConfig;
  };
  error: string | null;
}

export class TrackingService {
  /**
   * Fetch tracking information by AWB number
   * @param awb - The AWB number to track
   * @returns Promise<TrackingResponse>
   */
  static async getTrackingByAWB(awb: string): Promise<TrackingResponse> {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.TRACKING}/${awb}`, 'GET');
      
      if (response.success && response.data) {
        return {
          status: true,
          message: response.message || 'Tracking data retrieved successfully',
          data: response.data,
          error: null
        };
      } else {
        return {
          status: false,
          message: response.message || 'Failed to fetch tracking data',
          data: response.data,
          error: response.error || 'Unknown error occurred'
        };
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      return {
        status: false,
        message: 'Network error occurred',
        data: response.data,
        error: 'Failed to connect to tracking service'
      };
    }
  }

  /**
   * Format tracking status for display
   * @param status - The tracking status
   * @returns Formatted status string
   */
  static formatTrackingStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Get status color based on tracking status
   * @param status - The tracking status
   * @returns CSS color class
   */
  static getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered') || statusLower.includes('completed')) {
      return 'text-green-600';
    } else if (statusLower.includes('in transit') || statusLower.includes('picked')) {
      return 'text-blue-600';
    } else if (statusLower.includes('cancelled') || statusLower.includes('rto')) {
      return 'text-red-600';
    } else if (statusLower.includes('pending') || statusLower.includes('manifested')) {
      return 'text-yellow-600';
    } else {
      return 'text-gray-600';
    }
  }

  /**
   * Get status badge color based on tracking status
   * @param status - The tracking status
   * @returns Badge color class
   */
  static getStatusBadgeColor(status: string): string {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered') || statusLower.includes('completed')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower.includes('in transit') || statusLower.includes('picked')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (statusLower.includes('cancelled') || statusLower.includes('rto')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (statusLower.includes('pending') || statusLower.includes('manifested')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Format date string for display
   * @param dateString - The date string to format
   * @returns Formatted date string
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Get delivery partner logo/icon
   * @param partner - The delivery partner name
   * @returns Partner icon or name
   */
  static getDeliveryPartnerIcon(partner: string): string {
    const partnerLower = partner.toLowerCase();
    
    if (partnerLower.includes('delhivery')) {
      return '🚚'; // Delhivery truck emoji
    } else if (partnerLower.includes('bluedart')) {
      return '📦'; // Blue Dart package emoji
    } else if (partnerLower.includes('fedex')) {
      return '✈️'; // FedEx plane emoji
    } else if (partnerLower.includes('dhl')) {
      return '🌍'; // DHL globe emoji
    } else {
      return '📋'; // Generic package emoji
    }
  }
}

export default TrackingService;
