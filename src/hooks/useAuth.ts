import { useState, useEffect } from 'react';

interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  auth_token: string;
  access_token: string;
  shop: string;
  is_kyc_verified: number;
  is_onboarding_filled: boolean;
  [key: string]: any;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    
    setLoading(false);
  }, []);

  const login = (userData: UserData, token: string) => {
    localStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };
}; 