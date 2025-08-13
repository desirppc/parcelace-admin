import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ChevronRight,
  Fingerprint,
  Wallet,
  Warehouse,
  Package,
  Truck,
  Settings,
  Zap,
  Link,
  BarChart3,
  Rocket,
  Target,
  Star,
  Award,
  TrendingUp,
  Users,
  Shield,
  CreditCard,
  MapPin,
  FileText,
  MessageSquare,
  MessageCircle,
  Bell,
  Cog,
  Home,
  Plus,
  Eye,
  Play,
  Pause,
  RefreshCw,
  ArrowLeft,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

interface Task {
  id: string;
  title: string;
  description: string;
  duration: string;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
  icon: any;
  route?: string;
  isCompleted?: boolean;
  isOptional?: boolean;
}

interface Section {
  id: string;
  title: string;
  subtitle?: string;
  duration: string;
  tasks: Task[];
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

const OnboardingChecklist = () => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useUser();

  // Filter out KYC section if user is already verified
  const isKycVerified = Boolean(user?.is_kyc_verified);
  
  const checklistData: Section[] = [
    // Only show KYC section if user is not verified
    ...(isKycVerified ? [] : [{
      id: 'kyc',
      title: 'Complete KYC',
      duration: '2 minutes',
      icon: Fingerprint,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      tasks: [
        {
          id: 'kyc-verify',
          title: 'Complete KYC',
          description: 'Verify your identity to start shipping',
          duration: '2 min',
          buttonText: 'Verify Now',
          buttonVariant: 'default' as const,
          icon: Fingerprint,
          route: '/dashboard/kyc'
        }
      ]
    }]),
    {
      id: 'ship-ready',
      title: 'Get Ready to Ship',
      duration: '8 minutes',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tasks: [
        {
          id: 'recharge-wallet',
          title: 'Recharge Wallet',
          description: 'Add funds to your shipping wallet',
          duration: '1 min',
          buttonText: 'Recharge Now',
          buttonVariant: 'default' as const,
          icon: Wallet,
          route: '/dashboard/finance/wallet-transaction'
        },
        {
          id: 'add-warehouse',
          title: 'Add Pickup Warehouse',
          description: 'Set up your pickup locations',
          duration: '2 min',
          buttonText: 'Add Now',
          buttonVariant: 'default' as const,
          icon: Warehouse,
          route: '/dashboard/warehouse'
        },
        {
          id: 'add-orders',
          title: 'Add Orders',
          description: 'Import or add your first orders',
          duration: '2 min',
          buttonText: 'Add Now',
          buttonVariant: 'default' as const,
          icon: Package,
          route: '/dashboard/orders/prepaid'
        },
        {
          id: 'courier-priority',
          title: 'Courier Priority',
          description: 'Configure your shipping preferences',
          duration: '2 min',
          buttonText: 'Configure',
          buttonVariant: 'outline' as const,
          icon: Truck,
          route: '/dashboard/shipments/courier-selection'
        },
        {
          id: 'ship-order',
          title: 'Ship Order',
          description: 'Complete your first shipment',
          duration: '1 min',
          buttonText: 'Ship Now',
          buttonVariant: 'default' as const,
          icon: Truck,
          route: '/dashboard/shipments/prepaid'
        }
      ]
    },
    {
      id: 'automate',
      title: 'Automate & Scale',
      subtitle: '(Put Stores on Steroids 🚀)',
      duration: '5 minutes',
      icon: Zap,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      tasks: [
        {
          id: 'integrate-store',
          title: 'Integrate Store',
          description: 'Connect your e-commerce platform',
          duration: '3 min',
          buttonText: 'Integrate',
          buttonVariant: 'default' as const,
          icon: Link,
          route: '/onboarding/shopify-integration'
        },
        {
          id: 'daily-reporting',
          title: 'Enable Daily Reporting',
          description: 'Get automated daily reports',
          duration: '2 min',
          buttonText: 'Enable',
          buttonVariant: 'default' as const,
          icon: BarChart3,
          route: '/dashboard/support/support-dashboard'
        }
      ]
    }
  ];

  const modules = [
    {
      id: 'return-ace',
      title: 'Return Ace',
      description: 'Streamline returns & exchanges with automated workflows',
      icon: ArrowLeft,
      gradient: 'from-blue-100 to-blue-200',
      iconBg: 'bg-blue-500',
      badge: 'Popular',
      badgeColor: 'bg-orange-500'
    },
    {
      id: 'notify-ace',
      title: 'Notify Ace',
      description: 'Send WhatsApp notifications for order updates',
      icon: Bell,
      gradient: 'from-green-100 to-green-200',
      iconBg: 'bg-green-500',
      badge: 'New',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'track-ace',
      title: 'Track Ace',
      description: 'Create custom branded tracking experiences',
      icon: Package,
      gradient: 'from-purple-100 to-purple-200',
      iconBg: 'bg-purple-500',
      badge: 'Branding',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'wa-ace-360',
      title: 'WA Ace 360',
      description: 'Complete WhatsApp business solution toolkit',
      icon: MessageCircle,
      gradient: 'from-yellow-100 to-yellow-200',
      iconBg: 'bg-orange-500',
      badge: 'Pro',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 'chat-ace-ai',
      title: 'Chat Ace AI',
      description: 'AI-powered customer support automation',
      icon: Bot,
      gradient: 'from-red-100 to-red-200',
      iconBg: 'bg-red-500',
      badge: 'AI',
      badgeColor: 'bg-blue-500'
    }
  ];

