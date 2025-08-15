import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BrowserInfoSection from '@/components/customise-tracking/BrowserInfoSection';
import HeaderSection from '@/components/customise-tracking/HeaderSection';
import ProductSection from '@/components/customise-tracking/ProductSection';
import BannerSection from '@/components/customise-tracking/BannerSection';
import VideoSection from '@/components/customise-tracking/VideoSection';
import RewardSection from '@/components/customise-tracking/RewardSection';
import NPSSection from '@/components/customise-tracking/NPSSection';
import FooterSection from '@/components/customise-tracking/FooterSection';
import { Button } from '@/components/ui/button';
import { Save, Eye, Settings, Sparkles, Globe, Layout, Star, MessageSquare, Package, Image, Play, Gift } from 'lucide-react';

const CustomiseTrackingPage = () => {
  const [activeTab, setActiveTab] = useState('primary');

  const handleSave = () => {
    console.log('Saving tracking page customizations...');
    // Handle save logic here
  };

  const handlePreview = () => {
    console.log('Opening preview...');
    // Handle preview logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-card/90 via-card/95 to-card/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Tracking Page Customization
              </h1>
              <p className="text-sm text-muted-foreground">
                Design your customer tracking experience with our visual editor
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handlePreview} className="gap-2 border-primary/20 hover:border-primary/40">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="horizontal" className="flex gap-8">
          <div className="w-64 shrink-0">
            <TabsList className="flex flex-col h-fit w-full p-2 bg-gradient-to-b from-card/50 to-muted/30 backdrop-blur-sm border shadow-lg">
              <TabsTrigger 
                value="primary" 
                className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:border-primary/20"
              >
                <Settings className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Essential Settings</div>
                  <div className="text-xs text-muted-foreground">Core configurations</div>
                </div>
                <Badge variant="secondary" className="ml-auto">4</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="additional" 
                className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/10 data-[state=active]:to-accent/5 data-[state=active]:border-accent/20"
              >
                <Sparkles className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Advanced Features</div>
                  <div className="text-xs text-muted-foreground">Marketing tools</div>
                </div>
                <Badge variant="secondary" className="ml-auto">4</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1">
            <TabsContent value="primary" className="space-y-8 mt-0">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Essential Configuration
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Configure the core elements that every tracking page needs to provide a professional customer experience
                </p>
              </div>
              
              <div className="grid gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Configure Browser Settings</CardTitle>
                        <p className="text-sm text-muted-foreground">Customize page title and favicon for professional branding</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BrowserInfoSection />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                        <Layout className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Configure Header</CardTitle>
                        <p className="text-sm text-muted-foreground">Add logo, menu navigation, sticky header and support contact information</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <HeaderSection />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Configure Customer Feedback</CardTitle>
                        <p className="text-sm text-muted-foreground">Collect NPS scores and delivery experience feedback from customers</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <NPSSection />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Configure Footer</CardTitle>
                        <p className="text-sm text-muted-foreground">Add social media icons, privacy policy and sticky footer with custom branding</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FooterSection />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-8 mt-0">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-accent-foreground to-accent-foreground/70 bg-clip-text text-transparent">
                  Advanced Features
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Enhance your tracking page with marketing tools, rich content and engagement features
                </p>
              </div>

              <div className="grid gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Product Showcase</CardTitle>
                          <p className="text-sm text-muted-foreground">Show your products on tracking link to drive additional sales</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200">Marketing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProductSection />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 flex items-center justify-center">
                          <Image className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Configure Banner Campaigns</CardTitle>
                          <p className="text-sm text-muted-foreground">Upload promotional banners to showcase offers and campaigns</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200">Marketing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BannerSection />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 flex items-center justify-center">
                          <Play className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Configure Video Content</CardTitle>
                          <p className="text-sm text-muted-foreground">Embed YouTube videos to engage customers with rich content</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200">Engagement</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <VideoSection />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Configure Rewards & Promotions</CardTitle>
                          <p className="text-sm text-muted-foreground">Create promo codes and special offers to increase customer retention</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200">Retention</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RewardSection />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomiseTrackingPage;
