
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
  PieChart
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
      subtitle: 'By 45%',
      description: 'Automated tracking updates reduce customer inquiries'
    },
    {
      icon: Users,
      title: 'More Repeat Orders',
      subtitle: '30% increase',
      description: 'Better experience leads to customer retention'
    },
    {
      icon: BarChart3,
      title: 'Higher NPS Score',
      subtitle: '8.5/10 average',
      description: 'Customers love the enhanced tracking experience'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex">
        {/* Sticky Sidebar */}
        <div className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-r border-purple-200/30 dark:border-purple-800/30 sticky top-0 h-screen overflow-y-auto">
          <div className="p-6">
            <h3 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Brand Boost Settings
            </h3>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                    activeSection === item.id 
                      ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50' 
                      : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400'
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
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Uplift customer experience through Brand Boost
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Transform your order tracking into a branded experience that delights customers and drives repeat business.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Branded tracking pages with your logo and colors</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Product recommendations to increase AOV</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Advanced analytics and customer insights</span>
                  </div>
                  <div className="flex items-center text-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Social proof and review collection</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Activate Now - ₹2.99/order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-purple-200 dark:border-purple-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Preview Sample
                  </Button>
                </div>
              </div>

              <div className="lg:flex justify-center">
                <div className="relative">
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-purple-200/30 dark:border-purple-800/30">
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Order #12345</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs">In Transit</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                        <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-3/4"></div>
                      </div>
                      <p className="text-sm text-muted-foreground">Expected delivery: Tomorrow</p>
                    </div>
                    <div className="text-center">
                      <Smartphone className="w-16 h-16 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Branded Tracking Experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Why Choose Brand Boost?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-purple-200/30 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{benefit.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-purple-200/30 dark:border-purple-800/30">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-200/30 dark:border-purple-800/30">
                        <th className="text-left p-6 font-semibold text-foreground">Features</th>
                        <th className="text-center p-6">
                          <div>
                            <h3 className="font-semibold text-foreground">Basic (Free)</h3>
                            <p className="text-sm text-muted-foreground">Standard tracking</p>
                          </div>
                        </th>
                        <th className="text-center p-6">
                          <div>
                            <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Advanced Setup (Paid)</h3>
                            <p className="text-sm text-purple-600 dark:text-purple-400">₹2.99 per order</p>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-blue-50/30 dark:hover:from-purple-900/10 dark:hover:to-blue-900/10">
                          <td className="p-4 text-foreground">{item.feature}</td>
                          <td className="p-4 text-center">
                            {item.basic ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {item.advanced ? (
                              <CheckCircle className="w-5 h-5 text-purple-500 mx-auto" />
                            ) : (
                              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
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
          <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border-purple-200/30 dark:border-purple-800/30">
            <CardHeader>
              <CardTitle className="text-center text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Get the best value for your money
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">What's Included:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Custom branded tracking pages</span>
                    </div>
                    <div className="flex items-center text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Product recommendations engine</span>
                    </div>
                    <div className="flex items-center text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Advanced analytics dashboard</span>
                    </div>
                    <div className="flex items-center text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Social media integration</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">₹2.99</div>
                    <div className="text-sm text-muted-foreground mb-4">per order</div>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
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
