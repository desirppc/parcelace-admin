
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { GSTVerificationData } from '@/types/kyc';

interface GSTVerificationProps {
  onComplete: (success: boolean, data?: GSTVerificationData) => void;
  onClose: () => void;
}

const GSTVerification: React.FC<GSTVerificationProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<'gst' | 'details' | 'success'>('gst');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gstDetails, setGstDetails] = useState<GSTVerificationData | null>(null);

  const formatGstNumber = (value: string) => {
    return value.toUpperCase().slice(0, 15);
  };

  const validateGstNumber = (gst: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const handleGstSubmit = async () => {
    if (!validateGstNumber(gstNumber)) {
      setError('Please enter a valid GST number (15 characters)');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (gstNumber === '22AAAAA0000A1Z5') { // Mock successful GST
        const mockDetails: GSTVerificationData = {
          gstNumber,
          businessName: 'ABC Private Limited',
          address: '456 Business Park, Mumbai, Maharashtra, 400001'
        };
        setGstDetails(mockDetails);
        setStep('details');
      } else {
        setError('No details found. Please re-check your GST number.');
      }
    }, 1500);
  };

  const handleDetailsConfirm = (correct: boolean) => {
    if (correct) {
      setStep('success');
      setTimeout(() => {
        onComplete(true, gstDetails!);
      }, 2000);
    } else {
      setStep('gst');
      setGstNumber('');
      setError('');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            GST Verification
          </DialogTitle>
        </DialogHeader>

        {step === 'gst' && (
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input
                id="gst"
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(formatGstNumber(e.target.value))}
                maxLength={15}
                className="text-center text-lg tracking-wider uppercase"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter your 15-character GST number
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              onClick={handleGstSubmit}
              disabled={loading || !validateGstNumber(gstNumber)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {loading ? 'Verifying...' : 'Submit'}
            </Button>
          </div>
        )}

        {step === 'details' && gstDetails && (
          <div className="space-y-6 p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Verify Details</h3>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">GST Number</Label>
                  <p className="font-medium">{gstDetails.gstNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                  <p className="font-medium">{gstDetails.businessName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="font-medium">{gstDetails.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => handleDetailsConfirm(true)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Yes, Details are Correct
              </Button>
              <Button 
                onClick={() => handleDetailsConfirm(false)}
                variant="outline"
                className="w-full"
              >
                Re-enter GST Number
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 p-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-600">
                GST Successfully Verified!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your GST verification is complete.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GSTVerification;
