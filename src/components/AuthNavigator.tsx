
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import OTPVerificationScreen from './OTPVerificationScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import OnboardingLayout from './OnboardingLayout';
import OnboardingContent from './OnboardingContent';

type AuthScreen = 'login' | 'signup' | 'forgot-password' | 'otp-verification' | 'reset-password' | 'onboarding';

const AuthNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [userEmail, setUserEmail] = useState('');

  const handleNavigateToSignUp = () => setCurrentScreen('signup');
  const handleNavigateToLogin = () => setCurrentScreen('login');
  const handleNavigateToForgotPassword = () => setCurrentScreen('forgot-password');
  const handleNavigateToOTP = () => setCurrentScreen('otp-verification');
  const handleNavigateToResetPassword = () => setCurrentScreen('reset-password');
  const handleNavigateToOnboarding = () => setCurrentScreen('onboarding');
  
  const handleNavigateBack = () => {
    // Navigate to previous screen or default to login
    if (currentScreen === 'otp-verification' || currentScreen === 'reset-password') {
      setCurrentScreen('forgot-password');
    } else if (currentScreen === 'forgot-password') {
      setCurrentScreen('login');
    } else {
      setCurrentScreen('login');
    }
  };

  const handlePasswordReset = () => {
    // Handle successful password reset - navigate back to login
    setCurrentScreen('login');
  };

  switch (currentScreen) {
    case 'signup':
      return (
        <SignUpScreen 
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateBack={handleNavigateBack}
          onNavigateToOnboarding={handleNavigateToOnboarding}
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
        <OTPVerificationScreen
          onNavigateBack={handleNavigateBack}
          onNavigateToReset={handleNavigateToResetPassword}
          email={userEmail}
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
      return (
        <OnboardingLayout>
          <OnboardingContent activeMenuItem="onboarding" />
        </OnboardingLayout>
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
