import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supportUserService, SupportUser } from '@/services/supportUserService';
import { supportTicketService, AssignTicketRequest } from '@/services/supportTicketService';

interface AssignTicketDialogProps {
  ticketId: number;
  onAssignmentComplete: () => void;
  trigger?: React.ReactNode;
}

const AssignTicketDialog: React.FC<AssignTicketDialogProps> = ({ 
  ticketId, 
  onAssignmentComplete,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [note, setNote] = useState('');
  const { toast } = useToast();

  // Load support users when dialog opens
  useEffect(() => {
    if (open) {
      loadSupportUsers();
    }
  }, [open]);

  const loadSupportUsers = async () => {
    setLoading(true);
    try {
      const response = await supportUserService.getSupportUsers();
      if (response.status) {
        setSupportUsers(response.data.support_users);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load support users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading support users:', error);
      toast({
        title: "Error",
        description: "Failed to load support users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a support user to assign the ticket to",
        variant: "destructive",
      });
      return;
    }

    setAssigning(true);
    try {
      const assignData: AssignTicketRequest = {
        support_user_id: parseInt(selectedUserId),
        support_ticket_id: ticketId,
        note: note.trim() || undefined
      };

      const response = await supportTicketService.assignTicket(assignData);
      
      if (response.status) {
        toast({
          title: "Success",
          description: response.message || "Ticket assigned successfully",
        });
        setOpen(false);
        setSelectedUserId('');
        setNote('');
        onAssignmentComplete();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to assign ticket",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedUserId('');
      setNote('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Ticket #{ticketId}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Support User Selection */}
          <div className="space-y-2">
            <Label htmlFor="support-user">Support User *</Label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading support users...</span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a support user" />
                </SelectTrigger>
                <SelectContent>
                  {supportUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this assignment..."
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
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={assigning || !selectedUserId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {assigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Ticket'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTicketDialog;
