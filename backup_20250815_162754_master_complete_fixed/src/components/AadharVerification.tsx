
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { AadharVerificationData } from '@/types/kyc';

interface AadharVerificationProps {
  onComplete: (success: boolean, data?: AadharVerificationData) => void;
  onClose: () => void;
}

const AadharVerification: React.FC<AadharVerificationProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<'aadhar' | 'otp' | 'success'>('aadhar');
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatAadharNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    return formatted.slice(0, 14);
  };

  const handleAadharSubmit = async () => {
    if (aadharNumber.replace(/\s/g, '').length !== 12) {
      setError('Please enter a valid 12-digit Aadhar number');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setResendTimer(30);
    }, 1500);
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (otp === '123456') { // Mock successful OTP
        setStep('success');
        setTimeout(() => {
          onComplete(true, { aadharNumber, otp });
        }, 2000);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    }, 1500);
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      // Simulate resend API call
      console.log('OTP resent');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Aadhar Verification
          </DialogTitle>
        </DialogHeader>

        {step === 'aadhar' && (
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="aadhar">Aadhar Number</Label>
              <Input
                id="aadhar"
                type="text"
                placeholder="1234 5678 9012"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(formatAadharNumber(e.target.value))}
                maxLength={14}
                className="text-center text-lg tracking-wider"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter your 12-digit Aadhar number
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              onClick={handleAadharSubmit}
              disabled={loading || aadharNumber.replace(/\s/g, '').length !== 12}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6 p-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                OTP sent to mobile number linked with Aadhar
              </p>
              <p className="text-xs text-muted-foreground">
                {aadharNumber}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-wider"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className="text-sm"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </Button>
            </div>

            <Button 
              onClick={handleOtpSubmit}
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {loading ? 'Verifying...' : 'Submit'}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 p-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-600">
                Aadhar Successfully Verified!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your Aadhar verification is complete.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AadharVerification;
