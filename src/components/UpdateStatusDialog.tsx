import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpdateStatusDialogProps {
  ticketId: number;
  currentStatus: string | null;
  onStatusUpdate: () => void;
  trigger?: React.ReactNode;
}

const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({ 
  ticketId, 
  currentStatus,
  onStatusUpdate,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus || 'open');
  const [note, setNote] = useState('');
  const { toast } = useToast();

  const statusOptions = [
    { value: 'open', label: 'Open', color: 'bg-blue-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-orange-500' },
    { value: 'awaiting-response', label: 'Awaiting Response', color: 'bg-purple-500' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-500' }
  ];

  const handleUpdate = async () => {
    if (!selectedStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      // TODO: Implement status update API call
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: `Ticket status updated to ${statusOptions.find(s => s.value === selectedStatus)?.label}`,
      });
      setOpen(false);
      setNote('');
      onStatusUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setNote('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Update Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Status - Ticket #{ticketId}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="p-2 bg-gray-100 rounded-md">
              <span className="font-medium">
                {statusOptions.find(s => s.value === currentStatus)?.label || 'Open'}
              </span>
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status *</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updating || !selectedStatus}
              className="bg-green-600 hover:bg-green-700"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusDialog;
