
import React, { useState } from 'react';
import { 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Package, 
  Smartphone, 
  Eye, 
  Shield, 
  ArrowRight,
  Play,
  Building,
  RefreshCw,
  Heart,
  PieChart,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TrackingPage = () => {
  const [activeSection, setActiveSection] = useState('basic-setup');

  const sidebarItems = [
    { id: 'basic-setup', title: 'Basic Setup', icon: Package },
    { id: 'advanced-setup', title: 'Advanced Setup', icon: Star },
    { id: 'company-logo', title: 'Company Logo', icon: Building },
    { id: 'return-initiation', title: 'Return Initiation', icon: RefreshCw },
    { id: 'recommendations', title: 'Recommendations', icon: Heart },
    { id: 'analytics', title: 'Analytics', icon: PieChart }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Reduce Support Cost',
      percentage: '65%',
      description: 'Automated tracking updates reduce customer inquiries'
    },
    {
      icon: Users,
      title: 'More Repeat Orders',
      percentage: '65%',
      description: 'Better experience leads to customer retention'
    },
    {
      icon: BarChart3,
      title: 'Higher NPS Score',
      percentage: '65%',
      description: 'Customers love the enhanced tracking experience'
    },
    {
      icon: Target,
      title: 'Better Conversion',
      percentage: '65%',
      description: 'Improved customer satisfaction drives sales'
    }
  ];

  const comparisonFeatures = [
    { feature: 'Estimated Delivery Date', basic: true, advanced: true },
    { feature: 'Email Notifications', basic: true, advanced: true },
    { feature: 'Custom Sub-domain', basic: false, advanced: true },
    { feature: 'Company Logo & Branding', basic: false, advanced: true },
    { feature: 'Product Recommendations', basic: false, advanced: true },
    { feature: 'Social Media Content', basic: false, advanced: true },
    { feature: 'Order Tracking Widget', basic: false, advanced: true },
    { feature: 'Analytics Dashboard', basic: false, advanced: true },
    { feature: 'Return Initiation Portal', basic: false, advanced: true },
    { feature: 'WhatsApp Integration', basic: false, advanced: true }
  ];

  const includedFeatures = [
    'Custom branded tracking pages',
    'Product recommendations engine',
    'Advanced analytics dashboard',
    'Social media integration',
    'Return initiation portal',
    'WhatsApp notifications',
    'Real-time order updates',
    'Customer feedback collection'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sticky Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
          <div className="p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Brand Boost Settings
            </h3>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.id 
                      ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Hero Section */}
          <div className="mb-12">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-4">
                      <Zap className="w-4 h-4 mr-1" />
                      Brand Boost
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                      Uplift customer experience through Brand Boost
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                      Transform your order tracking into a branded experience that delights customers and drives repeat business.
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Branded tracking pages with your logo and colors</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Product recommendations to increase AOV</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Advanced analytics and customer insights</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>Social proof and review collection</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Activate Now - 
                        <span className="line-through text-orange-200 mx-1">₹3.99</span>
                        ₹2.99+GST/order
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Preview Sample
                      </Button>
                    </div>
                  </div>

                  <div className="lg:flex justify-center">
                    <div className="relative">
                      <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                        <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Order #12345</span>
                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">In Transit</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full mb-4">
                            <div className="h-2 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full w-3/4"></div>
                          </div>
                          <p className="text-sm text-gray-600">Expected delivery: Tomorrow</p>
                        </div>
                        <div className="text-center">
                          <Smartphone className="w-16 h-16 text-orange-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">Branded Tracking Experience</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Why Choose Brand Boost?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{benefit.title}</CardTitle>
                    <div className="text-3xl font-bold text-orange-600">{benefit.percentage}</div>
                    <div className="text-sm text-gray-500 font-medium">improvements</div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 text-center">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Choose Your Plan
            </h2>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-6 font-semibold text-gray-900">Features</th>
                        <th className="text-center p-6">
                          <div>
                            <h3 className="font-semibold text-gray-900">Basic (Free)</h3>
                            <p className="text-sm text-gray-500">Standard tracking</p>
                          </div>
                        </th>
                        <th className="text-center p-6">
                          <div>
                            <h3 className="font-semibold text-orange-600">Advanced Setup (Paid)</h3>
                            <div className="text-sm">
                              <span className="line-through text-gray-400">₹3.99</span>
                              <span className="text-orange-600 font-medium ml-1">₹2.99+GST per order</span>
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 text-gray-900 font-medium">{item.feature}</td>
                          <td className="p-4 text-center">
                            {item.basic ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <div className="w-5 h-5 bg-gray-200 rounded-full mx-auto"></div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {item.advanced ? (
                              <CheckCircle className="w-5 h-5 text-orange-500 mx-auto" />
                            ) : (
                              <div className="w-5 h-5 bg-gray-200 rounded-full mx-auto"></div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Summary */}
          <Card className="bg-gradient-to-r from-orange-50 via-red-50 to-blue-50 border border-orange-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-gray-900">
                Get the best value for your money
              </CardTitle>
              <p className="text-center text-gray-600">Everything you need to create an amazing customer experience</p>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">What's Included:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {includedFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="mb-2">
                      <span className="text-2xl line-through text-gray-400">₹3.99</span>
                      <div className="text-4xl font-bold text-orange-600">₹2.99</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">+GST per order</div>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                    >
                      Activate Brand Boost
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
