
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import API_CONFIG from '@/config/api';

const SignUpScreen = ({ onNavigateToLogin, onNavigateBack, onNavigateToOnboarding }: { 
  onNavigateToLogin: () => void;
  onNavigateBack: () => void;
  onNavigateToOnboarding: (phone?: string, token?: string) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    language: 'EN'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation
  const validations = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const allValidationsPassed = Object.values(validations).every(Boolean);
  const passwordsMatch = formData.password === formData.password_confirmation && formData.password !== '';
  const { toast } = useToast();
  const { setUser } = useUser();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTermsChange = (checked: boolean | "indeterminate") => {
    setAgreeToTerms(checked === true);
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.password_confirmation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }


    if (!allValidationsPassed) {
      toast({
        title: "Password Requirements Not Met",
        description: "Please ensure your password meets all requirements",
        variant: "destructive"
      });
      return false;
    }

    if (!passwordsMatch) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive"
      });
      return false;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms Not Accepted",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
      isValid ? 'text-green-600' : 'text-gray-500'
    }`}>
      {isValid ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      )}
      <span>{text}</span>
    </div>
  );

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
    console.log('Sign up attempt:', formData);
      
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
        mode: 'cors',
        credentials: 'omit'
      });

      const data = await response.json();
      console.log('Sign up response:', data);

      if (response.ok && data.status) {
        // Store auth token
        localStorage.setItem('auth_token', data.data.auth_token);
        sessionStorage.setItem('auth_token', data.data.auth_token);
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(data.data));
        sessionStorage.setItem('user_data', JSON.stringify(data.data));
        sessionStorage.setItem('user', JSON.stringify(data.data));
        
        // Set user in context
        setUser(data.data);

        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully!",
        });

        // Send OTP for mobile verification
        await sendOTP(data.data.auth_token);
        
        // Navigate to OTP verification with phone and token
        onNavigateToOnboarding(formData.phone, data.data.auth_token);
      } else {
        toast({
          title: "Registration Failed",
          description: data?.error?.message || data?.message || "Failed to create account. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (authToken: string) => {
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEND_OTP}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        mode: 'cors',
        credentials: 'omit'
      });

      const data = await response.json();
      console.log('Send OTP response:', data);

      if (response.ok && data.status) {
        toast({
          title: "OTP Sent",
          description: "Verification code has been sent to your mobile number",
        });
      } else {
        console.error('Failed to send OTP:', data);
      }
    } catch (error) {
      console.error('Send OTP error:', error);
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
              <Package className="w-8 h-8 text-white" />
            </div>
          </div> */}

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Get started with ParcelAce in minutes
          </p>

          {/* Sign Up Form */}

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-6">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Enter your business name"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Enter your business email"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Enter your phone number"
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                  <div className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</div>
                  <div className="space-y-1">
                    <ValidationItem isValid={validations.minLength} text="Minimum 8 characters" />
                    <ValidationItem isValid={validations.hasUppercase} text="At least 1 uppercase letter" />
                    <ValidationItem isValid={validations.hasLowercase} text="At least 1 lowercase letter" />
                    <ValidationItem isValid={validations.hasSpecialChar} text="At least 1 special character" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password_confirmation && (
                <div className={`mt-2 text-sm flex items-center space-x-2 ${
                  passwordsMatch ? 'text-green-600' : 'text-red-500'
                }`}>
                  {passwordsMatch ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={handleTermsChange}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                I agree to the{' '}
                <button className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text hover:from-pink-600 hover:to-blue-700 font-medium transition-all duration-200">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text hover:from-pink-600 hover:to-blue-700 font-medium transition-all duration-200">
                  Shipping Agreement
                </button>
              </label>
            </div>

            {/* Sign Up Button */}
            <Button 
              type="submit"
              disabled={!agreeToTerms || !allValidationsPassed || !passwordsMatch || isLoading}
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-blue-500 to-indigo-600 hover:from-pink-600 hover:via-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={onNavigateToLogin}
              className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text font-medium hover:from-pink-600 hover:to-blue-700 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
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

export default SignUpScreen;
