
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';

type AuthScreen = 'login' | 'signup';

const AuthNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');

  const handleNavigateToSignUp = () => setCurrentScreen('signup');
  const handleNavigateToLogin = () => setCurrentScreen('login');
  const handleNavigateBack = () => {
    // This could navigate to a welcome screen or previous flow
    console.log('Navigate back');
  };

  if (currentScreen === 'signup') {
    return (
      <SignUpScreen 
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateBack={handleNavigateBack}
      />
    );
  }

  return (
    <LoginScreen 
      onNavigateToSignUp={handleNavigateToSignUp}
      onNavigateBack={handleNavigateBack}
    />
  );
};

export default AuthNavigator;
