
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Clock, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import FinanceCounter from './FinanceCounter';

const EarlyCODPlans = () => {
  const [acceptedTerms, setAcceptedTerms] = useState<{ [key: string]: boolean }>({});
  const [activePlan, setActivePlan] = useState('free');

  const counters = [
    {
      label: 'Active Plan',
      value: 'Free',
      icon: CheckCircle,
    },
    {
      label: 'Savings from Early COD',
      value: '₹12,450',
      icon: TrendingUp,
      trend: { value: '25.3%', isPositive: true }
    },
    {
      label: 'Total Early COD Amount',
      value: '₹89,670',
      icon: DollarSign,
      trend: { value: '18.7%', isPositive: true }
    },
    {
      label: 'Average Processing Time',
      value: '2.5 Days',
      icon: Clock,
      trend: { value: '1.2 Days', isPositive: true }
    }
  ];

  const plans = [
    {
      id: 'free',
      name: 'Free',
      charges: '0',
      remittanceFrequency: 'Daily',
      description: 'Basic COD processing with standard timeline',
      features: [
        'Standard COD processing',
        'Daily remittance',
        'Basic support',
        '7-10 days settlement'
      ],
      isActive: activePlan === 'free'
    },
    {
      id: 'smart-3-day',
      name: 'Smart 3-Day',
      charges: '0.5% of invoice value',
      remittanceFrequency: 'Daily',
      description: 'Accelerated COD settlement in 3 business days',
      features: [
        'COD settlement in 3 days',
        'Daily remittance',
        'Priority support',
        'Real-time tracking'
      ],
      isActive: activePlan === 'smart-3-day'
    },
    {
      id: 'quick-2-day',
      name: 'Quick 2-Day',
      charges: '0.5% of invoice value',
      remittanceFrequency: 'Daily',
      description: 'Fast COD settlement in 2 business days',
      features: [
        'COD settlement in 2 days',
        'Daily remittance',
        'Priority support',
        'Dedicated account manager'
      ],
      isActive: activePlan === 'quick-2-day'
    },
    {
      id: 'next-day',
      name: 'Next Day',
      charges: '1% of invoice value',
      remittanceFrequency: 'Daily',
      description: 'Lightning fast next-day COD settlement',
      features: [
        'Next-day COD settlement',
        'Daily remittance',
        '24/7 premium support',
        'Advanced analytics',
        'Risk protection'
      ],
      isActive: activePlan === 'next-day'
    }
  ];

  const handlePlanUpgrade = (planId: string) => {
    if (acceptedTerms[planId]) {
      setActivePlan(planId);
      // In real implementation, you would call an API to upgrade the plan
      console.log(`Upgrading to plan: ${planId}`);
    }
  };

  const handleTermsAcceptance = (planId: string, accepted: boolean) => {
    setAcceptedTerms(prev => ({ ...prev, [planId]: accepted }));
  };

  return (
    <div className="space-y-6">
      <FinanceCounter counters={counters} />
      
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent mb-2">
            Early COD Plans
          </h2>
          <p className="text-muted-foreground">
            Choose a plan that fits your business needs for faster COD settlements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                plan.isActive 
                  ? 'ring-2 ring-primary shadow-lg bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20' 
                  : 'hover:bg-gradient-to-br hover:from-purple-50/30 hover:to-blue-50/30 dark:hover:from-purple-900/10 dark:hover:to-blue-900/10'
              }`}
            >
              {plan.isActive && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-blue-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  ACTIVATED
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    plan.isActive 
                      ? 'bg-gradient-to-br from-pink-500 to-blue-600' 
                      : 'bg-secondary'
                  }`}>
                    <Zap className={`w-4 h-4 ${plan.isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {plan.charges === '0' ? 'Free' : plan.charges}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.remittanceFrequency} remittance
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Features:</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {!plan.isActive && (
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id={`terms-${plan.id}`}
                        checked={acceptedTerms[plan.id] || false}
                        onCheckedChange={(checked) => handleTermsAcceptance(plan.id, checked as boolean)}
                      />
                      <label 
                        htmlFor={`terms-${plan.id}`}
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        I accept the terms and conditions for this plan
                      </label>
                    </div>
                  )}

                  <Button
                    className={`w-full ${
                      plan.isActive
                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700'
                    }`}
                    onClick={() => handlePlanUpgrade(plan.id)}
                    disabled={plan.isActive || (!acceptedTerms[plan.id] && !plan.isActive)}
                  >
                    {plan.isActive ? 'Activated' : 'Upgrade'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarlyCODPlans;
