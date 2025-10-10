import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import profileService from '@/services/profileService';

const ProfileTest = () => {
  const [authToken, setAuthToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testProfileDashboard = async () => {
    if (!authToken.trim()) {
      setError('Please enter an auth token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Temporarily set the token in localStorage for the service to use
      localStorage.setItem('auth_token', authToken);
      
      const response = await profileService.getProfileDashboard();
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Dashboard API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="authToken">Auth Token</Label>
            <Input
              id="authToken"
              type="text"
              placeholder="Enter your Bearer token"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={testProfileDashboard} 
            disabled={isLoading || !authToken.trim()}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Profile Dashboard API'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium">Success!</p>
              <pre className="text-sm text-green-700 mt-2 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">API Details:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Method: GET</li>
              <li>• Endpoint: /api/profile-dashboard</li>
              <li>• Base URL: {window.location.origin}/</li>
              <li>• Full URL: {window.location.origin}/api/profile-dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTest;
