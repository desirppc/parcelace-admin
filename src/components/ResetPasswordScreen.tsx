
import React, { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, Check, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ResetPasswordScreen = ({ onNavigateBack, onPasswordReset }: { 
  onNavigateBack: () => void;
  onPasswordReset: () => void;
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const validations = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allValidationsPassed = Object.values(validations).every(Boolean);
  const passwordsMatch = password === confirmPassword && password !== '';

  const handleResetPassword = () => {
    if (allValidationsPassed && passwordsMatch) {
      onPasswordReset();
    }
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
            Reset Password
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Create a new secure password for your account
          </p>

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
                  <ValidationItem isValid={validations.minLength} text="Minimum 8 characters" />
                  <ValidationItem isValid={validations.hasUppercase} text="At least 1 uppercase letter" />
                  <ValidationItem isValid={validations.hasLowercase} text="At least 1 lowercase letter" />
                  <ValidationItem isValid={validations.hasSpecialChar} text="At least 1 special character" />
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

            {/* Reset Password Button */}
            <Button 
              onClick={handleResetPassword}
              disabled={!allValidationsPassed || !passwordsMatch}
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-blue-500 to-indigo-600 hover:from-pink-600 hover:via-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Reset Password
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

export default ResetPasswordScreen;
