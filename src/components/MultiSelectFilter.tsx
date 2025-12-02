import React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  options,
  selectedValues,
  onValueChange,
  placeholder = 'Select...',
  className
}) => {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter(v => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange([]);
  };

  const displayText = selectedValues.length === 0
    ? placeholder
    : selectedValues.length === 1
    ? options.find(opt => opt.value === selectedValues[0])?.label || placeholder
    : `${selectedValues.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-32 h-8 justify-between text-sm font-normal bg-white border-gray-300 hover:bg-gray-50",
            className
          )}
        >
          <span className="truncate text-gray-700">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-white border border-gray-200 shadow-lg" align="start">
        <div className="space-y-1">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleToggle(option.value)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(option.value)}
                />
                <label className="text-sm font-normal cursor-pointer flex-1 text-gray-700">
                  {option.label}
                </label>
              </div>
            );
          })}
          {selectedValues.length > 0 && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={handleClear}
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

