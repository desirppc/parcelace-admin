import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';
import { getStoredToken, getStoredUserData } from '@/utils/authUtils';

const AuthDebug = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { user: contextUser } = useUser();
  
  const storedToken = getStoredToken();
  const storedUserData = getStoredUserData();

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="font-bold text-sm mb-2">🔐 Auth Debug Info</h3>
      <div className="text-xs space-y-1">
        <div><strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</div>
        <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
        <div><strong>User ID:</strong> {user?.id || 'None'}</div>
        <div><strong>Stored Token:</strong> {storedToken ? `✅ ${storedToken.substring(0, 10)}...` : '❌ None'}</div>
        <div><strong>Stored User:</strong> {storedUserData ? `✅ ID: ${storedUserData.id}` : '❌ None'}</div>
        <div><strong>Local Storage:</strong> {localStorage.getItem('auth_token') ? '✅ Has token' : '❌ No token'}</div>
        <div><strong>Session Storage:</strong> {sessionStorage.getItem('auth_token') ? '✅ Has token' : '❌ No token'}</div>
        <div><strong>Current Path:</strong> {window.location.pathname}</div>
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
      >
        🔄 Reload
      </button>
    </div>
  );
};

export default AuthDebug;
