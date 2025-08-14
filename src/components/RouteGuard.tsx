import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requireAuth = true, 
  requireOnboarding = false 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { isInitialized } = useUser(); // Add UserContext initialization check
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // CRITICAL: Wait for both useAuth and UserContext to be ready
    if (loading || !isInitialized) {
      console.log('🔄 RouteGuard: Waiting for initialization...', { loading, isInitialized });
      return;
    }

    const checkAccess = () => {
      console.log('🔄 RouteGuard: Checking access for:', location.pathname);
      console.log('🔄 RouteGuard: Auth state:', { isAuthenticated, user: !!user, loading, requireAuth, requireOnboarding, isInitialized });
      
      // If authentication is not required, allow access
      if (!requireAuth) {
        console.log('✅ RouteGuard: No auth required, allowing access');
        setIsChecking(false);
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('❌ RouteGuard: User not authenticated, redirecting to login');
        console.log('❌ RouteGuard: Current auth state:', { isAuthenticated, user, isInitialized });
        // Store the intended destination for after login
        sessionStorage.setItem('redirectAfterLogin', location.pathname);
        navigate('/login', { replace: true });
        return;
      }

      // Check mobile verification
      if (!user.mobile_verified_at) {
        console.log('⚠️ RouteGuard: Mobile not verified, redirecting to OTP verification');
        navigate('/mobile-otp-verification', { 
          state: { 
            phone: user.phone, 
            authToken: user.auth_token,
            redirectTo: location.pathname 
          },
          replace: true 
        });
        return;
      }

      // Check onboarding completion if required
      if (requireOnboarding && !user.is_onboarding_filled) {
        console.log('⚠️ RouteGuard: Onboarding not completed, redirecting to wizard');
        navigate('/onboarding/wizard', { 
          state: { redirectTo: location.pathname },
          replace: true 
        });
        return;
      }

      // All checks passed
      console.log('✅ RouteGuard: All checks passed, allowing access');
      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, user, loading, requireAuth, requireOnboarding, navigate, location.pathname, isInitialized]);

  // Show loading spinner while checking authentication or waiting for initialization
  if (loading || isChecking || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isInitialized ? 'Initializing application...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // If we get here, user has access
  return <>{children}</>;
};

export default RouteGuard; 