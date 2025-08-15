
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Clock, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';

interface CounterProps {
  title: string;
  count: number;
  icon: React.ElementType;
  variant: 'open' | 'progress' | 'awaiting' | 'overdue' | 'resolved';
}

const Counter: React.FC<CounterProps> = ({ title, count, icon: Icon, variant }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'open':
        return 'from-blue-500/20 to-blue-600/20 border-blue-200/50 dark:border-blue-800/50';
      case 'progress':
        return 'from-yellow-500/20 to-orange-600/20 border-yellow-200/50 dark:border-yellow-800/50';
      case 'awaiting':
        return 'from-purple-500/20 to-purple-600/20 border-purple-200/50 dark:border-purple-800/50';
      case 'overdue':
        return 'from-red-500/20 to-red-600/20 border-red-200/50 dark:border-red-800/50';
      case 'resolved':
        return 'from-green-500/20 to-green-600/20 border-green-200/50 dark:border-green-800/50';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-200/50 dark:border-gray-800/50';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'open':
        return 'text-blue-600 dark:text-blue-400';
      case 'progress':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'awaiting':
        return 'text-purple-600 dark:text-purple-400';
      case 'overdue':
        return 'text-red-600 dark:text-red-400';
      case 'resolved':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card className={`bg-gradient-to-r ${getVariantStyles()} backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${getIconColor()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{count}</div>
      </CardContent>
    </Card>
  );
};

interface SupportCounterProps {
  stats: {
    open: number;
    inProgress: number;
    awaitingResponse: number;
    overdue: number;
    resolvedWithinSLA: number;
  };
}

const SupportCounter: React.FC<SupportCounterProps> = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Counter
        title="Open Tickets"
        count={stats.open}
        icon={MessageSquare}
        variant="open"
      />
      <Counter
        title="In Progress"
        count={stats.inProgress}
        icon={Clock}
        variant="progress"
      />
      <Counter
        title="Awaiting Response"
        count={stats.awaitingResponse}
        icon={MessageCircle}
        variant="awaiting"
      />
      <Counter
        title="Overdue"
        count={stats.overdue}
        icon={AlertTriangle}
        variant="overdue"
      />
      <Counter
        title="Resolved within SLA"
        count={stats.resolvedWithinSLA}
        icon={CheckCircle}
        variant="resolved"
      />
    </div>
  );
};

export default SupportCounter;
