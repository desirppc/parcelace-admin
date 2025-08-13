import React from 'react';
import RouteGuard from './RouteGuard';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  return (
    <RouteGuard requireAuth={false}>
      {children}
    </RouteGuard>
  );
};

export default PublicRoute;
