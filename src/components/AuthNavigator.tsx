
import React, { useState, useCallback } from 'react';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import OTPPage from './OTPPage';
import OTPVerificationScreen from './OTPVerificationScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import MobileOTPVerification from './MobileOTPVerification';
import OnboardingWizard from './OnboardingWizard';
import { useNavigate } from 'react-router-dom';

// Add a new state for the OTP email and token

type AuthScreen = 'login' | 'signup' | 'forgot-password' | 'otp-verification' | 'mobile-otp-verification' | 'reset-password' | 'onboarding';

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

  const handleNavigateToOnboarding = () => {
    navigate('/dashboard/orders');
  };

  const handleMobileOTPSuccess = () => {
    // After mobile OTP verification, check if onboarding is needed
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData.is_onboarding_filled) {
      // Onboarding already completed, go to dashboard
      navigate('/dashboard/orders');
    } else {
      // Navigate to onboarding wizard
      setCurrentScreen('onboarding');
    }
  };

  const handleOnboardingComplete = useCallback(() => {
    console.log('handleOnboardingComplete called');
    // After onboarding completion, navigate to dashboard
    navigate('/dashboard/orders');
  }, [navigate]);

  const handleSignUpSuccess = (phone?: string, token?: string) => {
    // After successful signup, store auth token and navigate to mobile OTP verification
    if (token) {
      setAuthToken(token);
    }
    handleNavigateToMobileOTP(phone);
  };

  switch (currentScreen) {
    case 'signup':
      return (
        <SignUpScreen 
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateBack={handleNavigateBack}
          onNavigateToOnboarding={handleSignUpSuccess}
        />
      );
    
    case 'forgot-password':
      return (
        <ForgotPasswordScreen
          onNavigateBack={handleNavigateBack}
          onNavigateToOTP={handleNavigateToOTP}
        />
      );
    
    case 'otp-verification':
      return (
        <OTPPage
          email={otpEmail}
          onBack={handleNavigateBack}
          onSuccess={handleNavigateToResetPassword}
        />
      );
    
    case 'mobile-otp-verification':
      return (
        <MobileOTPVerification
          onNavigateBack={handleNavigateBack}
          onVerificationSuccess={handleMobileOTPSuccess}
          phone={userPhone}
          authToken={authToken}
        />
      );
    
    case 'reset-password':
      return (
        <ResetPasswordScreen
          onNavigateBack={handleNavigateBack}
          onPasswordReset={handlePasswordReset}
        />
      );
    
    case 'onboarding':
      console.log('Rendering OnboardingWizard with props:', {
        onComplete: handleOnboardingComplete,
        onNavigateBack: handleNavigateBack
      });
      return (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onNavigateBack={handleNavigateBack}
        />
      );
    
    default:
      return (
        <LoginScreen 
          onNavigateToSignUp={handleNavigateToSignUp}
          onNavigateToForgotPassword={handleNavigateToForgotPassword}
          onNavigateBack={handleNavigateBack}
          onNavigateToOnboarding={handleNavigateToOnboarding}
        />
      );
  }
};

export default AuthNavigator;
