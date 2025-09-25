import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, CheckCircle, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InteractiveDemoModal({ isOpen, onClose }: InteractiveDemoModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setShowSuccess(true);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setPhoneNumber('');
    onClose();
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-6 w-6 p-0"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Demo Message Sent!</h3>
              <p className="text-gray-600">
                Check your WhatsApp for a live tracking demo message. You'll receive it within the next few minutes.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 h-8 w-8 p-0 z-10 bg-white/80 hover:bg-white rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center">
          {/* Visual Header */}
          <div className="w-full h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-t-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10 flex flex-col items-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="w-6 h-6 border-2 border-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl font-bold mb-2 text-gray-900">Experience Yourself</DialogTitle>
              <p className="text-gray-600 text-sm">
                Enter your number to experience live tracking updates on WhatsApp
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-lg bg-gray-50 min-w-[80px]">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-sm font-medium text-gray-600">+91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  maxLength={10}
                />
              </div>
              
              <Button 
                type="submit" 
                className={cn(
                  "w-full py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-all duration-200",
                  phoneNumber.length < 10 && "opacity-50 cursor-not-allowed"
                )}
                disabled={phoneNumber.length < 10}
              >
                Get Demo Message
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
