
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings, FileText, MapPin, Eye, Package, Phone, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ShippingLabelSettings = () => {
  // Section 1 - Label Type
  const [labelType, setLabelType] = useState('A4');

  // Section 2 - Address Settings
  const [showSenderAddress, setShowSenderAddress] = useState(true);
  const [showSenderNumber, setShowSenderNumber] = useState(true);
  const [showCustomAddress, setShowCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState('');

  // Section 3 - Additional Details
  const [showOrderTotal, setShowOrderTotal] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showReceiverNumber, setShowReceiverNumber] = useState(true);

  const handleSave = () => {
    // Handle save logic here
    toast({
      title: "Settings Saved",
      description: "Your shipping label settings have been updated successfully.",
    });
  };

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
              <RadioGroup value={labelType} onValueChange={setLabelType} className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A4" id="a4" />
                  <Label htmlFor="a4" className="text-sm">A4 Format</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Thermal" id="thermal" />
                  <Label htmlFor="thermal" className="text-sm">Thermal Print</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Custom" id="custom" />
                  <Label htmlFor="custom" className="text-sm">Custom Size</Label>
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
                checked={showSenderAddress}
                onCheckedChange={setShowSenderAddress}
              />
            </div>

            {/* Show Sender Number */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/30 dark:border-purple-800/30">
              <div>
                <Label className="text-sm font-medium text-foreground">Show Sender Number</Label>
                <p className="text-xs text-muted-foreground">Include sender's phone number on label</p>
              </div>
              <Switch
                checked={showSenderNumber}
                onCheckedChange={setShowSenderNumber}
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
                  checked={showCustomAddress}
                  onCheckedChange={setShowCustomAddress}
                />
              </div>

              {showCustomAddress && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="customAddress" className="text-sm font-medium text-foreground">
                    Custom Address
                  </Label>
                  <Textarea
                    id="customAddress"
                    placeholder="Enter your custom address here..."
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
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
                checked={showOrderTotal}
                onCheckedChange={setShowOrderTotal}
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
                checked={showProductName}
                onCheckedChange={setShowProductName}
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
                checked={showReceiverNumber}
                onCheckedChange={setShowReceiverNumber}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabelSettings;
