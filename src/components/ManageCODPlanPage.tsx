import React, { useState, useEffect } from 'react';
import { Loader2, Zap, CheckCircle, IndianRupee, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/config/api';

interface CODPlan {
  id: number;
  user_id: number | null;
  name: string;
  description: string;
  percentage: number;
  days: string;
  remittance_frequency: string | null;
  is_default: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CODPlansResponse {
  cod_plans: CODPlan[];
  current_plan: CODPlan;
  pagination: {
    current_page: number;
    last_page: number;
    total_page: number;
    per_page: number;
    total: number;
  };
}

const ManageCODPlanPage = () => {
  const [plans, setPlans] = useState<CODPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CODPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<{ [key: number]: boolean }>({});
  const [upgrading, setUpgrading] = useState<{ [key: number]: boolean }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    percentage: '',
    days: '',
    remittance_frequency: '',
    is_default: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCODPlans();
  }, []);

  const fetchCODPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('api/cod-plans/list', 'GET');

      if (response.success && response.data) {
        const data = response.data as CODPlansResponse;
        setPlans(data.cod_plans || []);
        setCurrentPlan(data.current_plan || null);
      } else {
        setError(response.message || 'Failed to fetch COD plans');
        toast({
          title: 'Error',
          description: response.message || 'Failed to fetch COD plans',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (planId: number, checked: boolean) => {
    setSelectedPlans((prev) => ({
      ...prev,
      [planId]: checked,
    }));
  };

  const handleUpgrade = async (plan: CODPlan) => {
    if (!selectedPlans[plan.id]) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms and conditions to upgrade',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpgrading((prev) => ({ ...prev, [plan.id]: true }));

      // TODO: Implement upgrade API call when available
      // const response = await apiRequest('api/cod-plans/upgrade', 'POST', { plan_id: plan.id });

      // For now, show a success message
      toast({
        title: 'Upgrade Requested',
        description: `Upgrade to ${plan.name} plan has been requested.`,
      });

      // Refresh plans after upgrade
      await fetchCODPlans();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade plan';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpgrading((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  const handleCreatePlan = async () => {
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Plan name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Description is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.percentage || parseFloat(formData.percentage) < 0) {
      toast({
        title: 'Validation Error',
        description: 'Valid percentage is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.days || parseInt(formData.days) < 1) {
      toast({
        title: 'Validation Error',
        description: 'Valid days (minimum 1) is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.remittance_frequency || parseInt(formData.remittance_frequency) < 1) {
      toast({
        title: 'Validation Error',
        description: 'Valid remittance frequency is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        percentage: parseFloat(formData.percentage),
        days: parseInt(formData.days),
        remittance_frequency: parseInt(formData.remittance_frequency),
        is_default: formData.is_default,
      };

      const response = await apiRequest('api/cod-plans/insert', 'POST', payload);

      if (response.success) {
        toast({
          title: 'Success',
          description: response.data?.message || 'Plan created successfully',
        });
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          percentage: '',
          days: '',
          remittance_frequency: '',
          is_default: 0,
        });
        await fetchCODPlans();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create plan',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create plan';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlan = async (planId: number, planName: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting((prev) => ({ ...prev, [planId]: true }));

      const response = await apiRequest('api/cod-plans/delete', 'POST', { id: planId });

      if (response.success) {
        toast({
          title: 'Success',
          description: response.data?.message || 'Plan deleted successfully',
        });
        await fetchCODPlans();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete plan',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete plan';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [planId]: false }));
    }
  };

  const getFeaturesForPlan = (plan: CODPlan): string[] => {
    const baseFeatures = ['Priority support', 'Real-time tracking'];
    
    if (plan.name === 'PRO') {
      return [
        `COD settlement in ${plan.days} day`,
        'Daily remittance',
        ...baseFeatures,
        'Risk protection',
      ];
    } else if (plan.name === 'Premier') {
      return [
        `COD settlement in ${plan.days} days`,
        'Daily remittance',
        ...baseFeatures,
      ];
    } else if (plan.name === 'Essential') {
      return [
        `COD settlement in ${plan.days} days`,
        'Daily remittance',
        ...baseFeatures,
      ];
    } else {
      // Current Plan
      return [
        `COD settlement in ${plan.days} days`,
        'Daily remittance',
        ...baseFeatures,
      ];
    }
  };

  const isCurrentPlan = (plan: CODPlan): boolean => {
    return currentPlan?.id === plan.id || plan.is_default === 1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading COD Plans</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchCODPlans}>Retry</Button>
        </div>
      </div>
    );
  }

  // Sort plans: PRO first, then Premier, Essential, Current Plan last
  const sortedPlans = [...plans].sort((a, b) => {
    const order = { PRO: 1, Premier: 2, Essential: 3, 'Current Plan': 4 };
    const aOrder = order[a.name as keyof typeof order] || 5;
    const bOrder = order[b.name as keyof typeof order] || 5;
    return aOrder - bOrder;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Early COD Plans</h1>
          <p className="text-muted-foreground">
            Choose a plan that fits your business needs for faster COD settlements.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedPlans.map((plan) => {
          const isActive = isCurrentPlan(plan);
          const isPopular = plan.name === 'Premier';

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                isActive ? 'border-2 border-blue-500' : 'border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold py-1 px-3 text-center">
                  MOST POPULAR
                </div>
              )}

              {/* Activated Badge */}
              {isActive && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                  ACTIVATED
                </div>
              )}

              <CardHeader className={`pb-4 ${isPopular ? 'pt-8' : isActive ? 'pt-8' : 'pt-6'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  </div>
                  {!isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                      disabled={deleting[plan.id]}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleting[plan.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {plan.percentage === 0 ? 'Free' : `${plan.percentage}% of invoice value`}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.days} {plan.days === '1' ? 'day' : 'days'} settlement
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-2">
                  {getFeaturesForPlan(plan).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {!isActive && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`terms-${plan.id}`}
                        checked={selectedPlans[plan.id] || false}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(plan.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`terms-${plan.id}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        I accept the terms and conditions for this plan
                      </label>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading[plan.id]}
                    >
                      {upgrading[plan.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Upgrading...
                        </>
                      ) : (
                        'Upgrade'
                      )}
                    </Button>
                  </div>
                )}

                {isActive && (
                  <div className="pt-4 border-t">
                    <Button
                      className="w-full bg-gray-400 text-white cursor-not-allowed"
                      disabled
                    >
                      Activated
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Plan Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New COD Plan</DialogTitle>
            <DialogDescription>
              Fill in the details to create a custom COD plan for your business.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                placeholder="e.g., T55, Premium Plan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="e.g., This is a special COD plan for bulk shipments."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="percentage">Percentage (%) *</Label>
                <Input
                  id="percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 1.0"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days">Settlement Days *</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  placeholder="e.g., 1"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remittance_frequency">Remittance Frequency *</Label>
              <Input
                id="remittance_frequency"
                type="number"
                min="1"
                placeholder="e.g., 2"
                value={formData.remittance_frequency}
                onChange={(e) => setFormData({ ...formData, remittance_frequency: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Number of times remittance occurs (e.g., 2 for twice weekly)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_default"
                checked={formData.is_default === 1}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_default: checked ? 1 : 0 })
                }
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Set as default plan
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({
                  name: '',
                  description: '',
                  percentage: '',
                  days: '',
                  remittance_frequency: '',
                  is_default: 0,
                });
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={creating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCODPlanPage;
