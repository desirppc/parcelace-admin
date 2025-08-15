
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { BankVerificationData } from '@/types/kyc';

interface BankVerificationProps {
  onComplete: (success: boolean, data?: BankVerificationData) => void;
  onClose: () => void;
}

const BankVerification: React.FC<BankVerificationProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<'bank' | 'success' | 'failed'>('bank');
  const [formData, setFormData] = useState<BankVerificationData>({
    payeeName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.payeeName.trim()) {
      newErrors.payeeName = 'Payee name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
      newErrors.accountNumber = 'Account number must be 9-18 digits';
    }

    if (!formData.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please confirm account number';
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    if (!formData.ifsc.trim()) {
      newErrors.ifsc = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
      newErrors.ifsc = 'Invalid IFSC code format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Mock success/failure based on account number
      if (formData.accountNumber === '123456789012345') {
        setStep('success');
        setTimeout(() => {
          onComplete(true, formData);
        }, 2000);
      } else {
        setStep('failed');
        setTimeout(() => {
          setStep('bank');
        }, 3000);
      }
    }, 1500);
  };

  const handleInputChange = (field: keyof BankVerificationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Bank Account Verification
          </DialogTitle>
        </DialogHeader>

        {step === 'bank' && (
          <div className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payeeName">Payee Name</Label>
                <Input
                  id="payeeName"
                  type="text"
                  placeholder="Enter account holder name"
                  value={formData.payeeName}
                  onChange={(e) => handleInputChange('payeeName', e.target.value)}
                />
                {errors.payeeName && (
                  <p className="text-xs text-red-600">{errors.payeeName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter account number"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-red-600">{errors.accountNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                <Input
                  id="confirmAccountNumber"
                  type="text"
                  placeholder="Re-enter account number"
                  value={formData.confirmAccountNumber}
                  onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value.replace(/\D/g, ''))}
                />
                {errors.confirmAccountNumber && (
                  <p className="text-xs text-red-600">{errors.confirmAccountNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifsc">IFSC Code</Label>
                <Input
                  id="ifsc"
                  type="text"
                  placeholder="ABCD0123456"
                  value={formData.ifsc}
                  onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase().slice(0, 11))}
                />
                {errors.ifsc && (
                  <p className="text-xs text-red-600">{errors.ifsc}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={loading}
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
                Bank Account Successfully Verified!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your bank account verification is complete.
              </p>
            </div>
          </div>
        )}

        {step === 'failed' && (
          <div className="space-y-6 p-6 text-center">
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600">
                Bank Account Verification Failed
              </h3>
              <p className="text-sm text-muted-foreground">
                Please check your details and try again.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BankVerification;
