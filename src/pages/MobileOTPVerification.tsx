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
    // After mobile OTP verification, always redirect to dashboard
    const redirectTo = sessionStorage.getItem('redirectAfterLogin');
    if (redirectTo) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
    } else {
      navigate('/dashboard/orders/prepaid');
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