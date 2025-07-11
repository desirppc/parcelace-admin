import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  User, 
  CreditCard, 
  Building, 
  FileText,
  Smartphone,
  Globe,
  Package,
  Truck,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrdersPage from './OrdersPage';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  subSteps: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }[];
}

const OnboardingContent = ({ activeMenuItem }: { activeMenuItem: string }) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'account-setup',
      title: 'Account Setup',
      description: 'Complete your account verification and setup',
      icon: User,
      completed: false,
      subSteps: [
        {
          id: 'verify-kyc',
          title: 'Verify KYC',
          description: 'Complete your Know Your Customer verification',
          completed: false
        },
        {
          id: 'add-bank',
          title: 'Add Bank Details',
          description: 'Add your bank account for payments',
          completed: false
        },
        {
          id: 'billing-details',
          title: 'Add Billing Details',
          description: 'Complete your billing information',
          completed: false
        }
      ]
    },
    {
      id: 'integration-setup',
      title: 'Integration Setup',
      description: 'Connect your store and configure settings',
      icon: Globe,
      completed: false,
      subSteps: [
        {
          id: 'shopify-connect',
          title: 'Connect Shopify Store',
          description: 'Integrate your Shopify store with our platform',
          completed: false
        },
        {
          id: 'webhook-setup',
          title: 'Setup Webhooks',
          description: 'Configure automated order processing',
          completed: false
        },
        {
          id: 'test-integration',
          title: 'Test Integration',
          description: 'Verify everything is working correctly',
          completed: false
        }
      ]
    },
    {
      id: 'first-shipment',
      title: 'First Shipment',
      description: 'Create and process your first shipment',
      icon: Package,
      completed: false,
      subSteps: [
        {
          id: 'create-order',
          title: 'Create Test Order',
          description: 'Create your first test order',
          completed: false
        },
        {
          id: 'book-shipment',
          title: 'Book Shipment',
          description: 'Book your first shipment',
          completed: false
        },
        {
          id: 'track-shipment',
          title: 'Track Shipment',
          description: 'Learn how to track your shipments',
          completed: false
        }
      ]
    },
    {
      id: 'customize-settings',
      title: 'Customize Settings',
      description: 'Personalize your dashboard and preferences',
      icon: Settings,
      completed: false,
      subSteps: [
        {
          id: 'brand-customization',
          title: 'Brand Customization',
          description: 'Customize your tracking page with your brand',
          completed: false
        },
        {
          id: 'notification-settings',
          title: 'Notification Settings',
          description: 'Configure your notification preferences',
          completed: false
        },
        {
          id: 'api-setup',
          title: 'API Setup',
          description: 'Set up API keys for advanced integration',
          completed: false
        }
      ]
    }
  ];

  const markStepCompleted = (stepId: string, subStepId?: string) => {
    if (subStepId) {
      setCompletedSteps(prev => [...prev, `${stepId}-${subStepId}`]);
    } else {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const isStepCompleted = (stepId: string, subStepId?: string) => {
    const key = subStepId ? `${stepId}-${subStepId}` : stepId;
    return completedSteps.includes(key);
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Show OrdersPage for order-related menu items
  if (activeMenuItem === 'orders' || activeMenuItem === 'prepaid-orders' || activeMenuItem === 'reverse-orders') {
    return <OrdersPage />;
  }

  if (activeMenuItem === 'onboarding' || activeMenuItem === 'account-setup') {
    const CurrentStepIcon = onboardingSteps[currentStep].icon;
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">Welcome to ShipFast!</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {onboardingSteps.length}
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-600 rounded-lg flex items-center justify-center">
                <CurrentStepIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{onboardingSteps[currentStep].title}</CardTitle>
                <p className="text-muted-foreground">{onboardingSteps[currentStep].description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {onboardingSteps[currentStep].subSteps.map((subStep, index) => (
                <div key={subStep.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                  <button
                    onClick={() => markStepCompleted(onboardingSteps[currentStep].id, subStep.id)}
                    className="flex-shrink-0"
                  >
                    {isStepCompleted(onboardingSteps[currentStep].id, subStep.id) ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{subStep.title}</h3>
                    <p className="text-sm text-muted-foreground">{subStep.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {isStepCompleted(onboardingSteps[currentStep].id, subStep.id) ? 'Completed' : 'Start'}
                  </Button>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button 
                onClick={nextStep}
                disabled={currentStep === (onboardingSteps.length - 1)}
                className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Steps Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {onboardingSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Card 
                key={step.id}
                className={`cursor-pointer transition-all duration-200 ${
                  index === currentStep ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isStepCompleted(step.id) ? 'bg-green-500' : 'bg-secondary'
                    }`}>
                      {isStepCompleted(step.id) ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <StepIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-foreground">{step.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{step.description}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {step.subSteps.filter(sub => isStepCompleted(step.id, sub.id)).length}/{step.subSteps.length} completed
                    </div>
                    <div className="w-16 h-1 bg-secondary rounded-full">
                      <div 
                        className="h-1 bg-green-500 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(step.subSteps.filter(sub => isStepCompleted(step.id, sub.id)).length / step.subSteps.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Default content for other menu items
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
            {activeMenuItem.charAt(0).toUpperCase() + activeMenuItem.slice(1).replace('-', ' ')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Content for {activeMenuItem} will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingContent;
