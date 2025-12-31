import { ENVIRONMENT } from './environment';
import { clearAllDataExceptPasswords } from '@/utils/clearAllData';

// Centralized session expiry handler
const handleSessionExpiry = () => {
  console.log('🔒 Handling session expiry - clearing all data and redirecting');
  
  // Clear all application data except password refills
  clearAllDataExceptPasswords();
  
  // Dispatch a custom event to notify React components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sessionExpired'));
  }
  
  // Show session expired notification
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    // Only redirect if not already on login page
    console.log('🔄 Redirecting to login page due to session expiry');
    window.location.href = '/login';
  }
};

const API_CONFIG = {
  // Note: BASE_URL is now retrieved dynamically in getApiUrl() to ensure it's always current
  // Keeping this for backward compatibility, but getApiUrl() uses ENVIRONMENT.getCurrentApiUrl() directly
  BASE_URL: ENVIRONMENT.getCurrentApiUrl(),
  ENDPOINTS: {
    // Authentication
    LOGIN: 'api/login',
    REGISTER: 'api/register',
    FORGOT_PASSWORD: 'api/forgot-password',
    FORGOT_PASSWORD_VERIFY: 'api/forgot-password/verify',
    RESET_PASSWORD: 'api/forgot-password/reset',
    VERIFY_OTP: 'api/verify-otp',
    VERIFY_MOBILE_OTP: 'api/verify-mobile-otp',
    SEND_OTP: 'api/send-otp',
    RESEND_OTP: 'api/resend-otp',
    
    // User & Profile
    USER_PROFILE: 'api/user/profile',
    UPDATE_PROFILE: 'api/user/profile',
    PROFILE_DASHBOARD: 'api/profile-dashboard',
    
    // Onboarding
    ONBOARDING: 'api/onboarding',
    ONBOARDING_STATUS: 'api/onboarding/status',
    
    // Orders
    ORDERS: 'api/order',
    ORDERS_LIST: 'api/order/list',
    ORDER_DETAILS: 'api/order/details',
    CREATE_ORDER: 'api/order/create',
    UPDATE_ORDER: 'api/order/update',
    EDIT_ORDER: 'api/order/edit',
    DELETE_ORDER: 'api/order/delete',
    ORDER_EXPORT: 'api/order/export',
    ORDER_IMPORT: 'api/order/import-bulk-order',
    
    // Shipments
    SHIPMENTS: 'api/shipments/list',
    SHIPMENT_DETAILS: 'api/shipments/details',
    CREATE_SHIPMENT: 'api/shipments/create',
    UPDATE_SHIPMENT: 'api/shipments/update',
    DELETE_SHIPMENT: 'api/shipments/delete',
    SHIPMENT_CANCEL: 'api/shipments/bulk-cancel',
    SHIPMENT_LABEL: 'api/shipments/label',
    BULK_SHIPMENT_LABELS: 'api/shipments/bulk-shipment-labels',
    BULK_SHIPMENT_INVOICE: 'api/shipments/bulk-shipment-invoice',
    SHIPMENT_EXPORT: 'api/shipments/export',
    SHIPMENT_TRACKING: 'api/shipments/tracking',
    SHIPMENT_FEEDBACK: 'api/shipments/feedback-list',
    SHIPMENT_FEEDBACK_VIEW: 'api/shipments/feedback-view',
    AWB_SEARCH: 'api/shipments/awb-search',
    UPDATE_REMARKS: 'api/shipment/update-remarks',
    UPDATE_EWAY_BILL: 'api/shipments/update-eway-bill',
    PICKUP_REQUEST: 'api/shipments/pickup-request',
    
    // Bulk Booking
    BULK_BOOKING_REQUEST: 'api/shipments/bulk-booking-request',
    GET_BULK_BOOKING_RATES: 'api/shipments/get-bulk-booking-rates',
    BULK_BOOKING_CREATE: 'api/shipments/bulk-booking',
    

    
    // Wallet & Finance
    WALLET: 'api/wallet',
    WALLET_BALANCE: 'api/wallet/balance',
    WALLET_TRANSACTIONS: 'api/wallet/transactions',
    WALLET_RECHARGE: 'api/wallet/recharge',
    COD_REMITTANCE: 'api/cod-remittance',
    COD_REMITTANCE_FILTER: 'api/cod-remittances/filter',
    COD_PLANS_LIST: 'api/cod-plans/list',
    COD_PLANS_INSERT: 'api/cod-plans/insert',
    COD_PLANS_DELETE: 'api/cod-plans/delete',
    
    // Notifications
    NOTIFICATIONS: 'api/notifications',
    NOTIFICATIONS_MARK_READ: 'api/notifications/mark-read',
    
    // KYC & Verification
    KYC_VERIFICATION: 'api/kyc/verify',
    KYC_STATUS: 'api/kyc/status',
    
    // Courier Partners
    COURIER_PARTNERS: 'api/courier-partners',
    COURIER_SELECTION: 'api/courier-selection',
    COURIER_PRIORITY: 'api/courier-priority',
    
    // Analytics & Reports
    ANALYTICS: 'api/analytics',
    REPORTS: 'api/reports',
    EXPORT_REPORTS: 'api/reports/export',
    
    // NPS & Feedback
    NPS: 'dashboard/postship/nps',
    FEEDBACK_RATE_US: 'api/feedback/rate-us',
    FEEDBACK_NPS: 'api/feedback/nps',
    
    // Tracking
    TRACKING: 'api/tracking',
    TRACKING_SEND_OTP: 'api/tracking/send-otp',
    TRACKING_VERIFY_OTP: 'api/tracking/verify-otp',
    
    // Brand Details
    GET_USER_META: 'api/get-user-meta',
    UPDATE_USER_META: 'api/user-meta',
    IMAGE_UPLOAD: 'api/image-upload',
    
    // Support Users
    SUPPORT_USERS: 'api/support-user',
    
    // Manage User
    MANAGE_USER_SHIPMENT_FILTER: 'api/manage-user/shipment-filter',
    
    // Vendors
    VENDORS: 'api/support-user/vendor',
    ASSIGN_VENDORS: 'api/support-user/assign',
    VENDOR_POC: 'api/vendor-poc',
    
    // Support Tickets
    SUPPORT_TICKETS: 'api/support-ticket',
    SUPPORT_TICKET_ASSIGN: 'api/support-user/ticket-assign',
    SUPPORT_TICKET_UPDATE_STATUS: 'api/support-ticket/update-status',
    
    // Email Responses
    // (No email APIs available)
    
    // Gmail OAuth
    GMAIL_OAUTH_INIT: 'api/gmail/oauth/init',
    GMAIL_OAUTH_CALLBACK: 'api/gmail/oauth/callback',
    GMAIL_CONNECTIONS: 'api/gmail/connections',
    
    // Shipping Label Settings
    SHIPPING_LABEL_SETTINGS: 'api/shipping-label-settings',
    SHIPPING_LABEL_SETTINGS_UPDATE: 'api/shipping-label-settings/update',
    SHIPPING_LABEL_BRAND_LOGO: 'api/shipping-label-settings/brand-logo',
    
    // Warehouse FE
    WAREHOUSE_FE: 'api/warehouse-fe',
  },
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Helper function to get API URL with endpoint
export const getApiUrl = (endpoint: string): string => {
  // Always get the current API URL dynamically to ensure it's up to date
  const baseUrl = ENVIRONMENT.getCurrentApiUrl();
  
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Ensure baseUrl ends with / and construct full URL
  const fullUrl = `${baseUrl}${cleanEndpoint}`;
  
  // Always log API URL construction for debugging (can be removed in production if needed)
  console.log('🔗 API URL Construction:', {
    BASE_URL: baseUrl,
      endpoint,
    cleanEndpoint,
      fullUrl,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A'
    });
  
  return fullUrl;
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const authToken = token || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  return {
    ...API_CONFIG.HEADERS,
    'Authorization': `Bearer ${authToken}`,
  };
};

// Helper function to make API requests
export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data?: any,
  customHeaders?: Record<string, string>
) => {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
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
    
    // Enhanced logging in development
    if (ENVIRONMENT.isDevelopment()) {
      console.log(`🌐 API Request (${method} ${endpoint}):`, {
        url,
        status: response.status,
        ok: response.ok,
        result
      });
    }
    
    // Handle session expired (401 Unauthorized) globally
    if (response.status === 401) {
      console.log('🔒 Session expired - auto-logging out user (401 status)');
      handleSessionExpiry();
      
      return {
        success: false,
        data: null,
        message: 'Session expired. Please login again.',
        status: 401,
        error: 'Session expired'
      };
    }

    // Handle session expired message in response body (even with 200 status)
    if (result && (
      result.message === 'Session expired' || 
      result.error?.message === 'Your session has expired. Please log in again to continue.' ||
      (result.status === 'false' && result.message === 'Session expired')
    )) {
      console.log('🔒 Session expired - auto-logging out user (message in response)');
      handleSessionExpiry();
      
      return {
        success: false,
        data: null,
        message: 'Session expired. Please login again.',
        status: 401,
        error: 'Session expired'
      };
    }
    
    return {
      success: response.ok,
      data: result.data,
      message: result.message,
      status: response.status,
      error: !response.ok ? result.error || 'Request failed' : null
    };
  } catch (error) {
    console.error(`❌ API Request Error (${method} ${endpoint}):`, error);
    return {
      success: false,
      error: 'Network error occurred',
      status: 0
    };
  }
};

// Export the session expiry handler for use in direct fetch calls
export { handleSessionExpiry };

export default API_CONFIG; 