
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, CheckCircle, Loader2 } from 'lucide-react';
import { CODPlansService, CODPlan } from '@/services/codPlansService';
import { useToast } from '@/hooks/use-toast';

const EarlyCODPlans = () => {
  const [acceptedTerms, setAcceptedTerms] = useState<{ [key: string]: boolean }>({});
  const [activePlan, setActivePlan] = useState<number | null>(null);
  const [plans, setPlans] = useState<CODPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CODPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCODPlans();
  }, []);

  const fetchCODPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CODPlansService.getCODPlans();
      
      if (response.success && response.data) {
        // Sort plans: Next Day first, Free plan last
        const sortedPlans = response.data.cod_plans.sort((a, b) => {
          // Next Day (1 day) comes first
          if (a.days === '1') return -1;
          if (b.days === '1') return 1;
          // Free plan (0%) comes last
          if (a.percentage === 0) return 1;
          if (b.percentage === 0) return -1;
          // Sort by days (ascending)
          return parseInt(a.days) - parseInt(b.days);
        });
        
        setPlans(sortedPlans);
        setCurrentPlan(response.data.current_plan);
        setActivePlan(response.data.current_plan.id);
      } else {
        setError(response.error || 'Failed to fetch COD plans');
      }
    } catch (err) {
      setError('An error occurred while fetching COD plans');
      console.error('Error fetching COD plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpgrade = async (planId: number) => {
    if (!acceptedTerms[planId]) {
      return;
    }

    try {
      setUpgradingPlan(planId);
      
      const response = await CODPlansService.assignPlanToUser(planId, true);
      
      if (response.success) {
        setActivePlan(planId);
        
        // Show success toast notification
        toast({
          title: "Plan Upgraded Successfully!",
          description: `You have been upgraded to ${plans.find(p => p.id === planId)?.name} plan.`,
          variant: "default",
        });
        
        // Refresh the plans to get updated current plan
        await fetchCODPlans();
      } else {
        setError(response.error || 'Failed to upgrade plan. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while upgrading the plan. Please try again.');
      console.error('Error upgrading plan:', err);
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleTermsAcceptance = (planId: number, accepted: boolean) => {
    setAcceptedTerms(prev => ({ ...prev, [planId]: accepted }));
  };

  const formatCharges = (percentage: number): string => {
    if (percentage === 0) return 'Free';
    return `${percentage}% of invoice value`;
  };

  const isMostPopular = (plan: CODPlan): boolean => {
    // Quick 2-Day plan is marked as most popular
    return plan.days === '2' && plan.percentage === 0.7;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading COD plans...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchCODPlans} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                plan.id === activePlan
                  ? 'ring-2 ring-primary shadow-lg bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20' 
                  : 'hover:bg-gradient-to-br hover:from-purple-50/30 hover:to-blue-50/30 dark:hover:from-purple-900/10 dark:hover:to-blue-900/10'
              }`}
            >
              {plan.id === activePlan && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-blue-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  ACTIVATED
                </div>
              )}
              
              {isMostPopular(plan) && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 text-xs font-medium rounded-br-lg">
                  MOST POPULAR
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    plan.id === activePlan
                      ? 'bg-gradient-to-br from-pink-500 to-blue-600' 
                      : 'bg-secondary'
                  }`}>
                    <Zap className={`w-4 h-4 ${plan.id === activePlan ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCharges(plan.percentage)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.days} {parseInt(plan.days) === 1 ? 'day' : 'days'} settlement
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
                    <li className="text-xs text-muted-foreground flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      COD settlement in {plan.days} {parseInt(plan.days) === 1 ? 'day' : 'days'}
                    </li>
                    <li className="text-xs text-muted-foreground flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      Daily remittance
                    </li>
                    <li className="text-xs text-muted-foreground flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      Priority support
                    </li>
                    {parseInt(plan.days) <= 2 && (
                      <li className="text-xs text-muted-foreground flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                        Real-time tracking
                      </li>
                    )}
                    {parseInt(plan.days) === 1 && (
                      <li className="text-xs text-muted-foreground flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                        Risk protection
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {plan.id !== activePlan && (
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
                      plan.id === activePlan
                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700'
                    }`}
                    onClick={() => handlePlanUpgrade(plan.id)}
                    disabled={plan.id === activePlan || (!acceptedTerms[plan.id] && plan.id !== activePlan) || upgradingPlan === plan.id}
                  >
                    {upgradingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Upgrading...
                      </>
                    ) : plan.id === activePlan ? (
                      'Activated'
                    ) : (
                      'Upgrade'
                    )}
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
