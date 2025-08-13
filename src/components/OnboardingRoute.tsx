import React from 'react';
import RouteGuard from './RouteGuard';

interface OnboardingRouteProps {
  children: React.ReactNode;
}

const OnboardingRoute: React.FC<OnboardingRouteProps> = ({ children }) => {
  return (
    <RouteGuard requireAuth={true} requireOnboarding={true}>
      {children}
    </RouteGuard>
  );
};

export default OnboardingRoute;
