import API_CONFIG from '@/config/api';

// Types for tracking page customization
export interface BrowserSettings {
  page_title: string;
  favicon_url: string;
}

export interface HeaderSection {
  show_logo: boolean;
  sticky_header: boolean;
  sticky_header_text: string;
  button_label: string;
  button_link: string;
  button_color: string;
  show_support_email_phone: boolean;
  left_menu_1: string;
  left_menu_2: string;
  left_menu_3: string;
  right_menu_4: string;
  right_menu_5: string;
  right_menu_6: string;
  privacy_policy_url: string;
}

export interface NPSSection {
  show_nps_section: boolean;
  show_delivery_feedback_section: boolean;
}

export interface FooterSection {
  show_support_email_phone: boolean;
  show_social_icons: boolean;
  sticky_footer: boolean;
  sticky_footer_text: string;
  button_label: string;
  button_link: string;
  button_color: string;
  left_menu_1: string;
  left_menu_2: string;
  left_menu_3: string;
  right_menu_4: string;
  right_menu_5: string;
  right_menu_6: string;
  privacy_policy_url: string;
}

export interface TrackAceStatus {
  is_active: boolean;
}

export interface ProductShowcase {
  show_products: boolean;
  products: Product[];
}

export interface Product {
  id: string;
  product_name: string;
  description: string;
  price: number;
  image_url: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
}

export interface BannerCampaigns {
  show_banners: boolean;
  banners: Banner[];
}

export interface Banner {
  id: string;
  banner_image: string;
  title: string;
  description: string;
  link_url: string;
  is_active: boolean;
}

export interface VideoContent {
  show_video: boolean;
  videos: Video[];
}

export interface Video {
  id: string;
  youtube_url: string;
  title: string;
  description: string;
  is_active: boolean;
}

export interface RewardsPromotions {
  offers: Reward[];
}

export interface Reward {
  id: string;
  promo_code: string;
  expiry_date: string;
  popup_title: string;
  popup_subtitle: string;
  minimum_order_value: number;
  maximum_discount_value: number;
  conditions_1: string;
  conditions_2: string;
  conditions_3: string;
  conditions_4: string;
  is_active: boolean;
}

export interface SupportSocial {
  support_links: SupportLink[];
}

export interface SupportLink {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
}

export interface TrackingPageMeta {
  track_ace_status: TrackAceStatus[];
  browser_settings: BrowserSettings[];
  header_section: HeaderSection[];
  nps_section: NPSSection[];
  footer_section: FooterSection[];
  product_showcase: ProductShowcase[];
  banner_campaigns: BannerCampaigns[];
  video_content: VideoContent[];
  rewards_promotions: RewardsPromotions[];
  support_social: SupportSocial[];
}

export interface UserMetaRequest {
  widget_type: string;
  meta_key: string;
  meta_value: any[];
}

export interface UserMetaResponse {
  status: boolean;
  message: string;
  data: any[];
}

