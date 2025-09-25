
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const OTPVerificationScreen = ({ onNavigateBack, onNavigateToReset, email = "us***@example.com" }: { 
  onNavigateBack: () => void;
  onNavigateToReset: () => void;
  email?: string;
}) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(58);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      onNavigateToReset();
    }
  };

  const handleResendCode = () => {
    setTimeLeft(58);
    setOtp('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            Verify Your Email
          </h1>
          <p className="text-gray-600 text-center mb-8">
            We've sent a 6-digit verification code to your email address
          </p>

          {/* Email Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-100">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Code sent to</div>
                <div className="font-medium text-gray-900">{email}</div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center mb-6 text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">Code expires in {formatTime(timeLeft)}</span>
          </div>

          {/* OTP Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  containerClassName="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-400 bg-white/60 backdrop-blur-sm" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-400 bg-white/60 backdrop-blur-sm" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-400 bg-white/60 backdrop-blur-sm" />
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-400 bg-white/60 backdrop-blur-sm" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-400 bg-white/60 backdrop-blur-sm" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-400 bg-white/60 backdrop-blur-sm" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* Verify Button */}
            <Button 
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-blue-500 to-indigo-600 hover:from-pink-600 hover:via-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Verify OTP
            </Button>
          </div>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">Didn't receive the code? </span>
            {timeLeft > 0 ? (
              <span className="text-gray-400">
                Resend in {formatTime(timeLeft)}
              </span>
            ) : (
              <button
                onClick={handleResendCode}
                className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text font-medium hover:from-pink-600 hover:to-blue-700 transition-all duration-200"
              >
                Resend Code
              </button>
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center mt-6 px-4">
          <div className="flex items-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Code valid for 10 minutes only
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationScreen;