  const totalTasks = checklistData.reduce((sum, section) => sum + section.tasks.length, 0);
  const completionPercentage = Math.round((completedTasks.length / totalTasks) * 100);

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const markSectionCompleted = (sectionId: string) => {
    const section = checklistData.find(s => s.id === sectionId);
    if (section) {
      const sectionTaskIds = section.tasks.map(task => task.id);
      const allCompleted = sectionTaskIds.every(taskId => completedTasks.includes(taskId));
      
      if (allCompleted) {
        setCompletedTasks(prev => prev.filter(taskId => !sectionTaskIds.includes(taskId)));
        toast({
          title: "Section Unmarked",
          description: `${section.title} marked as incomplete`,
        });
      } else {
        setCompletedTasks(prev => [...new Set([...prev, ...sectionTaskIds])]);
        toast({
          title: "Section Completed",
          description: `${section.title} marked as complete`,
        });
      }
    }
  };

  const handleTaskAction = (task: Task) => {
    if (task.route) {
      // Navigate to the task route
      window.location.href = task.route;
    } else {
      // Mark as completed if no route
      toggleTaskCompletion(task.id);
      toast({
        title: "Task Completed",
        description: `${task.title} marked as complete`,
      });
    }
  };

  const handleSectionClick = (sectionId: string, event: React.MouseEvent) => {
    // Prevent event bubbling when clicking on buttons inside the header
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Toggle section expansion
    toggleSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 relative">
                  <div className="absolute inset-0 bg-white rounded-full opacity-20"></div>
                  <div className="absolute inset-1 bg-white rounded-full"></div>
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
                  <div className="absolute top-1.5 right-0.5 w-0.5 h-0.5 bg-white rounded-full"></div>
                </div>
                <span className="font-medium text-white">Welcome to ParcelAce</span>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Setup Progress</span>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {completionPercentage}% Complete
                </div>
              </div>
              
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100 border border-gray-200 mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                {completedTasks.length} of {totalTasks} tasks completed
              </p>
            </div>
          </div>



          {/* Checklist Sections */}
          <div className="space-y-4">
            {checklistData.map((section) => {
              const sectionTaskIds = section.tasks.map(task => task.id);
              const completedInSection = sectionTaskIds.filter(id => completedTasks.includes(id)).length;
              const sectionProgress = Math.round((completedInSection / section.tasks.length) * 100);
              const isExpanded = expandedSections.includes(section.id);
              const allCompleted = sectionTaskIds.every(id => completedTasks.includes(id));

              return (
                <Card 
                  key={section.id} 
                  className={`${section.bgColor} border-2 ${section.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer`}
                  onClick={(e) => handleSectionClick(section.id, e)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${section.bgColor} border ${section.borderColor}`}>
                          <section.icon className={`w-6 h-6 ${section.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                            {section.subtitle && (
                              <Badge variant="secondary" className="text-xs">
                                {section.subtitle}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{section.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className={`w-4 h-4 ${allCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                              <span>{completedInSection}/{section.tasks.length} completed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Progress for sections with multiple tasks */}
                        {section.tasks.length > 1 && (
                          <div className="w-24">
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 border border-gray-300">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 ease-in-out"
                                style={{ width: `${sectionProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Section completion button for multiple tasks */}
                        {section.tasks.length > 1 && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              markSectionCompleted(section.id);
                            }}
                            variant={allCompleted ? "outline" : "default"}
                            size="sm"
                            className="h-8"
                          >
                            {allCompleted ? 'Unmark All' : 'Mark All'}
                          </Button>
                        )}
                        
                        {/* Expand/Collapse button for multiple tasks */}
                        {section.tasks.length > 1 && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSection(section.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Tasks - Show all for single task sections, or based on expansion for multi-task sections */}
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {section.tasks.map((task) => {
                        const isCompleted = completedTasks.includes(task.id);
                        
                        // Show tasks if section has only one task, or if section is expanded
                        const shouldShowTask = section.tasks.length === 1 || isExpanded;
                        
                        if (!shouldShowTask) return null;
                        
                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white/80 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`p-2 rounded-lg ${
                                  isCompleted 
                                    ? 'bg-green-100 text-green-600' 
                                    : `${section.bgColor} ${section.color}`
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : (
                                    <task.icon className="w-5 h-5" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <h4 className={`font-medium ${
                                      isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                                    }`}>
                                      {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      <span>{task.duration}</span>
                                    </div>
                                  </div>
                                  <p className={`text-sm mt-1 ${
                                    isCompleted ? 'text-green-700' : 'text-muted-foreground'
                                  }`}>
                                    {task.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {task.route ? (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskAction(task);
                                    }}
                                    variant={task.buttonVariant}
                                    size="sm"
                                    className="h-8"
                                  >
                                    {task.buttonText}
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskCompletion(task.id);
                                    }}
                                    variant={isCompleted ? "outline" : "default"}
                                    size="sm"
                                    className="h-8"
                                  >
                                    {isCompleted ? 'Undo' : 'Mark as Done'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Power Modules Section */}
          <div className="mt-12">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Zap className="h-4 w-4" />
                Power Modules
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                Supercharge Your Operations
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Unlock advanced features and automation tools designed to scale your shipping business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card key={module.id} className={`p-6 hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 group bg-gradient-to-br ${module.gradient}`}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-full ${module.iconBg} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        {module.badge && (
                          <Badge className={`${module.badgeColor} text-white text-xs px-2 py-1`}>
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between text-left p-0 h-auto font-medium text-blue-600 hover:text-blue-700 hover:bg-transparent group-hover:translate-x-1 transition-all duration-300"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default OnboardingChecklist; 