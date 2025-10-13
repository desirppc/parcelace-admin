import API_CONFIG, { handleSessionExpiry } from '@/config/api';

// Types for tracking page customization
export interface BrowserSettings {
  page_title: string;
  favicon_url: string;
}

export interface MenuItem {
  [key: string]: string; // e.g., "left_menu_1": "Men", "url": "https://www.google.com/men"
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
  menu_items?: MenuItem[];
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

      const result = await response.json();
      
      // Check for session expiry
      if (response.status === 401 || 
          result.message === 'Session expired' || 
          result.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (result.status === 'false' && result.message === 'Session expired')) {
        console.log('🔒 Session expired detected in TrackingCustomizationService.fetchTrackingPageCustomization');
        handleSessionExpiry();
        throw new Error(result.error?.message || 'Session expired');
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
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

      console.log('🔍 Starting API update with data:', data);
      const requestData: UserMetaRequest[] = [];

      // Add browser settings if provided
      if (data.browser_settings) {
        console.log('🔍 Processing browser_settings:', data.browser_settings);
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "browser_settings",
          meta_value: data.browser_settings
        });
      }

      // Add header section if provided
      if (data.header_section) {
        console.log('🔍 Processing header_section:', data.header_section);
        // Clean header data to match API structure exactly
        const cleanedHeaderSection = data.header_section.map(item => ({
          show_logo: item.show_logo,
          menu_items: item.menu_items || [],
          sticky_header: item.sticky_header,
          sticky_header_text: item.sticky_header_text,
          button_label: item.button_label,
          button_link: item.button_link,
          button_color: item.button_color,
          show_support_email_phone: item.show_support_email_phone
        }));
        console.log('🔍 Cleaned header_section:', cleanedHeaderSection);
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "header_section",
          meta_value: cleanedHeaderSection
        });
      }

      // Add NPS section if provided
      if (data.nps_section) {
        console.log('🔍 Processing nps_section:', data.nps_section);
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "nps_section",
          meta_value: data.nps_section
        });
      }

      // Add footer section if provided
      if (data.footer_section) {
        console.log('🔍 Processing footer_section:', data.footer_section);
        // Clean footer data to match API structure exactly
        const cleanedFooterSection = data.footer_section.map(item => ({
          show_support_email_phone: item.show_support_email_phone,
          show_social_icons: item.show_social_icons,
          sticky_footer: item.sticky_footer,
          sticky_footer_text: item.sticky_footer_text,
          button_label: item.button_label,
          button_link: item.button_link,
          button_color: item.button_color
        }));
        console.log('🔍 Cleaned footer_section:', cleanedFooterSection);
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "footer_section",
          meta_value: cleanedFooterSection
        });
      }

      // Add product showcase if provided
      if (data.product_showcase) {
        console.log('🔍 Processing product_showcase:', data.product_showcase);
        // Clean product data to match API structure exactly
        const cleanedProductShowcase = data.product_showcase.map(item => ({
          show_products: item.show_products,
          products: item.products.map(product => ({
            product_name: product.product_name,
            price: product.price,
            description: product.description,
            button_text: product.button_text,
            button_link: product.button_link,
            image_url: product.image_url
          }))
        }));
        console.log('🔍 Cleaned product_showcase:', cleanedProductShowcase);
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "product_showcase",
          meta_value: cleanedProductShowcase
        });
      }

      // Add banner campaigns if provided
      if (data.banner_campaigns) {
        console.log('🔍 Processing banner_campaigns:', data.banner_campaigns);
        // Clean banner data to match API structure exactly
        const cleanedBannerCampaigns = data.banner_campaigns.map(item => ({
          show_banners: item.show_banners,
          banners: item.banners.map(banner => ({
            title: banner.title,
            description: banner.description,
            link_url: banner.link_url,
            banner_image: banner.banner_image
          }))
        }));
        console.log('🔍 Cleaned banner_campaigns:', cleanedBannerCampaigns);
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "banner_campaigns",
          meta_value: cleanedBannerCampaigns
        });
      }

      // Add video content if provided
      if (data.video_content) {
        console.log('🔍 Processing video_content:', data.video_content);
        // Clean video data to match API structure exactly
        const cleanedVideoContent = data.video_content.map(item => ({
          show_video: item.show_video,
          videos: item.videos.map(video => ({
            title: video.title,
            description: video.description,
            youtube_url: video.youtube_url
          }))
        }));
        console.log('🔍 Cleaned video_content:', cleanedVideoContent);
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "video_content",
          meta_value: cleanedVideoContent
        });
      }

      // Add rewards promotions if provided
      if (data.rewards_promotions) {
        console.log('🔍 Processing rewards_promotions:', data.rewards_promotions);
        // Clean rewards data to match API structure exactly
        const cleanedRewardsPromotions = data.rewards_promotions.map(item => ({
          offers: item.offers.map(offer => ({
            promo_code: offer.promo_code,
            expiry_date: offer.expiry_date,
            popup_title: offer.popup_title,
            popup_subtitle: offer.popup_subtitle,
            minimum_order_value: offer.minimum_order_value,
            maximum_discount_value: offer.maximum_discount_value,
            conditions_1: offer.conditions_1,
            conditions_2: offer.conditions_2,
            conditions_3: offer.conditions_3,
            conditions_4: offer.conditions_4
          }))
        }));
        console.log('🔍 Cleaned rewards_promotions:', cleanedRewardsPromotions);
        requestData.push({
          widget_type: "tracking_page",
          meta_key: "rewards_promotions",
          meta_value: cleanedRewardsPromotions
        });
      }

      if (requestData.length === 0) {
        throw new Error('No data provided for update');
      }

      console.log('🔍 Final request data:', requestData);
      console.log('🔍 Request data JSON:', JSON.stringify(requestData, null, 2));
      console.log('🔍 API URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER_META}`);
      console.log('🔍 Headers:', this.getHeaders());

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER_META}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('🔍 Response result:', result);
      
      // Check for session expiry
      if (response.status === 401 || 
          result.message === 'Session expired' || 
          result.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (result.status === 'false' && result.message === 'Session expired')) {
        console.log('🔒 Session expired detected in TrackingCustomizationService.updateTrackingPageCustomization');
        handleSessionExpiry();
        throw new Error(result.error?.message || 'Session expired');
      }

      if (!response.ok) {
        console.error('❌ API request failed with status:', response.status);
        console.error('❌ Response body:', result);
        
        if (response.status === 500) {
          console.error('❌ Server Error (500) - Check server logs for details');
          console.error('❌ Request that caused 500 error:', JSON.stringify(requestData, null, 2));
        }
        
        throw new Error(`API request failed: ${response.status} - ${result.message || result.error?.message || 'Unknown error'}`);
      }

      console.log('✅ API request successful');
      return result.status === true;
    } catch (error) {
      console.error('❌ Error updating tracking page customization:', error);
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
        left_menu_1: "",
        left_menu_2: "",
        left_menu_3: "",
        right_menu_4: "",
        right_menu_5: "",
        right_menu_6: "",
        privacy_policy_url: "https://www.google.com/privacy",
        menu_items: [
          {"left_menu_1": "Men", "url": "https://www.google.com/men"},
          {"left_menu_2": "Women", "url": "https://www.google.com/women"},
          {"left_menu_3": "About", "url": "https://www.google.com/about"},
          {"right_menu_4": "Contact", "url": "https://www.google.com/contact"},
          {"right_menu_5": "Help", "url": "https://www.google.com/help"},
          {"right_menu_6": "Support", "url": "https://www.google.com/support"}
        ]
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
