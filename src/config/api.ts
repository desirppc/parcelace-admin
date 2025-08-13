const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://app.parcelace.io/',
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
    
    // Shipments
    SHIPMENTS: 'api/shipments/list',
    SHIPMENT_DETAILS: 'api/shipments/details',
    CREATE_SHIPMENT: 'api/shipments/create',
    UPDATE_SHIPMENT: 'api/shipments/update',
    DELETE_SHIPMENT: 'api/shipments/delete',
    SHIPMENT_LABEL: 'api/shipments/label',
    SHIPMENT_EXPORT: 'api/shipments/export',
    SHIPMENT_TRACKING: 'api/shipments/tracking',
    
    // Wallet & Finance
    WALLET: 'api/wallet',
    WALLET_BALANCE: 'api/wallet/balance',
    WALLET_TRANSACTIONS: 'api/wallet/transactions',
    WALLET_RECHARGE: 'api/wallet/recharge',
    
    // Support & Tickets
    SUPPORT: 'api/support',
    TICKETS: 'api/support/tickets',
    CREATE_TICKET: 'api/support/tickets/create',
    TICKET_DETAILS: 'api/support/tickets/details',
    TICKET_REPLY: 'api/support/tickets/reply',
    
    // Notifications
    NOTIFICATIONS: 'api/notifications',
    NOTIFICATIONS_MARK_READ: 'api/notifications/mark-read',
    
    // KYC & Verification
    KYC_VERIFICATION: 'api/kyc/verify',
    KYC_STATUS: 'api/kyc/status',
    
    // Warehouse & Locations
    WAREHOUSE: 'api/warehouse',
    WAREHOUSE_LIST: 'api/warehouse/list',
    WAREHOUSE_DETAILS: 'api/warehouse/details',
    
    // Courier Partners
    COURIER_PARTNERS: 'api/courier-partners',
    COURIER_SELECTION: 'api/courier-selection',
    
    // Analytics & Reports
    ANALYTICS: 'api/analytics',
    REPORTS: 'api/reports',
    EXPORT_REPORTS: 'api/reports/export',
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
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('API Config Debug:', {
    BASE_URL: API_CONFIG.BASE_URL,
    endpoint,
    fullUrl,
    VITE_API_URL: import.meta.env.VITE_API_URL
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
    
    return {
      success: response.ok,
      data: result.data,
      message: result.message,
      status: response.status,
      error: !response.ok ? result.error || 'Request failed' : null
    };
  } catch (error) {
    console.error(`API Request Error (${method} ${endpoint}):`, error);
    return {
      success: false,
      error: 'Network error occurred',
      status: 0
    };
  }
};

export default API_CONFIG; 