import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import API_CONFIG, { handleSessionExpiry } from '../config/api';

interface UserData {
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
  // Add other fields as needed
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
  updateWalletBalance: () => Promise<void>;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Load user data from session storage on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    const savedUserData = sessionStorage.getItem('user_data');
    const savedBalance = sessionStorage.getItem('walletBalance');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('Loaded user data from session:', userData);
      } catch (error) {
        console.error('Error parsing user data from session:', error);
      }
    } else if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        setUser(userData);
        console.log('Loaded user data from user_data session:', userData);
      } catch (error) {
        console.error('Error parsing user_data from session:', error);
      }
    }
    
    if (savedBalance) {
      setWalletBalance(parseInt(savedBalance));
    }
    
    // Only fetch wallet balance if we have a user
    if (savedUser || savedUserData) {
      updateWalletBalance();
    }
  }, []);

  // Save user data to session storage when it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user]);

  // Save wallet balance to session storage when it changes
  useEffect(() => {
    sessionStorage.setItem('walletBalance', walletBalance.toString());
  }, [walletBalance]);

  const updateWalletBalance = useCallback(async () => {
    try {
      // Get auth token from multiple sources
      let authToken = user?.auth_token || user?.access_token;
      if (!authToken) {
        authToken = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      }
      if (!authToken) {
        authToken = sessionStorage.getItem('auth_token') || sessionStorage.getItem('access_token');
      }
      if (!authToken) {
        // Check user_data
        const userData = sessionStorage.getItem('user_data');
        if (userData) {
          try {
            const userDataObj = JSON.parse(userData);
            authToken = userDataObj.auth_token || userDataObj.access_token;
          } catch (error) {
            console.error('Error parsing user_data:', error);
          }
        }
      }
      
      if (!authToken) {
        console.log('No auth token available for wallet balance update');
        return;
      }

      // Use the correct API endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}api/wallet`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      // Check for session expiry
      if (response.status === 401 || 
          data.message === 'Session expired' || 
          data.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (data.status === false && data.message === 'Session expired')) {
        console.log('🔒 Session expired detected in UserContext.updateWalletBalance');
        handleSessionExpiry();
        return;
      }
      
      if (response.ok) {
        console.log('Wallet balance API response:', data);
        
        if (data.status && data.data && data.data.balance !== undefined) {
          setWalletBalance(data.data.balance);
          // Also update session storage
          sessionStorage.setItem('walletBalance', data.data.balance.toString());
        } else {
          console.error('Invalid wallet response format:', data);
        }
      } else {
        console.error('Failed to fetch wallet balance:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  }, [user?.auth_token]);

  const clearUserData = useCallback(() => {
    console.log('Clearing UserContext data...');
    setUser(null);
    setWalletBalance(0);
    
    // Clear context-specific storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('walletBalance');
  }, []);

  const value = {
    user,
    setUser,
    walletBalance,
    setWalletBalance,
    updateWalletBalance,
    clearUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 