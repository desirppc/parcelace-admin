import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // Get user data from session storage instead of context to avoid re-render issues
  const getUserData = useCallback(() => {
    try {
      const savedUser = sessionStorage.getItem('user_data') || sessionStorage.getItem('user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }, []);

  const checkAuth = useCallback(() => {
    // Check if user is authenticated
    const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    
    if (!authToken) {
      console.log('No auth token found, redirecting to login');
      navigate('/login');
      setIsLoading(false);
      return;
    }

    // Get user data from session storage
    const user = getUserData();
    
    if (user) {
      console.log('RouteGuard - User data:', {
        name: user.name,
        mobile_verified_at: user.mobile_verified_at,
        is_onboarding_filled: user.is_onboarding_filled,
        is_kyc_verified: user.is_kyc_verified
      });

      // Check mobile verification
      if (!user.mobile_verified_at) {
        console.log('Mobile not verified, should stay on login/OTP flow');
        // Don't redirect - let the existing OTP flow handle this
        setIsLoading(false);
        return;
      }

      // Check onboarding completion
      if (!user.is_onboarding_filled) {
        console.log('Onboarding not filled, redirecting to wizard');
        navigate('/onboarding/wizard');
        setIsLoading(false);
        return;
      }
    }

    console.log('RouteGuard - All checks passed');
    setIsLoading(false);
  }, [navigate, getUserData]);

  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
      setHasCheckedAuth(true);
    }
  }, [checkAuth, hasCheckedAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard; 