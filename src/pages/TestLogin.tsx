import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import API_CONFIG from '@/config/api';

const TestLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const { toast } = useToast();

  const handleTestLogin = async () => {
    setIsLoading(true);
    setResponse('');

    try {
      const loginUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`;
      console.log('Making API call to:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      setResponse(JSON.stringify(data, null, 2));

      if (response.ok && data.status) {
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.data?.name || 'User'}!`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: data?.message || "API call failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setResponse(`Error: ${error}`);
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Test Login</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>
          
          <Button 
            onClick={handleTestLogin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Login'}
          </Button>
        </div>
        
        {response && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">API Response:</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestLogin; 