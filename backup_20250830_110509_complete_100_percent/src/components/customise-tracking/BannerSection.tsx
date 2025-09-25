import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Activity, Trash2, Plus, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BannerCampaigns, Banner } from '@/services/trackingCustomizationService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BannerSectionProps {
  data?: BannerCampaigns[];
  onDataChange?: (data: BannerCampaigns[]) => void;
}

const BannerSection: React.FC<BannerSectionProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<BannerCampaigns[]>([
    {
      show_banners: false,
      banners: []
    }
  ]);

  // Initialize with props data or default values
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  const handleDataChange = (field: keyof BannerCampaigns, value: any) => {
    const updatedData = localData.map((item, index) => 
      index === 0 ? { ...item, [field]: value } : item
    );
    setLocalData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const addBanner = () => {
    const currentBanners = localData[0]?.banners || [];
    if (currentBanners.length < 5) {
      const newBanner: Banner = {
        id: Date.now().toString(),
        banner_image: '',
        title: '',
        description: '',
        link_url: '',
        is_active: true
      };
      const updatedBanners = [...currentBanners, newBanner];
      handleDataChange('banners', updatedBanners);
    }
  };

  const removeBanner = (bannerId: string) => {
    const currentBanners = localData[0]?.banners || [];
    const updatedBanners = currentBanners.filter(banner => banner.id !== bannerId);
    handleDataChange('banners', updatedBanners);
  };

  const updateBanner = (bannerId: string, field: keyof Banner, value: any) => {
    const currentBanners = localData[0]?.banners || [];
    const updatedBanners = currentBanners.map(banner =>
      banner.id === bannerId ? { ...banner, [field]: value } : banner
    );
    handleDataChange('banners', updatedBanners);
  };

  const toggleBannerStatus = (bannerId: string) => {
    const currentBanners = localData[0]?.banners || [];
    const updatedBanners = currentBanners.map(banner =>
      banner.id === bannerId ? { ...banner, is_active: !banner.is_active } : banner
    );
    handleDataChange('banners', updatedBanners);
  };

  const handleImageUpload = (bannerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload the file to the server
      // For now, we'll just update the local state
      const fileName = `uploads/banners/${file.name}`;
      updateBanner(bannerId, 'banner_image', fileName);
      
      toast({
        title: "Banner Image Updated",
        description: "Banner image has been updated successfully",
      });
    }
  };

  const currentData = localData[0];

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upload promotional banners to showcase offers and campaigns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show Banners</span>
            <Switch 
              checked={currentData?.show_banners || false} 
              onCheckedChange={(checked) => handleDataChange('show_banners', checked)} 
              className="data-[state=checked]:bg-green-600" 
            />
            <ChevronDown className={`w-5 h-5 text-green-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 pt-4">

      {currentData?.show_banners && (
        <div className="space-y-6">
          {/* Banners List */}
          <div className="space-y-4">
            {currentData.banners.map((banner, index) => (
              <Card key={banner.id} className="border-2 border-gray-100 hover:border-green-200 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Banner Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Banner {index + 1}</h4>
                          <p className="text-sm text-gray-500">Configure your banner details</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={banner.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleBannerStatus(banner.id)}
                        >
                          {banner.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBanner(banner.id)}
                          className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Banner Details Form */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Banner Title</Label>
                        <Input
                          value={banner.title}
                          onChange={(e) => updateBanner(banner.id, 'title', e.target.value)}
                          placeholder="Enter banner title"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <Input
                          value={banner.description}
                          onChange={(e) => updateBanner(banner.id, 'description', e.target.value)}
                          placeholder="Enter banner description"
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <Input
                        value={banner.description}
                        onChange={(e) => updateBanner(banner.id, 'description', e.target.value)}
                        placeholder="Enter banner description"
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Link URL</Label>
                      <Input
                        value={banner.link_url}
                        onChange={(e) => updateBanner(banner.id, 'link_url', e.target.value)}
                        placeholder="https://example.com/campaign"
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    {/* Banner Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Banner Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                        {banner.banner_image ? (
                          <div className="space-y-2">
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                              <ImageIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Image uploaded</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateBanner(banner.id, 'banner_image', '')}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600">Upload Image</p>
                            <p className="text-xs text-gray-500">1200x300px PNG/JPG file</p>
                            <Button variant="outline" size="sm" asChild>
                              <label htmlFor={`banner-image-${banner.id}`} className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Image
                              </label>
                            </Button>
                            <input
                              id={`banner-image-${banner.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(banner.id, e)}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Banner Button */}
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={addBanner}
              disabled={(currentData?.banners?.length || 0) >= 5}
              className="border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Banner {(currentData?.banners?.length || 0) > 0 && `(${currentData.banners.length}/5)`}
            </Button>
            {(currentData?.banners?.length || 0) >= 5 && (
              <p className="text-sm text-gray-500 mt-2">Maximum 5 banners allowed</p>
            )}
          </div>

          {/* Information Section */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Activity className="w-3 h-3 text-green-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-900">Banner Campaign Benefits</h4>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• Promote special offers and discounts</li>
                  <li>• Increase customer engagement on tracking page</li>
                  <li>• Drive traffic to specific campaigns</li>
                  <li>• Boost conversion rates with targeted messaging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default BannerSection;
