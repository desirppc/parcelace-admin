import React from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  // Since authentication is removed, just render children directly
  return <>{children}</>;
};

export default RouteGuard; 