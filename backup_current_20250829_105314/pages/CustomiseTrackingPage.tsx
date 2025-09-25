import React, { useState, useEffect } from 'react';
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
import { Save, Eye, Settings, Sparkles, Globe, Layout, Star, MessageSquare, Package, Image, Play, Gift, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TrackingCustomizationService, { TrackingPageMeta } from '@/services/trackingCustomizationService';

const CustomiseTrackingPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('primary');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [trackingPageData, setTrackingPageData] = useState<TrackingPageMeta | null>(null);

  // Load tracking page customization data on component mount
  useEffect(() => {
    loadTrackingPageData();
  }, []);

  const loadTrackingPageData = async () => {
    try {
      setIsLoading(true);
      const data = await TrackingCustomizationService.fetchTrackingPageCustomization();
      if (data) {
        setTrackingPageData(data);
      } else {
        // Use default values if no data exists
        setTrackingPageData(TrackingCustomizationService.getDefaultValues());
      }
    } catch (error) {
      console.error('Error loading tracking page data:', error);
      toast({
        title: "Error",
        description: "Failed to load tracking page customization data",
        variant: "destructive"
      });
      // Fallback to default values
      setTrackingPageData(TrackingCustomizationService.getDefaultValues());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!trackingPageData) {
        toast({
          title: "Error",
          description: "No data to save",
          variant: "destructive"
        });
        return;
      }

      const success = await TrackingCustomizationService.updateTrackingPageCustomization(trackingPageData);
      
      if (success) {
        toast({
          title: "Success",
          description: "Tracking page customization saved successfully",
        });
      } else {
        throw new Error('Save operation failed');
      }
    } catch (error) {
      console.error('Error saving tracking page customization:', error);
      toast({
        title: "Error",
        description: "Failed to save tracking page customization",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    console.log('Opening preview...');
    // Handle preview logic here
    toast({
      title: "Preview",
      description: "Preview functionality coming soon",
    });
  };

  const handleDataChange = (section: keyof TrackingPageMeta, data: any[]) => {
    setTrackingPageData(prev => prev ? { ...prev, [section]: data } : null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading tracking page customization...</p>
        </div>
      </div>
    );
  }

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
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-20 to-blue-10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Browser Settings</CardTitle>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200">Core</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BrowserInfoSection 
                      data={trackingPageData?.browser_settings}
                      onDataChange={(data) => handleDataChange('browser_settings', data)}
                    />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-20 to-green-10 flex items-center justify-center">
                          <Layout className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Header Section</CardTitle>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200">Branding</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <HeaderSection 
                      data={trackingPageData?.header_section}
                      onDataChange={(data) => handleDataChange('header_section', data)}
                    />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-20 to-orange-10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">NPS Section</CardTitle>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200">Feedback</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <NPSSection 
                      data={trackingPageData?.nps_section}
                      onDataChange={(data) => handleDataChange('nps_section', data)}
                    />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-card/80 via-card/90 to-card/95 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-20 to-purple-10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Footer Section</CardTitle>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200">Legal</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FooterSection 
                      data={trackingPageData?.footer_section}
                      onDataChange={(data) => handleDataChange('footer_section', data)}
                    />
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
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200">Marketing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProductSection 
                      data={trackingPageData?.product_showcase}
                      onDataChange={(data) => handleDataChange('product_showcase', data)}
                    />
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
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200">Marketing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BannerSection 
                      data={trackingPageData?.banner_campaigns}
                      onDataChange={(data) => handleDataChange('banner_campaigns', data)}
                    />
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
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200">Engagement</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <VideoSection 
                      data={trackingPageData?.video_content}
                      onDataChange={(data) => handleDataChange('video_content', data)}
                    />
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
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200">Retention</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RewardSection 
                      data={trackingPageData?.rewards_promotions}
                      onDataChange={(data) => handleDataChange('rewards_promotions', data)}
                    />
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
