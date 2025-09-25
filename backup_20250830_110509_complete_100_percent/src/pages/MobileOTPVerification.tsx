import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileOTPVerification from '@/components/MobileOTPVerification';
import { useUser } from '@/contexts/UserContext';

const MobileOTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  const { phone, authToken } = location.state || {};

  const handleNavigateBack = () => {
    navigate('/signup');
  };

  const handleVerificationSuccess = () => {
    // After mobile OTP verification, check if onboarding is needed
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    // Check if there's a redirect destination stored
    const redirectTo = sessionStorage.getItem('redirectAfterLogin');
    if (redirectTo) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
      return;
    }
    
    if (userData.is_onboarding_filled) {
      // Onboarding already completed, go to dashboard
      navigate('/dashboard/orders/prepaid');
    } else {
      // Navigate to onboarding wizard
      navigate('/onboarding/wizard');
    }
  };

  return (
    <MobileOTPVerification
      onNavigateBack={handleNavigateBack}
      onVerificationSuccess={handleVerificationSuccess}
      phone={phone}
      authToken={authToken}
    />
  );
};

export default MobileOTPVerificationPage; 