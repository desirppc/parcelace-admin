import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpScreen from '@/components/SignUpScreen';
import { useUser } from '@/contexts/UserContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateBack = () => {
    navigate('/');
  };

  const handleNavigateToOnboarding = (phone?: string, token?: string) => {
    // After successful signup, navigate to mobile OTP verification
    if (token) {
      localStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_token', token);
    }
    navigate('/mobile-otp-verification', { 
      state: { 
        phone, 
        authToken: token 
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