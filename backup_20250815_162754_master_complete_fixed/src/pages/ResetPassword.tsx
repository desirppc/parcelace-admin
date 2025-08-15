import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Mail, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import API_CONFIG from '@/config/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || 'your email';

  // Debug logging
  console.log('ResetPassword - location.state:', location.state);
  console.log('ResetPassword - email:', email);

  // Check if we have the required data
  useEffect(() => {
    if (!location.state?.email) {
      toast({
        title: "Missing Information",
        description: "Please go back and enter your email address",
        variant: "destructive"
      });
      navigate('/forgot-password');
    }
  }, [location.state, navigate, toast]);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both password fields",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`;
      console.log('Resetting password for:', email);
      console.log('API URL:', apiUrl);

      const requestBody = {
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        auth_token: location.state?.auth_token
      };
      console.log('Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Reset password response:', data);

      if (response.ok && data.status) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated successfully!",
        });
        
        // Navigate to login page
        navigate('/login');
      } else {
        toast({
          title: "Reset Failed",
          description: data?.message || "Failed to reset password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="flex items-center text-gray-600 mb-8 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Create a new secure password for your account
          </p>

          {/* Email Display */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center text-sm text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-blue-500" />
              <span>Code sent to: </span>
              <span className="font-medium text-blue-600 ml-1">{email}</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* New Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Enter your new password"
                  disabled={isLoading}
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

            {/* Password Requirements */}
            {password && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                <div className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</div>
                <div className="space-y-2">
                  <div className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
                    password.length >= 8 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {password.length >= 8 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span>Minimum 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
                    /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {/[A-Z]/.test(password) ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span>At least 1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
                    /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {/[a-z]/.test(password) ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span>At least 1 lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
                    /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span>At least 1 special character</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && (
                <div className={`mt-2 text-sm flex items-center space-x-2 ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-500'
                }`}>
                  {password === confirmPassword ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span>{password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}</span>
            </div>
              )}
            </div>

            {/* Reset Password Button */}
            <Button 
              onClick={handleResetPassword}
              disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-blue-500 to-indigo-600 hover:from-pink-600 hover:via-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center mt-6 px-4">
          <div className="flex items-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Your new password will be encrypted and secure
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 