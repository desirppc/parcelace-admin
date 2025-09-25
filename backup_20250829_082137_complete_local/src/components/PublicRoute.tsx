import React from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  // Simplified PublicRoute - let the child components handle their own authentication logic
  // This prevents conflicts between Index.tsx and PublicRoute.tsx
  return <>{children}</>;
};

export default PublicRoute;
