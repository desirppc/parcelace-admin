import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import API_CONFIG from '../config/api';
import { setupSessionRefresh, setupSessionWarning, setupActivityMonitoring, setupPageVisibilityMonitoring, restoreSessionFromStorage, shouldAttemptSessionRestore } from '@/utils/authUtils';

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
  validateSession: () => Promise<boolean>;
  isSessionValid: boolean;
  isInitialized: boolean; // Add initialization flag
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
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Add initialization flag

  // Validate session with the server
  const validateSession = useCallback(async (): Promise<boolean> => {
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
        console.log('No auth token available for session validation');
        // Don't set session as invalid here, just return false
        // The calling code will handle this gracefully
        return false;
      }

      // Validate session with the server
      const response = await fetch(`${API_CONFIG.BASE_URL}api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Session validation successful:', data);
        
        if (data.status && data.data) {
          // Update user data with fresh data from server
          const freshUserData = {
            ...user,
            ...data.data,
            auth_token: authToken,
            access_token: authToken
          };
          setUser(freshUserData);
          
          // Update session storage with fresh data
          sessionStorage.setItem('user', JSON.stringify(freshUserData));
          sessionStorage.setItem('user_data', JSON.stringify(freshUserData));
          localStorage.setItem('user_data', JSON.stringify(freshUserData));
          
          setIsSessionValid(true);
          return true;
        } else {
          console.error('Invalid session validation response format:', data);
          // Don't invalidate session for malformed responses
          return false;
        }
      } else if (response.status === 401) {
        console.error('Session validation failed: Unauthorized (401)');
        // Only invalidate session for actual auth failures
        setIsSessionValid(false);
        return false;
      } else {
        console.error('Session validation failed:', response.status, response.statusText);
        // For other errors (network, server issues), don't invalidate session
        return false;
      }
    } catch (error) {
      console.error('Error validating session:', error);
      // For network errors, don't invalidate session
      return false;
    }
  }, [user]);

  // Load user data from session storage on mount - CRITICAL: This must run first
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔄 UserContext: Starting session restoration...');
      
      const savedUser = sessionStorage.getItem('user');
      const savedUserData = sessionStorage.getItem('user_data');
      const savedBalance = sessionStorage.getItem('walletBalance');
      
      // First, try to restore session from storage without server validation
      if (shouldAttemptSessionRestore()) {
        const restored = restoreSessionFromStorage();
        if (restored) {
          console.log('✅ UserContext: Session restored from storage successfully');
          setIsSessionValid(true);
        }
      }
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log('✅ UserContext: Loaded user data from session:', userData);
          
          // Set session as valid initially to prevent immediate logout
          setIsSessionValid(true);
          
          // Try to validate with server, but don't fail if it doesn't work
          try {
            await validateSession();
          } catch (error) {
            console.log('⚠️ UserContext: Server validation failed, but keeping local session:', error);
            // Keep the session valid even if server validation fails
            // This prevents logout on network issues or temporary server problems
          }
        } catch (error) {
          console.error('❌ UserContext: Error parsing user data from session:', error);
          // Don't invalidate session for parsing errors, try to continue
        }
      } else if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          setUser(userData);
          console.log('✅ UserContext: Loaded user data from user_data session:', userData);
          
          // Set session as valid initially to prevent immediate logout
          setIsSessionValid(true);
          
          // Try to validate with server, but don't fail if it doesn't work
          try {
            await validateSession();
          } catch (error) {
            console.log('⚠️ UserContext: Server validation failed, but keeping local session:', error);
            // Keep the session valid even if server validation fails
          }
        } catch (error) {
          console.error('❌ UserContext: Error parsing user_data from session:', error);
          // Don't invalidate session for parsing errors, try to continue
        }
      }
      
      if (savedBalance) {
        setWalletBalance(parseInt(savedBalance));
      }
      
      // Mark as initialized so other components know UserContext is ready
      setIsInitialized(true);
      console.log('✅ UserContext: Initialization complete, session state:', { 
        hasUser: !!user, 
        isSessionValid, 
        isInitialized: true 
      });
    };

    loadUserData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Setup session refresh when user is authenticated
  useEffect(() => {
    let cleanupSessionRefresh: (() => void) | undefined;
    let cleanupActivityMonitoring: (() => void) | undefined;
    let cleanupPageVisibility: (() => void) | undefined;

    if (isSessionValid && user && isInitialized) {
      console.log('Setting up session refresh for authenticated user');
      cleanupSessionRefresh = setupSessionRefresh();
      
      console.log('Setting up activity monitoring for authenticated user');
      cleanupActivityMonitoring = setupActivityMonitoring();
      
      console.log('Setting up page visibility monitoring for authenticated user');
      cleanupPageVisibility = setupPageVisibilityMonitoring();
    }

    return () => {
      if (cleanupSessionRefresh) {
        console.log('Cleaning up session refresh');
        cleanupSessionRefresh();
      }
      if (cleanupActivityMonitoring) {
        console.log('Cleaning up activity monitoring');
        cleanupActivityMonitoring();
      }
      if (cleanupPageVisibility) {
        console.log('Cleaning up page visibility monitoring');
        cleanupPageVisibility();
      }
    };
  }, [isSessionValid, user, isInitialized]);

  // Setup session warning when user is authenticated
  useEffect(() => {
    let cleanupSessionWarning: (() => void) | undefined;

    if (isSessionValid && user && isInitialized) {
      console.log('Setting up session warning for authenticated user');
      cleanupSessionWarning = setupSessionWarning(() => {
        console.log('Session warning triggered');
        // The SessionWarning component will handle the UI notification
      });
    }

    return () => {
      if (cleanupSessionWarning) {
        console.log('Cleaning up session warning');
        cleanupSessionWarning();
      }
    };
  }, [isSessionValid, user, isInitialized]);

  // Also fetch wallet balance from API on mount if session is valid and initialized
  useEffect(() => {
    if (isSessionValid && isInitialized) {
      updateWalletBalance();
    }
  }, [isSessionValid, isInitialized]);

  // Save user data to session storage when it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('user_data', JSON.stringify(user));
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('user_data');
      localStorage.removeItem('user_data');
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
      
      if (response.ok) {
        const data = await response.json();
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
    setIsSessionValid(false);
    
    // Clear context-specific storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('walletBalance');
    localStorage.removeItem('user_data');
  }, []);

  const value = {
    user,
    setUser,
    walletBalance,
    setWalletBalance,
    updateWalletBalance,
    clearUserData,
    validateSession,
    isSessionValid,
    isInitialized, // Add to context value
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 