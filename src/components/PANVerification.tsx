
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { PANVerificationData } from '@/types/kyc';

interface PANVerificationProps {
  onComplete: (success: boolean, data?: PANVerificationData) => void;
  onClose: () => void;
}

const PANVerification: React.FC<PANVerificationProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<'pan' | 'details' | 'success'>('pan');
  const [panNumber, setPanNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [panDetails, setPanDetails] = useState<PANVerificationData | null>(null);

  const formatPanNumber = (value: string) => {
    return value.toUpperCase().slice(0, 10);
  };

  const validatePanNumber = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handlePanSubmit = async () => {
    if (!validatePanNumber(panNumber)) {
      setError('Please enter a valid PAN number (Format: ABCDE1234F)');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (panNumber === 'ABCDE1234F') { // Mock successful PAN
        const mockDetails: PANVerificationData = {
          panNumber,
          name: 'John Doe',
          address: '123 Main Street, New Delhi, 110001'
        };
        setPanDetails(mockDetails);
        setStep('details');
      } else {
        setError('No details found. Please re-check your PAN number.');
      }
    }, 1500);
  };

  const handleDetailsConfirm = (correct: boolean) => {
    if (correct) {
      setStep('success');
      setTimeout(() => {
        onComplete(true, panDetails!);
      }, 2000);
    } else {
      setStep('pan');
      setPanNumber('');
      setError('');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            PAN Verification
          </DialogTitle>
        </DialogHeader>

        {step === 'pan' && (
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number</Label>
              <Input
                id="pan"
                type="text"
                placeholder="ABCDE1234F"
                value={panNumber}
                onChange={(e) => setPanNumber(formatPanNumber(e.target.value))}
                maxLength={10}
                className="text-center text-lg tracking-wider uppercase"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter your 10-character PAN number
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              onClick={handlePanSubmit}
              disabled={loading || !validatePanNumber(panNumber)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {loading ? 'Verifying...' : 'Submit'}
            </Button>
          </div>
        )}

        {step === 'details' && panDetails && (
          <div className="space-y-6 p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Verify Details</h3>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">PAN Number</Label>
                  <p className="font-medium">{panDetails.panNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="font-medium">{panDetails.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="font-medium">{panDetails.address}</p>
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
                Re-enter PAN
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
                PAN Successfully Verified!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your PAN verification is complete.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PANVerification;
