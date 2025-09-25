import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface DeactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeactivationModal({ isOpen, onClose, onConfirm }: DeactivationModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason) {
      onConfirm();
      onClose();
      setReason('');
    }
  };

  const reasons = [
    'Too expensive',
    'Not enough features',
    'Poor customer service',
    'Found a better alternative',
    'No longer needed',
    'Technical issues',
    'Other'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Deactivate Notify Ace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <p className="text-gray-600">
            We're sorry to see you go. Could you help us understand why you're deactivating this service?
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Reason for deactivation</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!reason}
              variant="destructive"
              className="flex-1"
            >
              Deactivate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
