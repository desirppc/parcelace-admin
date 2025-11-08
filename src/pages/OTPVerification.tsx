import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Clock, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import API_CONFIG from '@/config/api';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendTime, setResendTime] = useState(60); // 1 minute cooldown
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || new URLSearchParams(location.search).get('email');
  const fromLogin = location.state?.fromLogin || false;
  const userData = location.state?.userData;

  useEffect(() => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please go back and enter your email address",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate, toast]);

  useEffect(() => {
    // Resend timer
    if (resendTime > 0) {
      const resendTimer = setInterval(() => {
        setResendTime((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(resendTimer);
    }
  }, [resendTime]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use different endpoints based on the flow
      const endpoint = fromLogin ? API_CONFIG.ENDPOINTS.VERIFY_OTP : API_CONFIG.ENDPOINTS.FORGOT_PASSWORD_VERIFY;
      const apiUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
      console.log('Verifying OTP:', { email, otp: otpString, endpoint, fromLogin });

      const requestBody = fromLogin ? {
        email: email,
        otp: otpString
      } : {
        email: email,
        OTP: otpString
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
      console.log('OTP verification response:', data);

      if (response.ok && data.status) {
        toast({
          title: "OTP Verified Successfully",
          description: "Your account has been verified!",
        });

        if (fromLogin) {
          // If coming from login, always redirect to dashboard
          if (userData) {
            // Update user data with verified status
            const updatedUserData = { ...userData, mobile_verified_at: new Date().toISOString() };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            sessionStorage.setItem('user', JSON.stringify(updatedUserData));
          }
          navigate('/dashboard/orders/prepaid');
        } else {
          // If coming from forgot password, go to reset password
          const authToken = data.data?.auth_token || data.data?.token || data.auth_token;
          console.log('Auth token for reset:', authToken);
          
          navigate('/reset-password', { 
            state: { 
              email: email,
              auth_token: authToken
            }
          });
        }
      } else {
        console.error('OTP verification failed:', data);
        toast({
          title: "Verification Failed",
          description: data?.message || data?.error || "Invalid OTP. Please try again.",
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
    if (!canResend) return;

    setIsLoading(true);
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESEND_OTP}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email",
        });
        setCanResend(false);
        setResendTime(60);
        setTimeLeft(600);
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
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (fromLogin) {
      navigate('/login');
    } else {
      navigate('/forgot-password');
    }
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
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-pink-400 bg-white/60 backdrop-blur-sm"
                  maxLength={1}
                  disabled={isLoading}
                />
              ))}
                </div>
            </div>
          </div>

          {/* Verify Button */}
          <Button 
            onClick={handleVerifyOTP}
            disabled={isLoading || otp.join('').length !== 6}
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-blue-500 to-indigo-600 hover:from-pink-600 hover:via-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify OTP'
            )}
          </Button>
          </div>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">Didn't receive the code? </span>
            {canResend ? (
              <button
                onClick={handleResendOTP}
                className="text-transparent bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text font-medium hover:from-pink-600 hover:to-blue-700 transition-all duration-200"
              >
                Resend Code
              </button>
            ) : (
              <span className="text-gray-500">
                Resend in {formatTime(resendTime)}
              </span>
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

export default OTPVerification; 