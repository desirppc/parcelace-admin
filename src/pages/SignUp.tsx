import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpScreen from '@/components/SignUpScreen';

const SignUp = () => {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateBack = () => {
    navigate('/login');
  };

  const handleNavigateToOnboarding = (phone?: string, token?: string) => {
    // Navigate to mobile OTP verification with the phone and token
    navigate('/mobile-otp-verification', { 
      state: { 
        phone, 
        authToken: token,
        redirectTo: '/dashboard/orders' 
      } 
    });
  };

  return (
    <SignUpScreen 
      onNavigateToLogin={handleNavigateToLogin}
      onNavigateBack={handleNavigateBack}
      onNavigateToOnboarding={handleNavigateToOnboarding}
    />
  );
};

export default SignUp;
