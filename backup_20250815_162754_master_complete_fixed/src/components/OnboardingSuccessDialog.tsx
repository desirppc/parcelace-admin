import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, PartyPopper } from 'lucide-react';

interface OnboardingSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const OnboardingSuccessDialog: React.FC<OnboardingSuccessDialogProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">🎉 Welcome to ParcelAce!</DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Onboarding Completed Successfully!
            </h3>
            <p className="text-gray-600">
              Thank you for setting up your account. We're excited to help you streamline your shipping operations!
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <PartyPopper className="w-4 h-4" />
            <span>Your account is now ready to use</span>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onContinue}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSuccessDialog; 