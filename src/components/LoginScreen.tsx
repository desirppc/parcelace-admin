
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

const LoginScreen = ({ onNavigateToSignUp, onNavigateToForgotPassword, onNavigateBack, onNavigateToOnboarding }: { 
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateBack: () => void;
  onNavigateToOnboarding: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok && data.status && data.data) {
        // Store tokens and user info
        localStorage.setItem('auth_token', data.data.auth_token);
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.data));
        sessionStorage.setItem('auth_token', data.data.auth_token);
        sessionStorage.setItem('access_token', data.data.access_token);
        sessionStorage.setItem('user_data', JSON.stringify(data.data));
        sessionStorage.setItem('user', JSON.stringify(data.data));
        
        // Set user in context
        setUser(data.data);
        
        // Check mobile verification and onboarding status
        if (!data.data.mobile_verified_at) {
          // User needs mobile OTP verification
          onNavigateToOnboarding(); // This will be handled by RouteGuard
        } else if (!data.data.is_onboarding_filled) {
          // User needs to complete onboarding wizard
          window.location.href = '/onboarding/wizard';
        } else {
          // User is fully verified and onboarded
          window.location.href = '/dashboard/orders';
        }
      } else {
        toast({
          title: 'Error',
          description: data?.error?.message || data?.message || 'Login failed.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Social login functionality removed

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={onNavigateBack}
          className="flex items-center text-gray-600 mb-8 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          {/* Logo/Icon - Removed */}
          {/* <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div> */}

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Access your shipping dashboard
          </p>

          {/* Login Form */}

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
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

            {/* Forgot Password */}
            <div className="text-right">
              <button 
                onClick={onNavigateToForgotPassword}
                className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-sm font-medium hover:from-pink-600 hover:to-blue-700 transition-all duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button 
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-blue-500 to-indigo-600 hover:from-pink-600 hover:via-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Access Dashboard
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
              onClick={onNavigateToSignUp}
              className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text font-medium hover:from-pink-600 hover:to-blue-700 transition-all duration-200"
            >
              Start Shipping
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center mt-6 px-4">
          <div className="flex items-center text-xs text-gray-500">
            <Lock className="w-3 h-3 mr-1" />
            Trusted by 1,000+ D2C brands
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
