
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, User, Paperclip, MessageSquare, X } from 'lucide-react';
import { SupportTicket } from '@/types/support';
import TicketStatusBadge from './TicketStatusBadge';
import PrioritySelector from './PrioritySelector';
import TicketConversation from './TicketConversation';

interface TicketDetailsProps {
  ticket: SupportTicket;
  onBack: () => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket, onBack }) => {
  const [showConversation, setShowConversation] = useState(false);

  const handleCloseTicket = () => {
    if (confirm('Are you sure you want to close this ticket?')) {
      // Handle ticket closure
      alert('Ticket closed successfully!');
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {ticket.ticketNumber}
            </h1>
            <p className="text-muted-foreground">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowConversation(!showConversation)}
            className="border-purple-200/50 dark:border-purple-800/50"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showConversation ? 'Hide Chat' : 'Show Chat'}
          </Button>
          {ticket.status !== 'closed' && (
            <Button 
              variant="outline"
              onClick={handleCloseTicket}
              className="border-red-200/50 dark:border-red-800/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="w-4 h-4 mr-2" />
              Close Ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div className="mt-1">
                    <PrioritySelector 
                      value={ticket.priority} 
                      onValueChange={() => {}} 
                      disabled 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <div className="mt-1">
                    <p className="font-medium">{ticket.category}</p>
                    <p className="text-sm text-muted-foreground">{ticket.subCategory}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned Agent</label>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{ticket.assignedAgent || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-foreground">{ticket.description}</p>
              </div>

              {ticket.awbNumbers.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">AWB Numbers</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {ticket.awbNumbers.map((awb, index) => (
                      <Badge key={index} variant="secondary" className="font-mono">
                        {awb}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {ticket.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Attachments</label>
                  <div className="mt-1 space-y-2">
                    {ticket.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.createdAt.toLocaleDateString()} at {ticket.createdAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.updatedAt.toLocaleDateString()} at {ticket.updatedAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Expected Closure</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.expectedClosureDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowConversation(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Message
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Paperclip className="w-4 h-4 mr-2" />
                Add Attachment
              </Button>
              {ticket.status !== 'closed' && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleCloseTicket}
                >
                  <X className="w-4 h-4 mr-2" />
                  Close Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversation */}
      {showConversation && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketConversation ticket={ticket} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketDetails;
