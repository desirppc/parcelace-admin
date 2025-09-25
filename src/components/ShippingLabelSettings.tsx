
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings, FileText, MapPin, Eye, Package, Phone, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import shippingLabelSettingsService, { ShippingLabelSettings } from '@/services/shippingLabelSettingsService';

const ShippingLabelSettings = () => {
  // State for shipping label settings
  const [settings, setSettings] = useState<ShippingLabelSettings>({
    label_type: 'A6',
    show_sender_address: true,
    show_sender_number: true,
    show_custom_address: false,
    custom_address: '',
    show_order_total: true,
    show_product_name: true,
    show_receiver_number: true,
    show_brand_logo: false,
    brand_logo_url: ''
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // File input ref for logo upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await shippingLabelSettingsService.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        console.warn('Failed to load settings:', response.error);
        // Keep default settings if API fails
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await shippingLabelSettingsService.updateSettings(settings);
      if (response.success) {
        toast({
          title: "Settings Saved",
          description: "Your shipping label settings have been updated successfully.",
        });
      } else {
        toast({
          title: "Save Failed",
          description: response.error || "Failed to save settings. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const response = await shippingLabelSettingsService.uploadBrandLogo(file);
      if (response.success && response.data) {
        setSettings(prev => ({
          ...prev,
          brand_logo_url: response.data!.logo_url
        }));
        toast({
          title: "Logo Uploaded",
          description: "Brand logo has been uploaded successfully.",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: response.error || "Failed to upload logo. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const response = await shippingLabelSettingsService.removeBrandLogo();
      if (response.success) {
        setSettings(prev => ({
          ...prev,
          brand_logo_url: ''
        }));
        toast({
          title: "Logo Removed",
          description: "Brand logo has been removed successfully.",
        });
      } else {
        toast({
          title: "Remove Failed",
          description: response.error || "Failed to remove logo. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: "Remove Failed",
        description: "An error occurred while removing logo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogoToggle = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      show_brand_logo: checked,
      // Clear logo URL if turning off
      brand_logo_url: checked ? prev.brand_logo_url : ''
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shipping label settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Shipping Label Settings
            </h1>
            <p className="text-muted-foreground">Customize your shipping labels according to your preferences</p>
          </div>
        </div>

        {/* Section 1 - Label Type */}
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Label Type</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred label format for printing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">Select Label Type</Label>
              <RadioGroup 
                value={settings.label_type} 
                onValueChange={(value: 'A6' | 'Thermal') => setSettings(prev => ({ ...prev, label_type: value }))} 
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A6" id="a6" />
                  <Label htmlFor="a6" className="text-sm">A6 Format</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Thermal" id="thermal" />
                  <Label htmlFor="thermal" className="text-sm">Thermal Print</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 - Address Settings */}
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Address Settings</span>
            </CardTitle>
            <CardDescription>
              Configure how addresses appear on your shipping labels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show Sender Address */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/30 dark:border-purple-800/30">
              <div>
                <Label className="text-sm font-medium text-foreground">Show Sender Address</Label>
                <p className="text-xs text-muted-foreground">Display sender's complete address on label</p>
              </div>
              <Switch
                checked={settings.show_sender_address}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_sender_address: checked }))}
              />
            </div>

            {/* Show Sender Number */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/30 dark:border-purple-800/30">
              <div>
                <Label className="text-sm font-medium text-foreground">Show Sender Number</Label>
                <p className="text-xs text-muted-foreground">Include sender's phone number on label</p>
              </div>
              <Switch
                checked={settings.show_sender_number}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_sender_number: checked }))}
              />
            </div>

            <Separator className="my-4" />

            {/* Show Custom Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200/30 dark:border-blue-800/30">
                <div>
                  <Label className="text-sm font-medium text-foreground">Show Custom Address</Label>
                  <p className="text-xs text-muted-foreground">Use a custom address instead of default</p>
                </div>
                <Switch
                  checked={settings.show_custom_address}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_custom_address: checked }))}
                />
              </div>

              {settings.show_custom_address && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="customAddress" className="text-sm font-medium text-foreground">
                    Custom Address
                  </Label>
                  <Textarea
                    id="customAddress"
                    placeholder="Enter your custom address here..."
                    value={settings.custom_address || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, custom_address: e.target.value }))}
                    className="min-h-[100px] bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200/50 dark:border-purple-800/50 focus:bg-white dark:focus:bg-gray-900 focus:border-purple-400 dark:focus:border-purple-600 transition-all duration-300"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3 - Additional Details */}
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Additional Details</span>
            </CardTitle>
            <CardDescription>
              Choose what additional information to display on labels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Show Order Total */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/30 dark:border-green-800/30">
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div>
                  <Label className="text-sm font-medium text-foreground">Show Order Total</Label>
                  <p className="text-xs text-muted-foreground">Display total order value on label</p>
                </div>
              </div>
              <Switch
                checked={settings.show_order_total}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_order_total: checked }))}
              />
            </div>

            {/* Show Product Name */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200/30 dark:border-orange-800/30">
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <div>
                  <Label className="text-sm font-medium text-foreground">Show Product Name</Label>
                  <p className="text-xs text-muted-foreground">Include product names on shipping label</p>
                </div>
              </div>
              <Switch
                checked={settings.show_product_name}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_product_name: checked }))}
              />
            </div>

            {/* Show Receiver Number */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/30 dark:border-blue-800/30">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <Label className="text-sm font-medium text-foreground">Show Receiver Number</Label>
                  <p className="text-xs text-muted-foreground">Print receiver's contact number on label</p>
                </div>
              </div>
              <Switch
                checked={settings.show_receiver_number}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_receiver_number: checked }))}
              />
            </div>

            {/* Show Brand Logo */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/30 dark:border-purple-800/30">
              <div className="flex items-center space-x-3">
                <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <Label className="text-sm font-medium text-foreground">Show Brand Logo</Label>
                  <p className="text-xs text-muted-foreground">Display your brand logo on shipping labels</p>
                </div>
              </div>
              <Switch
                checked={settings.show_brand_logo}
                onCheckedChange={handleLogoToggle}
              />
            </div>

            {/* Brand Logo Upload Section */}
            {settings.show_brand_logo && (
              <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-purple-50/30 to-pink-50/30 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200/20 dark:border-purple-800/20 animate-fade-in">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Brand Logo</Label>
                  
                  {/* Current Logo Display */}
                  {settings.brand_logo_url && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-purple-200/30 dark:border-purple-800/30">
                      <img 
                        src={settings.brand_logo_url} 
                        alt="Brand Logo" 
                        className="w-12 h-12 object-contain rounded border border-purple-200/30 dark:border-purple-800/30"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Current Logo</p>
                        <p className="text-xs text-muted-foreground">Logo will be displayed on shipping labels</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Upload Section */}
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 hover:border-purple-300 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700 dark:hover:border-purple-600"
                      >
                        {isUploadingLogo ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {settings.brand_logo_url ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      
                      {!settings.brand_logo_url && (
                        <p className="text-xs text-muted-foreground">
                          Recommended: PNG or JPEG, max 5MB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabelSettings;
