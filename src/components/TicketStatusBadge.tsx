
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TicketStatusBadgeProps {
  status: 'open' | 'in-progress' | 'awaiting-response' | 'resolved' | 'closed';
}

const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          text: 'Open',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50'
        };
      case 'in-progress':
        return {
          text: 'In Progress',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/50'
        };
      case 'awaiting-response':
        return {
          text: 'Awaiting Response',
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50'
        };
      case 'resolved':
        return {
          text: 'Resolved',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200/50'
        };
      case 'closed':
        return {
          text: 'Closed',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200/50'
        };
      default:
        return {
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200/50'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={`${config.className} font-medium px-2 py-1`}>
      {config.text}
    </Badge>
  );
};

export default TicketStatusBadge;
