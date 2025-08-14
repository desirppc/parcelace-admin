import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import API_CONFIG from '@/config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('parcelace_saved_email');
    const savedPassword = localStorage.getItem('parcelace_saved_password');
    const savedRemember = localStorage.getItem('parcelace_remember_credentials');
    
    if (savedEmail && savedPassword && savedRemember === 'true') {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberCredentials(true);
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Save credentials if remember is checked
    if (rememberCredentials) {
      localStorage.setItem('parcelace_saved_email', email);
      localStorage.setItem('parcelace_saved_password', password);
      localStorage.setItem('parcelace_remember_credentials', 'true');
    } else {
      // Clear saved credentials if remember is unchecked
      localStorage.removeItem('parcelace_saved_email');
      localStorage.removeItem('parcelace_saved_password');
      localStorage.removeItem('parcelace_remember_credentials');
    }

    // Check for demo credentials first
    if (email === 'demo@parcelace.io' && password === 'demo123') {
      console.log('Using demo login');
      
      // Store demo user data
      const demoUserData = {
        id: 1,
        name: 'Demo User',
        email: 'demo@parcelace.io',
        username: 'demo',
        phone: '+1234567890',
        auth_token: 'demo-token-123',
        access_token: 'demo-access-token',
        shop: 'Demo Shop',
        is_kyc_verified: 1,
        is_onboarding_filled: true,
        mobile_verified_at: new Date().toISOString()
      };

      localStorage.setItem('auth_token', 'demo-token-123');
      sessionStorage.setItem('auth_token', 'demo-token-123');
      localStorage.setItem('user_data', JSON.stringify(demoUserData));
      sessionStorage.setItem('user_data', JSON.stringify(demoUserData));
      
      // Use the auth hook to handle login
      login(demoUserData, 'demo-token-123');
      
      toast({
        title: "Demo Login Successful",
        description: "Welcome to the demo!",
      });
      
      navigate('/dashboard/orders');
      setIsLoading(false);
      return;
    }

    // Try real API login
    try {
      console.log('Attempting API login with:', { email, password });
      const loginUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`;
      console.log('API URL:', loginUrl);
      
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

      if (response.ok && data.status) {
        // Store tokens and user info
        localStorage.setItem('auth_token', data.data.auth_token);
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.data));
        sessionStorage.setItem('auth_token', data.data.auth_token);
        sessionStorage.setItem('access_token', data.data.access_token);
        sessionStorage.setItem('user_data', JSON.stringify(data.data));
        
        // Use the auth hook to handle login
        login(data.data, data.data.auth_token);
        
        // Save user data to session storage for Razorpay integration
        sessionStorage.setItem('user', JSON.stringify(data.data));
        
        // Set initial wallet balance (you can fetch this from your API)
        sessionStorage.setItem('walletBalance', '0');
        
        // Get user name with better fallback logic
        const getUserDisplayName = (userData: any): string => {
          if (userData?.name) {
            return userData.name;
          }
          
          // Try to get name from email prefix
          if (userData?.email) {
            return userData.email.split('@')[0];
          }
          
          return 'there';
        };
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${getUserDisplayName(data.data)}!`,
        });
        
        // Check mobile verification and onboarding status
        const userData = data.data;
        
        // If mobile is not verified, navigate to OTP verification
        if (!userData.mobile_verified_at) {
          console.log('Mobile not verified, navigating to OTP verification');
          navigate('/otp-verification', { 
            state: { 
              email: email,
              fromLogin: true,
              userData: userData
            }
          });
          return;
        }
        
        // If onboarding is not filled, go to onboarding wizard
        if (!userData.is_onboarding_filled) {
          navigate('/onboarding/wizard');
          return;
        }
        
        // If both mobile verified and onboarding filled, go to orders page
        navigate('/dashboard/orders');
        } else {
          toast({
            title: "Login Failed",
            description: data?.message || "Invalid email or password",
            variant: "destructive"
          });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if it's a network error or API unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "API Unavailable",
          description: "The login service is currently unavailable. Please try the demo login or contact support.",
          variant: "destructive"
        });
      } else {
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Social login functionality removed

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignUp = () => {
    // Navigate to the signup route
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Access your shipping dashboard
          </p>
          
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Enter your business email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Credentials Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-credentials"
                checked={rememberCredentials}
                onChange={(e) => setRememberCredentials(e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-credentials" className="ml-2 block text-sm text-gray-700">
                Remember my credentials
              </label>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-sm font-medium hover:from-pink-600 hover:to-blue-700 transition-all duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-blue-500 to-indigo-600 hover:from-pink-600 hover:via-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-gray-600">New to our platform? </span>
            <button
              type="button"
              onClick={handleSignUp}
              className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text font-medium hover:from-pink-600 hover:to-blue-700 transition-all duration-200"
            >
              Start Shipping
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center mt-6 px-4">
          <div className="flex items-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Trusted by 10,000+ D2C brands
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 