class TrackingCustomizationService {
  private getAuthToken(): string | null {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Fetch tracking page customization data
  async fetchTrackingPageCustomization(): Promise<TrackingPageMeta | null> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const requestData: UserMetaRequest[] = [
        { "widget_type": "tracking_page", "meta_key": "track_ace_status" },
        { "widget_type": "tracking_page", "meta_key": "browser_settings" },
        { "widget_type": "tracking_page", "meta_key": "header_section" },
        { "widget_type": "tracking_page", "meta_key": "nps_section" },
        { "widget_type": "tracking_page", "meta_key": "footer_section" },
        { "widget_type": "tracking_page", "meta_key": "product_showcase" },
        { "widget_type": "tracking_page", "meta_key": "banner_campaigns" },
        { "widget_type": "tracking_page", "meta_key": "video_content" },
        { "widget_type": "tracking_page", "meta_key": "rewards_promotions" },
        { "widget_type": "support_social", "meta_key": "support_links" }
      ];

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_USER_META}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status && result.data) {
        // Process and merge the data
        const trackingPageData: TrackingPageMeta = {
          track_ace_status: [],
          browser_settings: [],
          header_section: [],
          nps_section: [],
          footer_section: [],
          product_showcase: [],
          banner_campaigns: [],
          video_content: [],
          rewards_promotions: [],
          support_social: []
        };

        // Debug logging
        console.log('🔍 API Response Data:', result.data);

        result.data.forEach((item: any) => {
          console.log('🔍 Processing item:', item);
          
          // Handle tracking_page data
          if (item.tracking_page) {
            if (item.tracking_page.track_ace_status) {
              trackingPageData.track_ace_status = item.tracking_page.track_ace_status;
            }
            if (item.tracking_page.browser_settings) {
              trackingPageData.browser_settings = item.tracking_page.browser_settings;
            }
            if (item.tracking_page.header_section) {
              trackingPageData.header_section = item.tracking_page.header_section;
            }
            if (item.tracking_page.nps_section) {
              trackingPageData.nps_section = item.tracking_page.nps_section;
            }
            if (item.tracking_page.footer_section) {
              trackingPageData.footer_section = item.tracking_page.footer_section;
            }
            if (item.tracking_page.product_showcase) {
              trackingPageData.product_showcase = item.tracking_page.product_showcase;
            }
            if (item.tracking_page.banner_campaigns) {
              trackingPageData.banner_campaigns = item.tracking_page.banner_campaigns;
            }
            if (item.tracking_page.video_content) {
              trackingPageData.video_content = item.tracking_page.video_content;
            }
            if (item.tracking_page.rewards_promotions) {
              trackingPageData.rewards_promotions = item.tracking_page.rewards_promotions;
            }
          }
          
          // Handle support_social data
          if (item.support_social && item.support_social.support_links) {
            trackingPageData.support_social = [{ support_links: item.support_social.support_links }];
          }
        });

        return trackingPageData;
      }

      return null;
    } catch (error) {
      console.error('Error fetching tracking page customization:', error);
      throw error;
    }
  }

  // Update tracking page customization data
  async updateTrackingPageCustomization(data: Partial<TrackingPageMeta>): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const requestData: UserMetaRequest[] = [];

      // Add track ace status if provided
      if (data.track_ace_status) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "track_ace_status",
          meta_value: data.track_ace_status
        });
      }

      // Add browser settings if provided
      if (data.browser_settings) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "browser_settings",
          meta_value: data.browser_settings
        });
      }

      // Add header section if provided
      if (data.header_section) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "header_section",
          meta_value: data.header_section
        });
      }

      // Add NPS section if provided
      if (data.nps_section) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "nps_section",
          meta_value: data.nps_section
        });
      }

      // Add footer section if provided
      if (data.footer_section) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "footer_section",
          meta_value: data.footer_section
        });
      }

      // Add product showcase if provided
      if (data.product_showcase) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "product_showcase",
          meta_value: data.product_showcase
        });
      }

      // Add banner campaigns if provided
      if (data.banner_campaigns) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "banner_campaigns",
          meta_value: data.banner_campaigns
        });
      }

      // Add video content if provided
      if (data.video_content) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "video_content",
          meta_value: data.video_content
        });
      }

      // Add rewards promotions if provided
      if (data.rewards_promotions) {
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "rewards_promotions",
          meta_value: data.rewards_promotions
        });
      }

      // Add support social if provided
      if (data.support_social) {
        requestData.push({
          widget_type: "support_social",
          meta_key: "support_links",
          meta_value: data.support_social[0]?.support_links || []
        });
      }

      if (requestData.length === 0) {
        throw new Error('No data provided for update');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER_META}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return result.status === true;
    } catch (error) {
      console.error('Error updating tracking page customization:', error);
      throw error;
    }
  }

  // Get default values for tracking page customization
  getDefaultValues(): TrackingPageMeta {
    return {
      track_ace_status: [{
        is_active: true
      }],
      browser_settings: [{
        page_title: "Track Your Package - ParcelAce",
        favicon_url: "uploads/favicon/parcelace.png"
      }],
      header_section: [{
        show_logo: true,
        sticky_header: true,
        sticky_header_text: "Enter sticky header text",
        button_label: "Shop Now",
        button_link: "https://example.com",
        button_color: "#3832f6",
        show_support_email_phone: true,
        left_menu_1: "https://www.google.com/men",
        left_menu_2: "https://www.google.com/women",
        left_menu_3: "https://www.google.com/about",
        right_menu_4: "https://www.google.com/contact",
        right_menu_5: "https://www.google.com/help",
        right_menu_6: "https://www.google.com/support",
        privacy_policy_url: "https://www.google.com/privacy"
      }],
      nps_section: [{
        show_nps_section: true,
        show_delivery_feedback_section: true
      }],
      footer_section: [{
        show_support_email_phone: true,
        show_social_icons: true,
        sticky_footer: true,
        sticky_footer_text: "Enter sticky footer text",
        button_label: "Shop Now",
        button_link: "https://example.com",
        button_color: "#3832f6",
        left_menu_1: "https://www.google.com/men",
        left_menu_2: "https://www.google.com/women",
        left_menu_3: "https://www.google.com/about",
        right_menu_4: "https://www.google.com/contact",
        right_menu_5: "https://www.google.com/help",
        right_menu_6: "https://www.google.com/support",
        privacy_policy_url: "https://www.google.com/privacy"
      }],
      product_showcase: [{
        show_products: false,
        products: []
      }],
      banner_campaigns: [{
        show_banners: false,
        banners: []
      }],
      video_content: [{
        show_video: false,
        videos: []
      }],
      rewards_promotions: [{
        offers: []
      }],
      support_social: [{
        support_links: []
      }]
    };
  }
}

export default new TrackingCustomizationService();
