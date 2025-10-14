// User data management utilities

import API_CONFIG from '@/config/api';

export interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  auth_token: string;
  access_token: string;
  shop: string;
  is_kyc_verified: number;
  is_onboarding_filled: boolean;
  mobile_verified_at: string | null;
  email_verified_at: string | null;
  phone_whatsapp_verified_at: string | null;
  monthly_order: string;
  sales_platform: string;
  current_vendor: string;
  primary_goal: string;
  return_service: string;
  waba_service: string;
  comment: string;
  user_role: string;
  [key: string]: any;
}

export const refreshUserDataFromAPI = async (): Promise<UserData | null> => {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (!token) {
      console.log('No auth token available for user data refresh');
      return null;
    }

    // Fetch fresh user data from API
    const response = await fetch(`${API_CONFIG.BASE_URL}api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.status && data.data) {
        const userData = data.data;
        
        // Update all storage locations with fresh data
        localStorage.setItem('user_data', JSON.stringify(userData));
        sessionStorage.setItem('user_data', JSON.stringify(userData));
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        console.log('User data refreshed from API:', userData);
        return userData;
      }
    } else {
      console.error('Failed to refresh user data:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error refreshing user data:', error);
  }
  
  return null;
};

export const refreshWalletBalanceFromAPI = async (): Promise<number | null> => {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (!token) {
      console.log('No auth token available for wallet balance refresh');
      return null;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}api/wallet`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.status && data.data && data.data.balance !== undefined) {
        const balance = data.data.balance;
        
        // Update storage with fresh balance
        localStorage.setItem('walletBalance', balance.toString());
        sessionStorage.setItem('walletBalance', balance.toString());
        
        console.log('Wallet balance refreshed from API:', balance);
        return balance;
      }
    } else {
      console.error('Failed to refresh wallet balance:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error refreshing wallet balance:', error);
  }
  
  return null;
};

export const invalidateUserCache = (): void => {
  console.log('Invalidating user data cache...');
  
  // Remove cached user data to force fresh fetch
  localStorage.removeItem('user_data');
  sessionStorage.removeItem('user_data');
  sessionStorage.removeItem('user');
  localStorage.removeItem('walletBalance');
  sessionStorage.removeItem('walletBalance');
  
  // Clear any cached API responses
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('user') || name.includes('wallet') || name.includes('api')) {
          caches.delete(name);
        }
      });
    });
  }
  
  console.log('User data cache invalidated');
};

export const forceUserDataRefresh = async (): Promise<void> => {
  console.log('Forcing user data refresh...');
  
  // Invalidate cache first
  invalidateUserCache();
  
  // Refresh user data from API
  const userData = await refreshUserDataFromAPI();
  if (userData) {
    // Refresh wallet balance
    await refreshWalletBalanceFromAPI();
    
    // Trigger a custom event to notify components
    window.dispatchEvent(new CustomEvent('userDataRefreshed', { 
      detail: { userData } 
    }));
    
    console.log('User data refresh completed');
  }
};
