import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, Check, Store, Globe, Package, Target, Building, ShoppingBag, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import API_CONFIG from '@/config/api';

interface OnboardingData {
  businessType: string;
  platforms: string[];
  monthlyOrders: string;
  primaryGoals: string[];
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onNavigateBack: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onNavigateBack
}) => {
  console.log('OnboardingWizard props:', { onComplete, onNavigateBack });
  console.log('onComplete type:', typeof onComplete);
  console.log('onComplete function:', onComplete);
  console.log('onNavigateBack type:', typeof onNavigateBack);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    businessType: '',
    platforms: [],
    monthlyOrders: '',
    primaryGoals: []
  });
  const { toast } = useToast();
  const { setUser } = useUser();

  const [onboardingData, setOnboardingData] = useState<any>(null);

  // Load onboarding data from user data
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData.onboardingData) {
      setOnboardingData(userData.onboardingData);
    }
  }, []);

  const businessTypes = [
    {
      id: 'ecommerce',
      title: 'E-Commerce Seller',
      description: 'Online store owner selling products directly to consumers',
      icon: ShoppingBag,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'corporate',
      title: 'Corporate',
      description: 'Medium-sized business with regular shipping needs',
      icon: Building,
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      description: 'Large organization with high-volume shipping requirements',
      icon: Globe,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const platforms = [
    { id: 'shopify', name: 'Shopify', subtitle: 'Website Store', icon: '🛍️', color: 'from-green-400 to-green-600' },
    { id: 'woocommerce', name: 'WooCommerce', subtitle: 'WordPress Store', icon: '🔧', color: 'from-blue-400 to-blue-600' },
    { id: 'instagram', name: 'Instagram', subtitle: 'Social Store', icon: '📸', color: 'from-pink-400 to-pink-600' },
    { id: 'amazon', name: 'Amazon', subtitle: 'Marketplace', icon: '📦', color: 'from-yellow-400 to-orange-500' },
    { id: 'flipkart', name: 'Flipkart', subtitle: 'Marketplace', icon: '🛒', color: 'from-blue-500 to-indigo-600' },
    { id: 'others', name: 'Others', subtitle: 'Any other platform', icon: '➕', color: 'from-gray-400 to-gray-600' }
  ];

  const orderRanges = [
    { id: '10-50', label: '10–50', subtitle: 'Perfect for getting started', icon: '📈' },
    { id: '51-200', label: '51–200', subtitle: 'Growing business', icon: '🚀' },
    { id: '201-500', label: '201–500', subtitle: 'Established business', icon: '📊' },
    { id: '500+', label: '500+', subtitle: 'High-volume operations', icon: '🏭' }
  ];

  const goals = [
    { id: 'lowest-rates', label: 'Lowest courier rates', icon: '💰' },
    { id: 'timely-delivery', label: 'Timely pickup & delivery', icon: '⚡' },
    { id: 'reduce-rto', label: 'Reduce fake RTOs', icon: '🛡️' },
    { id: 'good-support', label: 'Good support when needed', icon: '🤝' },
    { id: 'faster-cod', label: 'Faster COD settlement', icon: '💳' }
  ];

  const stepNames = ['Business', 'Platform', 'Volume', 'Goals'];

  const handleBusinessTypeSelect = (type: string) => {
    setFormData({ ...formData, businessType: type });
  };

  const handlePlatformToggle = (platformId: string) => {
    const updatedPlatforms = formData.platforms.includes(platformId)
      ? formData.platforms.filter(p => p !== platformId)
      : [...formData.platforms, platformId];
    setFormData({ ...formData, platforms: updatedPlatforms });
  };

  const handleOrderRangeSelect = (range: string) => {
    setFormData({ ...formData, monthlyOrders: range });
  };

  const handleGoalToggle = (goalId: string) => {
    const updatedGoals = formData.primaryGoals.includes(goalId)
      ? formData.primaryGoals.filter(g => g !== goalId)
      : [...formData.primaryGoals, goalId];
    setFormData({ ...formData, primaryGoals: updatedGoals });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.businessType !== '';
      case 2: return formData.platforms.length > 0;
      case 3: return formData.monthlyOrders !== '';
      case 4: return formData.primaryGoals.length > 0;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit onboarding data
      await handleSubmitOnboarding();
    }
  };

  const handleSubmitOnboarding = async () => {
    setIsLoading(true);
    
    try {
      // Get auth token from session storage
      const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // Prepare data for API
      const onboardingData = {
        primary_goal: formData.primaryGoals,
        monthly_order: formData.monthlyOrders,
        sales_platform: formData.platforms.join(', '),
        waba_service: "No",
        comment: formData.businessType,
        current_vendor: ["NA"],
        return_service: "No"
      };

      console.log('Submitting onboarding data:', onboardingData);
      console.log('onComplete function:', typeof onComplete, onComplete);

      const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ONBOARDING}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(onboardingData),
        mode: 'cors',
        credentials: 'omit'
      });

      const data = await response.json();
      console.log('Onboarding response:', data);

      if (response.ok && data.status) {
        // Update user data with onboarding completion
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        userData.is_onboarding_filled = true;
        localStorage.setItem('user_data', JSON.stringify(userData));
        sessionStorage.setItem('user_data', JSON.stringify(userData));
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Update user in context
        setUser(userData);

        toast({
          title: "Onboarding Complete",
          description: "Your account has been set up successfully!",
        });

        // Check if onComplete is a function before calling it
        console.log('About to call onComplete, type:', typeof onComplete);
        if (typeof onComplete === 'function') {
          try {
            onComplete();
            console.log('onComplete called successfully');
          } catch (error) {
            console.error('Error calling onComplete:', error);
            // Fallback: navigate to orders page
            window.location.href = '/orders';
          }
        } else {
          console.error('onComplete is not a function:', onComplete);
          console.error('onComplete value:', onComplete);
          // Fallback: navigate to orders page
          window.location.href = '/orders';
        }
      } else {
        toast({
          title: "Onboarding Failed",
          description: data?.message || "Failed to complete onboarding. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If we're at step 1, go back to previous screen
      if (typeof onNavigateBack === 'function') {
        onNavigateBack();
      } else {
        console.error('onNavigateBack is not a function:', onNavigateBack);
        // Fallback: go back in browser history
        window.history.back();
      }
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Business Type';
      case 2: return 'Platform Selection';
      case 3: return 'Monthly Volume';
      case 4: return 'Primary Goals';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'What best describes your business?';
      case 2: return 'Where do you sell online?';
      case 3: return 'How many shipments do you ship monthly?';
      case 4: return 'What are your primary goals with ParcelAce?';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      {/* Debug info */}
      <div className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded text-xs z-50">
        Debug: onComplete={typeof onComplete}, onNavigateBack={typeof onNavigateBack}
      </div>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome to ParcelAce
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Let's set up your shipping operations in just a few quick steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step === currentStep 
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-110' 
                      : step < currentStep 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800'
                  }`}>
                    {step < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                    {stepNames[step - 1]}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                    step < currentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Step {currentStep} of 4 • {getStepTitle()}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardHeader className="text-center pb-8 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-300 mt-2">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 bg-white dark:bg-slate-800">
            {/* Step 1: Business Type */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
                  Helps us understand your operations so we can tailor the experience for you.
                </p>
                {businessTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleBusinessTypeSelect(type.id)}
                      className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        formData.businessType === type.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg'
                          : 'border-slate-200 hover:border-blue-300 bg-white dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${type.color} shadow-lg`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-xl text-slate-900 dark:text-white mb-1">{type.title}</h3>
                          <p className="text-slate-600 dark:text-slate-300">{type.description}</p>
                        </div>
                        {formData.businessType === type.id && (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 2: Platforms */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select all the platforms or marketplaces where you currently sell your products.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        formData.platforms.includes(platform.id)
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg'
                          : 'border-slate-200 hover:border-blue-300 bg-white dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="text-center space-y-3">
                        <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center bg-gradient-to-r ${platform.color} shadow-md`}>
                          <span className="text-2xl">{platform.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{platform.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{platform.subtitle}</p>
                        </div>
                        {formData.platforms.includes(platform.id) && (
                           <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Monthly Orders */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This helps us recommend the best shipping plan for your business.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderRanges.map((range) => (
                    <div
                      key={range.id}
                      onClick={() => handleOrderRangeSelect(range.id)}
                      className={`group relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        formData.monthlyOrders === range.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg'
                          : 'border-slate-200 hover:border-blue-300 bg-white dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="text-center space-y-4">
                        <div className="text-4xl">{range.icon}</div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{range.label}</h3>
                          <p className="text-slate-600 dark:text-slate-300 mt-1">{range.subtitle}</p>
                        </div>
                        {formData.monthlyOrders === range.id && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Primary Goals */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
                  Pick the top priorities that matter most to your business.
                </p>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                        formData.primaryGoals.includes(goal.id)
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-md'
                          : 'border-slate-200 hover:border-blue-300 bg-white dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{goal.icon}</div>
                        <div className="flex-1">
                          <span className="font-medium text-slate-900 dark:text-white">{goal.label}</span>
                        </div>
                        <Checkbox
                          checked={formData.primaryGoals.includes(goal.id)}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pb-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-8 py-6 text-lg rounded-xl border-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex items-center space-x-2 px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span>
              {isLoading 
                ? 'Submitting...' 
                : currentStep === 4 
                  ? 'Complete Setup' 
                  : 'Continue'
              }
            </span>
            {!isLoading && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard; 