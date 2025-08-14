
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthNavigator from '@/components/AuthNavigator';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isUserAuthenticated, isMobileVerified, isOnboardingCompleted, getSessionInfo } from '@/utils/authUtils';

const Index = () => {
  const [searchParams] = useSearchParams();
  const screen = searchParams.get('screen') as 'login' | 'signup' | undefined;
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Index.tsx - Auth state changed:', {
      isAuthenticated,
      user: !!user,
      loading,
      isRedirecting,
      sessionInfo: getSessionInfo()
    });
  }, [isAuthenticated, user, loading, isRedirecting]);

  useEffect(() => {
    // Only check authentication if not already loading
    if (!loading) {
      // Check if user is authenticated using both context and utility functions
      const hasValidSession = isAuthenticated || isUserAuthenticated();
      
      console.log('Index.tsx - Checking authentication:', {
        isAuthenticated,
        isUserAuthenticated: isUserAuthenticated(),
        hasValidSession,
        isRedirecting
      });
      
      if (hasValidSession && !isRedirecting) {
        console.log('User has valid session, checking verification status...');
        setIsRedirecting(true);
        
        // Check if mobile is verified
        const mobileVerified = user?.mobile_verified_at || isMobileVerified();
        
        if (!mobileVerified) {
          console.log('Mobile not verified, redirecting to OTP verification');
          navigate('/mobile-otp-verification', { 
            state: { 
              phone: user?.phone, 
              authToken: user?.auth_token,
              redirectTo: '/dashboard/orders' 
            },
            replace: true 
          });
          return;
        }
        
        // Check if onboarding is completed
        const onboardingCompleted = user?.is_onboarding_filled || isOnboardingCompleted();
        
        if (!onboardingCompleted) {
          console.log('Onboarding not completed, redirecting to wizard');
          navigate('/onboarding/wizard', { 
            state: { redirectTo: '/dashboard/orders' },
            replace: true 
          });
          return;
        }
        
        // All checks passed, redirect to dashboard
        console.log('All checks passed, redirecting to dashboard');
        navigate('/dashboard/orders', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate, isRedirecting]);

  // Show loading while checking authentication
  if (loading) {
    console.log('Index.tsx - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and we're redirecting, show loading
  if ((isAuthenticated || isUserAuthenticated()) && isRedirecting) {
    console.log('Index.tsx - Showing redirecting state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but not redirecting yet, show loading
  if (isAuthenticated || isUserAuthenticated()) {
    console.log('Index.tsx - User authenticated, preparing redirect');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing redirect...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show the auth navigator
  console.log('Index.tsx - User not authenticated, showing login');
  return <AuthNavigator initialScreen={screen || 'login'} />;
};

export default Index;
