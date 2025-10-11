import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserAuthenticated, clearAuthData, forceHardRefresh, clearAllAppData } from '@/utils/authUtils';
import { useUser } from '@/contexts/UserContext';
import { refreshUserDataFromAPI, refreshWalletBalanceFromAPI, invalidateUserCache } from '@/utils/userDataUtils';

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
  [key: string]: any;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { clearUserData } = useUser();

  // Check if user is authenticated
  const checkAuthStatus = useCallback(async () => {

    setLoading(true);
    
    try {
      console.log('🔄 useAuth: Starting authentication check...');
      
      // First check local storage for quick validation
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data') || sessionStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // Basic validation - ensure user has required fields
          if (parsedUser.id && parsedUser.auth_token) {
            console.log('✅ useAuth: Found valid user data in storage:', parsedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            // Don't wait for server validation to show authenticated state
            // This prevents the login page from showing while validating
            setLoading(false);
            
            // Session validation removed - keeping local state for now
            
            return;
          } else {
            console.log('❌ useAuth: User data missing required fields');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('❌ useAuth: Error parsing user data:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ useAuth: No auth data found in storage');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ useAuth: Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies that no longer exist

  // Check auth status on mount
  useEffect(() => {
    console.log('✅ useAuth: Checking auth status...');
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Listen for session expiry events
  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      console.log('🔒 useAuth: Received session expired event');
      handleSessionExpiry();
    };

    window.addEventListener('sessionExpired', handleSessionExpiredEvent);
    
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpiredEvent);
    };
  }, []);

  // Update authentication state when UserContext changes
  useEffect(() => {
    // This will be handled by the UserContext directly
  }, []);

  const login = (userData: UserData, token: string) => {
    console.log('Logging in user with fresh data:', userData);
    
    // Clear any existing cached data first to ensure fresh start
    clearAuthData();
    
    // Store fresh data in both localStorage and sessionStorage for redundancy
    localStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    sessionStorage.setItem('user_data', JSON.stringify(userData));
    
    // Also store in the format expected by UserContext
    sessionStorage.setItem('user', JSON.stringify(userData));
    
    // Update local state
    setUser(userData);
    setIsAuthenticated(true);
    
    // Force refresh of user data and wallet balance from API to ensure latest data
    setTimeout(async () => {
      try {
        await refreshUserDataFromAPI();
        await refreshWalletBalanceFromAPI();
        console.log('Fresh user data and wallet balance fetched from API');
      } catch (error) {
        console.error('Error refreshing data from API:', error);
      }
    }, 100);
    
    console.log('User login successful, all data updated');
  };

  const logout = () => {
    console.log('Logging out user and clearing all cached data...');
    
    // Clear UserContext data first
    clearUserData();
    
    // Clear all auth data using utility function
    clearAllAppData();
    
    // Reset local state
    setUser(null);
    setIsAuthenticated(false);
    
    // Force a hard refresh to ensure no stale data remains
    forceHardRefresh();
  };

  const updateUser = (userData: UserData) => {
    setUser(userData);
    // Update stored data
    localStorage.setItem('user_data', JSON.stringify(userData));
    sessionStorage.setItem('user_data', JSON.stringify(userData));
  };

  const refreshAuth = () => {
    return checkAuthStatus();
  };

  const forceRefreshUserData = async () => {
    console.log('Force refreshing user data...');
    
    // Invalidate cache first
    invalidateUserCache();
    
    // Refresh from API
    const freshUserData = await refreshUserDataFromAPI();
    if (freshUserData) {
      setUser(freshUserData);
      setIsAuthenticated(true);
      console.log('User data force refreshed successfully');
      return true;
    }
    
    return false;
  };

  // Handle session expiry - called by session expiry handlers
  const handleSessionExpiry = () => {
    console.log('🔒 useAuth: Session expiry detected, logging out user');
    
    // Clear UserContext data first
    clearUserData();
    
    // Clear all auth data using utility function
    clearAllAppData();
    
    // Reset local state
    setUser(null);
    setIsAuthenticated(false);
    
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser,
    refreshAuth,
    checkAuthStatus,
    forceRefreshUserData,
    handleSessionExpiry
  };
}; 