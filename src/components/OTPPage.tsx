import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import API_CONFIG from '@/config/api';

// Placeholder for EmailEditDialog
const EmailEditDialog = ({ currentEmail, onEmailUpdate }: { currentEmail: string; onEmailUpdate: (email: string) => void }) => null;

const OTPPage: React.FC<{ email: string; onBack: () => void; onSuccess: (token: string) => void }> = ({ email, onBack, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60); // Start with 60 seconds
  const [registeredEmail, setRegisteredEmail] = useState(email);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmitOTP = async () => {
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a complete 6-digit OTP code.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD_VERIFY}`;
      console.log('Verifying OTP:', { email, otp });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: email, 
          OTP: otp 
        })
      });
      const data = await response.json();
      console.log('OTP verification response:', data);
      
      if (response.ok && data.status && data.data?.auth_token) {
        // Store email for reset password process
        sessionStorage.setItem('reset_email', email);
        localStorage.setItem('auth_token', data.data.auth_token);
        sessionStorage.setItem('auth_token', data.data.auth_token);
        
        toast({
          title: "Success!",
          description: "OTP verified successfully.",
          action: <CheckCircle2 className="w-4 h-4 text-green-600" />,
        });
        onSuccess(data.data.auth_token);
      } else {
        toast({
          title: "Error",
          description: data?.error?.message || data?.message || "OTP verification failed.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    setCountdown(60); // Reset countdown to 60 seconds
    
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESEND_OTP}`;
      console.log('Resending OTP to:', email);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();
      console.log('Resend OTP response:', data);

      if (response.ok && data.status) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        toast({
          title: "Resend Failed",
          description: data?.message || "Failed to resend OTP. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailUpdate = (newEmail: string) => {
    setRegisteredEmail(newEmail);
    setOtp(''); // Clear current OTP
    setCountdown(60); // Reset countdown
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.slice(0, 2) + '*'.repeat(Math.max(username.length - 2, 3));
    return `${maskedUsername}@${domain}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to login</span>
        </button>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
          {/* Card Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Verify Your Email
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                We've sent a 6-digit verification code to your email address
              </p>
            </div>

            {/* Email Display with Edit Option */}
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center flex-1">
                  <p className="text-sm text-gray-500 mb-1">Code sent to</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="font-semibold text-gray-900 text-lg">{maskEmail(registeredEmail)}</p>
                    <EmailEditDialog 
                      currentEmail={registeredEmail}
                      onEmailUpdate={handleEmailUpdate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100/80 rounded-full text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Code expires in {formatTime(countdown > 0 ? countdown : 0)}</span>
              </div>
            </div>

            {/* OTP Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-6 text-center">
                Enter 6-digit verification code
              </label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                containerClassName="gap-4"
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-4">
                  {[0,1,2,3,4,5].map(i => (
                    <InputOTPSlot key={i} index={i} className="w-11 h-11 text-lg border-2 border-gray-200 rounded-full focus:border-blue-400 bg-white/60 backdrop-blur-sm" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitOTP}
              disabled={otp.length !== 6 || isLoading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-6 text-base"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                'Verify OTP'
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOTP}
                disabled={countdown > 0 || isResending}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 disabled:hover:bg-transparent"
              >
                {isResending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    Resending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Code
                  </>
                )}
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-8 p-4 bg-gray-50/80 rounded-xl border border-gray-100/50 backdrop-blur-sm">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                🔒 For your security, this code will expire in 10 minutes. 
                Never share this code with anyone.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Need help? Contact our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPPage; 