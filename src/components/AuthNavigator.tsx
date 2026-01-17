
import React, { useState, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';

// Lazy load all auth components
const LoginScreen = lazy(() => import('./LoginScreen'));
const SignUpScreen = lazy(() => import('./SignUpScreen'));
const ForgotPasswordScreen = lazy(() => import('./ForgotPasswordScreen'));
const OTPPage = lazy(() => import('./OTPPage'));
const OTPVerificationScreen = lazy(() => import('./OTPVerificationScreen'));
const ResetPasswordScreen = lazy(() => import('./ResetPasswordScreen'));
const MobileOTPVerification = lazy(() => import('./MobileOTPVerification'));

// Loading component for Suspense fallback
const AuthLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Add a new state for the OTP email and token

type AuthScreen = 'login' | 'signup' | 'forgot-password' | 'otp-verification' | 'mobile-otp-verification' | 'reset-password';

interface AuthNavigatorProps {
  initialScreen?: AuthScreen;
}

const AuthNavigator = ({ initialScreen = 'login' }: AuthNavigatorProps) => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(initialScreen);
  const [userEmail, setUserEmail] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [authToken, setAuthToken] = useState('');
  const navigate = useNavigate();

  const handleNavigateToSignUp = () => setCurrentScreen('signup');
  const handleNavigateToLogin = () => setCurrentScreen('login');
  const handleNavigateToForgotPassword = () => setCurrentScreen('forgot-password');
  const handleNavigateToOTP = (email?: string) => {
    if (email) setOtpEmail(email);
    setCurrentScreen('otp-verification');
  };
  const handleNavigateToMobileOTP = (phone?: string) => {
    if (phone) setUserPhone(phone);
    setCurrentScreen('mobile-otp-verification');
  };
  const handleNavigateToResetPassword = (token?: string) => {
    if (token) setOtpToken(token);
    setCurrentScreen('reset-password');
  };
  const handleNavigateBack = useCallback(() => {
    // Navigate to previous screen or default to login
    if (currentScreen === 'otp-verification' || currentScreen === 'reset-password') {
      setCurrentScreen('forgot-password');
    } else if (currentScreen === 'mobile-otp-verification') {
      setCurrentScreen('signup');
    } else if (currentScreen === 'forgot-password') {
      setCurrentScreen('login');
    } else {
      setCurrentScreen('login');
    }
  }, [currentScreen]);

  const handlePasswordReset = () => {
    // Handle successful password reset - navigate to dashboard
    setCurrentScreen('login'); // Redirect to login after successful reset
  };

  const handleMobileOTPSuccess = () => {
    // After mobile OTP verification, always redirect to dashboard
    navigate('/dashboard/prepaid-shipments');
  };

  const handleSignUpSuccess = (phone?: string, token?: string) => {
    // After successful signup, store auth token and navigate to mobile OTP verification
    if (token) {
      setAuthToken(token);
    }
    handleNavigateToMobileOTP(phone);
  };

  const handleNavigateToOnboarding = () => {
    // After successful login, navigate to dashboard (onboarding is handled separately if needed)
    navigate('/dashboard/prepaid-shipments');
  };

  switch (currentScreen) {
    case 'signup':
      return (
        <Suspense fallback={<AuthLoader />}>
          <SignUpScreen 
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateBack={handleNavigateBack}
            onNavigateToOnboarding={handleSignUpSuccess}
          />
        </Suspense>
      );
    
    case 'forgot-password':
      return (
        <Suspense fallback={<AuthLoader />}>
          <ForgotPasswordScreen
            onNavigateBack={handleNavigateBack}
            onNavigateToOTP={handleNavigateToOTP}
          />
        </Suspense>
      );
    
    case 'otp-verification':
      return (
        <Suspense fallback={<AuthLoader />}>
          <OTPPage
            email={otpEmail}
            onBack={handleNavigateBack}
            onSuccess={handleNavigateToResetPassword}
          />
        </Suspense>
      );
    
    case 'mobile-otp-verification':
      return (
        <Suspense fallback={<AuthLoader />}>
          <MobileOTPVerification
            onNavigateBack={handleNavigateBack}
            onVerificationSuccess={handleMobileOTPSuccess}
            phone={userPhone}
            authToken={authToken}
          />
        </Suspense>
      );
    
    case 'reset-password':
      return (
        <Suspense fallback={<AuthLoader />}>
          <ResetPasswordScreen
            onNavigateBack={handleNavigateBack}
            onPasswordReset={handlePasswordReset}
          />
        </Suspense>
      );
    
    default:
      return (
        <Suspense fallback={<AuthLoader />}>
          <LoginScreen 
            onNavigateToSignUp={handleNavigateToSignUp}
            onNavigateToForgotPassword={handleNavigateToForgotPassword}
            onNavigateBack={handleNavigateBack}
            onNavigateToOnboarding={handleNavigateToOnboarding}
          />
        </Suspense>
      );
  }
};

export default AuthNavigator;
