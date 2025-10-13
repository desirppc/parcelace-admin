import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionInfo, getStoredToken, getStoredUserData } from '@/utils/authUtils';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';

const SessionDebug: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState(getSessionInfo());
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated, user, loading } = useAuth();
  const { isSessionValid } = useUser();

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionInfo(getSessionInfo());
    }, 10000); // Changed from 1000ms to 10000ms (10 seconds)

    return () => clearInterval(interval);
  }, []);

  const refreshSessionInfo = () => {
    setSessionInfo(getSessionInfo());
  };

  const clearAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    refreshSessionInfo();
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50"
      >
        Debug Session
      </Button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-h-screen overflow-y-auto">
      <Card className="bg-white dark:bg-gray-900 border-2 border-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Session Debug Info
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Auth State */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Auth State</h4>
            <div className="text-xs space-y-1">
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>isAuthenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
              <div>isSessionValid: {isSessionValid ? 'Yes' : 'No'}</div>
              <div>User: {user ? `ID: ${user.id}` : 'None'}</div>
            </div>
          </div>

          {/* Session Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Session Info</h4>
            <div className="text-xs space-y-1">
              <div>Has Token: {sessionInfo.hasToken ? 'Yes' : 'No'}</div>
              <div>Has User Data: {sessionInfo.hasUserData ? 'Yes' : 'No'}</div>
              <div>Is Authenticated: {sessionInfo.isAuthenticated ? 'Yes' : 'No'}</div>
              <div>Token Length: {sessionInfo.tokenLength}</div>
              <div>User ID: {sessionInfo.userId || 'None'}</div>
              <div>Session Age: {sessionInfo.sessionAgeMinutes} minutes</div>
            </div>
          </div>

          {/* Storage Contents */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Storage Contents</h4>
            <div className="text-xs space-y-1">
              <div>localStorage auth_token: {localStorage.getItem('auth_token') ? 'Exists' : 'None'}</div>
              <div>sessionStorage auth_token: {sessionStorage.getItem('auth_token') ? 'Exists' : 'None'}</div>
              <div>localStorage user_data: {localStorage.getItem('user_data') ? 'Exists' : 'None'}</div>
              <div>sessionStorage user_data: {sessionStorage.getItem('user_data') ? 'Exists' : 'None'}</div>
              <div>sessionStorage user: {sessionStorage.getItem('user') ? 'Exists' : 'None'}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Actions</h4>
            <div className="flex space-x-2">
              <Button
                onClick={refreshSessionInfo}
                size="sm"
                className="text-xs"
              >
                Refresh
              </Button>
              <Button
                onClick={clearAllData}
                size="sm"
                variant="destructive"
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Raw Data */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Raw Data</h4>
            <details className="text-xs">
              <summary>Token</summary>
              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                {getStoredToken() || 'None'}
              </pre>
            </details>
            <details className="text-xs">
              <summary>User Data</summary>
              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                {JSON.stringify(getStoredUserData(), null, 2) || 'None'}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionDebug;
