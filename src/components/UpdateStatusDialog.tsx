import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Loader2, Edit3, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supportTicketService } from '@/services/supportTicketService';

interface UpdateStatusDialogProps {
  ticketId: number;
  currentStatus: string | null;
  currentPriority?: string | null;
  currentExpectedClosureDate?: string | null;
  currentCloseDate?: string | null;
  onStatusUpdate: () => void;
  trigger?: React.ReactNode;
}

const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({ 
  ticketId, 
  currentStatus,
  currentPriority,
  currentExpectedClosureDate,
  currentCloseDate,
  onStatusUpdate,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus || 'open ticket');
  const [selectedPriority, setSelectedPriority] = useState<string>(currentPriority || '');
  const [expectedClosureDate, setExpectedClosureDate] = useState<Date | undefined>(
    currentExpectedClosureDate ? new Date(currentExpectedClosureDate) : undefined
  );
  // Close date should only be set when status is "closed"
  const [closeDate, setCloseDate] = useState<Date | undefined>(
    currentCloseDate ? new Date(currentCloseDate) : undefined
  );
  const [note, setNote] = useState('');
  const { toast } = useToast();

  // Reset form when dialog opens/closes or when props change
  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus || 'open ticket');
      setSelectedPriority(currentPriority || '');
      setExpectedClosureDate(currentExpectedClosureDate ? new Date(currentExpectedClosureDate) : undefined);
      // Only set close_date if it exists (ticket was previously closed)
      setCloseDate(currentCloseDate ? new Date(currentCloseDate) : undefined);
      setNote('');
    }
  }, [open, currentStatus, currentPriority, currentExpectedClosureDate, currentCloseDate]);

  // Auto-set close date when status changes to "closed", clear it when status changes away from "closed"
  useEffect(() => {
    if (selectedStatus === 'closed') {
      // If status is "closed" and close date is not set, set it to current date
      setCloseDate((prev) => prev || new Date());
    } else {
      // If status is not "closed", clear the close date
      setCloseDate(undefined);
    }
  }, [selectedStatus]);

  const statusOptions = [
    { value: 'open ticket', label: 'Open Ticket', color: 'bg-blue-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-orange-500' },
    { value: 'awaiting-response', label: 'Awaiting Response', color: 'bg-purple-500' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-500' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
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

    if (!selectedPriority) {
      toast({
        title: "Error",
        description: "Please select a priority",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date | undefined): string | null => {
        if (!date) return null;
        return format(date, 'yyyy-MM-dd');
      };

      // Get current date for open_date and status_update_date (automatically set)
      const currentDate = format(new Date(), 'yyyy-MM-dd');

      const updateData = {
        ticket_id: ticketId,
        status: selectedStatus,
        priority: selectedPriority,
        expected_closure_date: formatDate(expectedClosureDate),
        // Only set close_date when status is "closed"
        close_date: selectedStatus === 'closed' ? formatDate(closeDate) : null,
        open_date: currentDate, // Automatically set to current date
        status_update_date: currentDate, // Automatically set to current date
        note: note || undefined
      };

      const response = await supportTicketService.updateTicketStatus(updateData);
      
      if (response.status) {
        toast({
          title: "Success",
          description: `Ticket status updated successfully`,
        });
        setOpen(false);
        setNote('');
        onStatusUpdate();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update ticket status",
          variant: "destructive",
        });
      }
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Ticket Status - #{ticketId}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Ticket ID (Read-only) */}
          <div className="space-y-2">
            <Label>Ticket ID</Label>
            <div className="p-2 bg-gray-100 rounded-md">
              <span className="font-medium">#{ticketId}</span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expected Closure Date */}
          <div className="space-y-2">
            <Label htmlFor="expectedClosureDate">Expected Closure Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {expectedClosureDate ? format(expectedClosureDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={expectedClosureDate}
                  onSelect={(date) => setExpectedClosureDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Close Date - Only shown when status is "closed" */}
          {selectedStatus === 'closed' && (
            <div className="space-y-2">
              <Label htmlFor="closeDate">Close Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {closeDate ? format(closeDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={closeDate}
                    onSelect={(date) => setCloseDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

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
              disabled={updating || !selectedStatus || !selectedPriority}
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
