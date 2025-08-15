import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';

const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { isSessionValid, isInitialized } = useUser();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">🔐 Auth Debug</div>
      <div className="space-y-1">
        <div>useAuth.loading: {loading ? '🔄' : '✅'}</div>
        <div>useAuth.isAuthenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>useAuth.user: {user ? `✅ (${user.id})` : '❌'}</div>
        <div>UserContext.isInitialized: {isInitialized ? '✅' : '🔄'}</div>
        <div>UserContext.isSessionValid: {isSessionValid ? '✅' : '❌'}</div>
        <div>UserContext.user: {user ? `✅ (${user.id})` : '❌'}</div>
      </div>
      <div className="mt-2 pt-2 border-t border-white/20">
        <div className="text-xs opacity-75">
          {!isInitialized && '🔄 Waiting for UserContext...'}
          {isInitialized && !isAuthenticated && '❌ Not authenticated'}
          {isInitialized && isAuthenticated && '✅ Authenticated'}
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
