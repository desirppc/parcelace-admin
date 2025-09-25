import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { InteractiveDemoModal } from '@/components/InteractiveDemoModal';
import { DeactivationModal } from '@/components/DeactivationModal';
import { PreviewModal } from '@/components/PreviewModal';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Mail, 
  Users, 
  Heart, 
  User, 
  TrendingDown, 
  Eye,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Check,
  Sparkles,
  Package,
  Truck,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotifyAce() {
  const [activeTab, setActiveTab] = useState('whatsapp');

  const [expandedHistory, setExpandedHistory] = useState<number[]>([]);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewStatus, setPreviewStatus] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [statusToggles, setStatusToggles] = useState({
    'Order Confirmed': true,
    'Packed': true,
    'Shipped': true,
    'Out For Delivery': true,
    'Arriving Early': false,
    'Delivery Delayed': true,
    'Delivered': true,
    'Picked Up': false
  });
  const [showImageToggles, setShowImageToggles] = useState({
    'Order Confirmed': true,
    'Packed': true,
    'Shipped': true,
    'Out For Delivery': true,
    'Arriving Early': false,
    'Delivery Delayed': true,
    'Delivered': true,
    'Picked Up': false
  });
  const [emailSettings, setEmailSettings] = useState({
    hideProductNameImage: false,
    hideProductPrice: false
  });

  const { toast } = useToast();

  const benefits = [
    {
      icon: Users,
      title: 'Enhanced Customer Satisfaction',
      description: 'Keep customers happy with real-time updates',
      metric: '94% satisfaction',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: Heart,
      title: 'Improved Brand Loyalty',
      description: 'Build stronger relationships through communication',
      metric: '+67% retention',
      color: 'from-pink-500 to-rose-400'
    },
    {
      icon: Zap,
      title: 'Instant Delivery Updates',
      description: 'Real-time notifications at every step',
      metric: '<2s delivery',
      color: 'from-yellow-500 to-orange-400'
    },
    {
      icon: TrendingDown,
      title: 'Reduced Support Queries',
      description: 'WISMO queries reduced significantly',
      metric: '40% reduction',
      color: 'from-green-500 to-emerald-400'
    }
  ];



  const shipmentStatuses = [
    { status: 'Order Confirmed', icon: Check, color: 'text-green-500' },
    { status: 'Packed', icon: Package, color: 'text-blue-500' },
    { status: 'Shipped', icon: Truck, color: 'text-purple-500' },
    { status: 'Out For Delivery', icon: Clock, color: 'text-orange-500' },
    { status: 'Arriving Early', icon: Star, color: 'text-yellow-500' },
    { status: 'Delivery Delayed', icon: AlertCircle, color: 'text-red-500' },
    { status: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
    { status: 'Picked Up', icon: User, color: 'text-indigo-500' }
  ];

  const activationHistory = [
    {
      id: 1,
      activatedOn: '2024-01-15 10:30 AM',
      deactivatedOn: null,
      action: 'Enabled',
      userEmail: 'admin@parcelace.com',
      source: 'WEB'
    },
    {
      id: 2,
      activatedOn: '2024-01-10 02:15 PM',
      deactivatedOn: '2024-01-15 10:30 AM',
      action: 'Disabled',
      userEmail: 'user@parcelace.com',
      source: 'IOS'
    }
  ];

  const toggleHistoryExpansion = (id: number) => {
    setExpandedHistory(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleActivation = () => {
    setIsActivated(true);
    toast({
      title: "Notify Ace Activated!",
      description: "Your WhatsApp notifications are now active and ready to engage your customers.",
    });
  };

  const handleDeactivation = () => {
    setIsActivated(false);
    toast({
      title: "Service Deactivated",
      description: "Notify Ace has been deactivated. You can reactivate it anytime.",
      variant: "destructive"
    });
  };

  const toggleStatusNotification = (status: string) => {
    setStatusToggles(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const toggleShowImage = (status: string) => {
    setShowImageToggles(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handlePreview = (status: string) => {
    setPreviewStatus(status);
    setIsPreviewModalOpen(true);
  };

  const handleSaveWhatsAppSettings = () => {
    toast({
      title: "Settings Saved",
      description: "WhatsApp notification settings have been saved successfully.",
    });
  };

  const handleSaveEmailSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Email & SMS communication settings have been saved successfully.",
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent via-transparent to-transparent">
        {/* Modern Header Tabs */}
        <div className="bg-transparent backdrop-blur-xl border-b border-transparent sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl w-fit mx-auto my-4">
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={cn(
                  "px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2",
                  activeTab === 'whatsapp'
                    ? "bg-transparent shadow-lg text-primary ring-1 ring-primary/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Communication
              </button>
              <button
                onClick={() => setActiveTab('email-sms')}
                className={cn(
                  "px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2",
                  activeTab === 'email-sms'
                    ? "bg-transparent shadow-lg text-primary ring-1 ring-primary/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Mail className="w-4 h-4" />
                Email & SMS Communication
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {activeTab === 'whatsapp' ? (
            <>
              {/* Hero Section */}
              <div className="relative overflow-hidden">
                {/* Merged Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-blue-50/30"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
                
                <div className="relative max-w-6xl mx-auto px-6 py-8">
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Left Section - Hero Content (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Top Badge */}
                      <div className="inline-flex items-center gap-2 bg-gray-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        Enterprise-Grade Communication
                      </div>
                      
                      {/* Main Headline */}
                      <div className="space-y-4">
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                          <span className="text-gray-900">WhatsApp Business</span>
                          <br />
                          <span className="text-blue-600">Communication</span>
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                          Deliver professional, real-time order updates directly to your customers via WhatsApp Business API.
                        </p>
                      </div>
                      
                      {/* Feature Box */}
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-2xl text-white shadow-2xl">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl">🌐</span>
                          </div>
                          <span className="text-2xl font-bold">99.5% Delivery Success Rate</span>
                        </div>
                        <p className="opacity-90 text-base">
                          Trusted by 50,000+ businesses worldwide for critical customer communications.
                        </p>
                      </div>
                      
                      {/* Pricing Box */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                        <div>
                            <div className="text-4xl font-bold text-gray-900">₹0.99</div>
                            <div className="text-sm text-gray-600">per message</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">Volume Pricing Available</div>
                            <div className="text-sm text-gray-600">Discounts starting from 1,000+ messages per month</div>
                        </div>
                        </div>
                      </div>
                      
                      {/* Call-to-Action Buttons */}
                      {!isActivated && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            onClick={() => setIsDemoModalOpen(true)}
                            className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                          >
                            Try Interactive Demo
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          <Button 
                            onClick={handleActivation}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Activate Service
                          </Button>
                        </div>
                      )}

                      {isActivated && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <span className="font-semibold text-green-800">Notify Ace is Active</span>
                          </div>
                          <p className="text-green-700 mb-4">
                            Your service is running smoothly. Customers are receiving real-time updates via WhatsApp.
                          </p>
                          <button
                            onClick={() => setIsDeactivationModalOpen(true)}
                            className="text-red-600 hover:text-red-700 underline text-sm font-medium"
                          >
                            If you want to deactivate the plan, Click Here
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Section - Phone Mockup (1/3 width) */}
                    <div className="lg:col-span-1 flex justify-center lg:justify-end">
                      <div className="relative">
                        {/* Phone Frame */}
                        <div className="relative mx-auto border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[640px] w-[320px]">
                          {/* Dynamic Island */}
                          <div className="w-[140px] h-[24px] bg-gray-900 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                          
                          {/* Screen */}
                          <div className="rounded-[2rem] overflow-hidden w-[292px] h-[612px] bg-white relative">
                            
                            {/* Status Bar */}
                            <div className="flex justify-between items-center px-6 pt-4 pb-2 text-sm font-semibold text-gray-900 bg-white">
                              <div>3:14</div>
                              <div className="flex space-x-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 8h1v8H2V8zm2 2h1v6H4v-6zm2 2h1v4H6v-4zm2 2h1v2H8v-2z"/>
                                </svg>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9z"/>
                                  <path d="M8.5 16.5a5 5 0 0 1 7 0l-1.5 1.5a2.5 2.5 0 0 0-4 0l-1.5-1.5z"/>
                                </svg>
                                <div className="w-6 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            </div>
                            
                            {/* Top Header */}
                            <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">ParcelAce</div>
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L3.293 10.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-xs text-green-600 font-medium">Verified</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Background Area */}
                            <div className="h-full bg-gray-50 relative">
                              
                              {/* Notification Popup */}
                              <div className="absolute inset-4 top-8">
                                <div className="bg-white rounded-2xl p-6 max-w-xs mx-auto border border-gray-100">
                                  
                                  {/* Product Image */}
                                  <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-4 mb-4">
                                    <div className="flex justify-center items-center h-20">
                                      <div className="relative">
                                        {/* High heel shoe illustration */}
                                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg transform rotate-12"></div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"></div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Message Content */}
                                  <div className="space-y-3 text-sm">
                                    <p className="text-gray-800 leading-relaxed">
                                      Hey! Just wanted to let you know that your order has been successfully booked
                                    </p>
                                    
                                    <p className="text-gray-800">
                                      We'll make sure to deliver your orders with smile and speed 🚀
                                    </p>
                                    
                                    <div className="pt-2 border-t border-gray-100">
                                      <p className="text-gray-800 font-medium mb-2">Here are your order details:</p>
                                      
                                      <div className="space-y-1 text-xs text-gray-700">
                                        <div className="flex justify-between">
                                          <span>Order ID:</span>
                                          <span className="font-semibold">BUI9023</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Product Name:</span>
                                          <span className="font-semibold">Heel Shoes</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Qty:</span>
                                          <span className="font-semibold">1</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Order Amount:</span>
                                          <span className="font-semibold">₹890</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Payment Mode:</span>
                                          <span className="font-semibold">COD</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Track Button */}
                                    <div className="pt-3">
                                      <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors">
                                        Track Current Status
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* WhatsApp Icon */}
                        <div className="absolute bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                        </div>
                        
                        {/* Floating Elements */}
                        <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white animate-pulse">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                        </div>
                        
                        <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white animate-bounce">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    How Notify Ace Transforms Your Business
                    </h2>
                    <p className="text-base text-gray-600">
                      Proven results that drive customer satisfaction and business growth
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4", 
                          index === 0 ? "bg-blue-500" : 
                          index === 1 ? "bg-pink-500" : 
                          index === 2 ? "bg-orange-500" : "bg-green-500"
                        )}>
                            <benefit.icon className="w-7 h-7 text-white" />
                          </div>
                        <h3 className="font-bold text-blue-600 mb-2 text-base">{benefit.title}</h3>
                          <p className="text-gray-600 mb-3 leading-relaxed text-sm">{benefit.description}</p>
                        <div className={cn("inline-block px-4 py-2 rounded-full text-sm font-semibold text-white",
                          index === 0 ? "bg-blue-500" : 
                          index === 1 ? "bg-pink-500" : 
                          index === 2 ? "bg-orange-500" : "bg-green-500"
                        )}>
                            {benefit.metric}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>



              {/* Shipment Status Section */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    Shipment Status To Select From
                  </CardTitle>
                  {isActivated && (
                    <p className="text-center text-gray-600">Toggle on/off WhatsApp notifications for each order status</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Shipment Status</th>
                          {isActivated && <th className="text-center py-3 px-4 font-semibold">WhatsApp Notification</th>}
                          {isActivated && <th className="text-center py-3 px-4 font-semibold">Show Image</th>}
                          <th className="text-right py-3 px-4 font-semibold">Preview</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipmentStatuses.map((status, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-2">
                              <status.icon className={cn("w-5 h-5", status.color)} />
                              {status.status}
                            </td>
                            {isActivated && (
                              <td className="py-3 px-4 text-center">
                                <Switch
                                  checked={statusToggles[status.status]}
                                  onCheckedChange={() => toggleStatusNotification(status.status)}
                                />
                              </td>
                            )}
                            {isActivated && (
                              <td className="py-3 px-4 text-center">
                                <Switch
                                  checked={showImageToggles[status.status]}
                                  onCheckedChange={() => toggleShowImage(status.status)}
                                />
                              </td>
                            )}
                            <td className="py-3 px-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePreview(status.status)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {isActivated && (
                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={handleSaveWhatsAppSettings}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activation History Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    Activation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Activated On / Deactivated On</th>
                          <th className="text-left py-3 px-4 font-semibold">Action</th>
                          <th className="text-left py-3 px-4 font-semibold">User Details</th>
                          <th className="text-left py-3 px-4 font-semibold">Source Name</th>
                          <th className="text-right py-3 px-4 font-semibold">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activationHistory.map((history) => (
                          <tr key={history.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{history.activatedOn}</div>
                                {history.deactivatedOn && (
                                  <div className="text-sm text-gray-500">{history.deactivatedOn}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={history.action === 'Enabled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {history.action}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">{history.userEmail}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{history.source}</Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleHistoryExpansion(history.id)}
                              >
                                {expandedHistory.includes(history.id) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Email & SMS Communication Tab */
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Email & SMS Communication Settings
                </h2>
                <p className="text-base text-gray-600">
                    Customize your email and SMS notifications to match your business needs
                  </p>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                        <h3 className="font-semibold text-base mb-2 text-gray-900">Hide Product Name & Image</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Turn the toggle on if you don't want the product name or image to appear in the email or SMS. 
                            This setting is recommended for sellers who sell products related to health, wellness, personal care, and other similar categories.
                          </p>
                        </div>
                      <div className="ml-4 flex-shrink-0">
                        <Switch
                          checked={emailSettings.hideProductNameImage}
                          onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, hideProductNameImage: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-3 text-gray-900">Hide Product Price For Prepaid Orders</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Turn the toggle on if you don't want product price to appear in the email or SMS. 
                            This setting is recommended for sellers whose prepaid orders are mostly gift orders.
                          </p>
                        </div>
                      <div className="ml-4 flex-shrink-0">
                        <Switch
                          checked={emailSettings.hideProductPrice}
                          onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, hideProductPrice: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveEmailSettings}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
              </div>

              {/* Communication Management Table */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Communication Management
                  </h2>
                  <p className="text-gray-600">
                    Manage Email and SMS communication settings for each order status
                  </p>
                </div>
                
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Order Status</th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-900">Email</th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-900">SMS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipmentStatuses.map((status, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 flex items-center gap-3">
                              <status.icon className={cn("w-5 h-5", status.color)} />
                            <span className="font-medium text-gray-900">{status.status}</span>
                            </td>
                          <td className="py-4 px-4 text-center">
                              <Switch defaultChecked={index % 3 !== 0} />
                            </td>
                          <td className="py-4 px-4 text-center">
                              <Switch defaultChecked={index % 4 !== 0} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                                      </table>
                </div>

                <div className="flex justify-end mt-4">
                    <Button 
                      onClick={handleSaveEmailSettings}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <InteractiveDemoModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
        />

        <DeactivationModal
          isOpen={isDeactivationModalOpen}
          onClose={() => setIsDeactivationModalOpen(false)}
          onConfirm={handleDeactivation}
        />

        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          status={previewStatus}
        />
      </div>
  );
}


