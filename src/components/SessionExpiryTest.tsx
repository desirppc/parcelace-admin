import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { handleSessionExpiry } from '@/config/api';

/**
 * Test component to verify session expiry handling
 * This component can be temporarily added to test the auto-logout functionality
 */
const SessionExpiryTest: React.FC = () => {
  const simulateSessionExpiry = () => {
    console.log('🧪 Simulating session expiry...');
    handleSessionExpiry();
  };

  const simulateApiResponseWithSessionExpired = () => {
    console.log('🧪 Simulating API response with session expired message...');
    
    // Simulate the exact response format you mentioned
    const mockResponse = {
      status: "false",
      message: "Session expired",
      data: null,
      error: {
        message: "Your session has expired. Please log in again to continue."
      }
    };
    
    console.log('Mock response:', mockResponse);
    
    // Dispatch the session expired event
    window.dispatchEvent(new CustomEvent('sessionExpired'));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Session Expiry Test</CardTitle>
        <CardDescription>
          Test the auto-logout functionality when session expires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={simulateSessionExpiry}
          variant="destructive"
          className="w-full"
        >
          Simulate Session Expiry (Direct)
        </Button>
        
        <Button 
          onClick={simulateApiResponseWithSessionExpired}
          variant="destructive"
          className="w-full"
        >
          Simulate API Response with Session Expired
        </Button>
        
        <div className="text-sm text-gray-600">
          <p>These buttons will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Clear all authentication data</li>
            <li>Dispatch session expired event</li>
            <li>Redirect to login page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionExpiryTest;
