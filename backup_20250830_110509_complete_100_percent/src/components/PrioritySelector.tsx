
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Minus, ArrowUp } from 'lucide-react';

interface PrioritySelectorProps {
  value: 'high' | 'medium' | 'low';
  onValueChange: (value: 'high' | 'medium' | 'low') => void;
  disabled?: boolean;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({ 
  value, 
  onValueChange, 
  disabled = false 
}) => {
  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200/50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/50">
            <ArrowUp className="w-3 h-3 mr-1" />
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200/50">
            <Minus className="w-3 h-3 mr-1" />
            Low
          </Badge>
        );
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {getPriorityBadge(value)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="high">
          <div className="flex items-center">
            <AlertTriangle className="w-3 h-3 mr-2 text-red-600" />
            High Priority
          </div>
        </SelectItem>
        <SelectItem value="medium">
          <div className="flex items-center">
            <ArrowUp className="w-3 h-3 mr-2 text-yellow-600" />
            Medium Priority
          </div>
        </SelectItem>
        <SelectItem value="low">
          <div className="flex items-center">
            <Minus className="w-3 h-3 mr-2 text-green-600" />
            Low Priority
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PrioritySelector;
