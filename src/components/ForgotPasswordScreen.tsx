
import React, { useState } from 'react';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ForgotPasswordScreen = ({ onNavigateBack, onNavigateToOTP }: { 
  onNavigateBack: () => void;
  onNavigateToOTP: () => void;
}) => {
  const [email, setEmail] = useState('');

  const handleSendOTP = () => {
    if (email) {
      onNavigateToOTP();
    }
  };

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
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600 text-center mb-8">
            No worries! We'll send you a reset code to your email
          </p>

          {/* Form */}
          <div className="space-y-6">
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
                  placeholder="Enter your registered email"
                />
              </div>
            </div>

            {/* Send OTP Button */}
            <Button 
              onClick={handleSendOTP}
              disabled={!email}
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-blue-500 to-indigo-600 hover:from-pink-600 hover:via-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Send Reset Code
            </Button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-100">
            <div className="text-xs text-gray-700 text-center">
              You'll receive a 6-digit verification code to reset your password securely
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center mt-6 px-4">
          <div className="flex items-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Your account security is our priority
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
