
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CounterItem {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface FinanceCounterProps {
  counters: CounterItem[];
}

const FinanceCounter = ({ counters }: FinanceCounterProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {counters.map((counter, index) => {
        const IconComponent = counter.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{counter.label}</p>
                  <p className="text-2xl font-bold text-foreground">{counter.value}</p>
                  {counter.trend && (
                    <p className={`text-xs ${counter.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {counter.trend.isPositive ? '↑' : '↓'} {counter.trend.value}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FinanceCounter;
