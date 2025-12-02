import React from 'react';
import { Clock, MessageCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SupportTicket } from '@/types/supportTicket';

interface TicketCardProps {
  ticket: SupportTicket;
  isSelected?: boolean;
  onClick?: () => void;
  getStatusBadgeVariant: (status: string | null) => "default" | "secondary" | "destructive" | "outline";
  getStatusBadgeColor: (status: string | null) => string;
  getPriorityBadgeColor: (priority: string | null) => string;
  getPriorityBarColor: (priority: string | null) => string;
  formatDate: (dateString: string) => string;
  formatStatusLabel: (status: string | null) => string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  isSelected = false,
  onClick,
  getStatusBadgeVariant,
  getStatusBadgeColor,
  getPriorityBadgeColor,
  getPriorityBarColor,
  formatDate,
  formatStatusLabel
}) => {
  const ticketSubject = ticket.remark || `${ticket.category} - ${ticket.sub_category}`;
  const messageCount = ticket.details?.length || 0;

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-start cursor-pointer transition-all bg-white border border-gray-200 rounded-lg
        ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
        hover:bg-gray-50 overflow-hidden shadow-sm
      `}
    >
      {/* Priority Bar */}
      <div className={`w-1 min-h-full ${getPriorityBarColor(ticket.priority)}`} />
      
      {/* Ticket Content */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">TKT-{String(ticket.id).padStart(3, '0')}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {ticketSubject}
            </h3>
            <div className="text-sm text-gray-600 mb-3">
              <div className="font-medium">{ticket.user.name}</div>
              <div className="text-xs text-gray-500">{ticket.user.email}</div>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(ticket.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
              </div>
              {ticket.assigned_user_id && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>Assigned</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {ticket.category}
              </Badge>
              {ticket.sub_category && (
                <Badge variant="outline" className="text-xs">
                  {ticket.sub_category}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={getStatusBadgeVariant(ticket.status)}
                className={`${getStatusBadgeColor(ticket.status)} text-xs`}
              >
                {formatStatusLabel(ticket.status)}
              </Badge>
              {ticket.priority && (
                <Badge 
                  className={`${getPriorityBadgeColor(ticket.priority)} text-xs`}
                >
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

