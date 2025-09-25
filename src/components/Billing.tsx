
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Shield, Settings, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Billing = () => {
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [gstVerified, setGstVerified] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: '',
    series: '',
    cin: '',
    signature: null as File | null,
    type: 'A4',
    hideBuyerContact: false
  });

  const handleGstVerification = async () => {
    if (!gstNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter GST number",
        variant: "destructive"
      });
      return;
    }

    // Simulate GST verification API call
    setTimeout(() => {
      if (gstNumber.length === 15) {
        setGstVerified(true);
        // Auto-fill billing details
        setBillingDetails({
          address: '123 Business Park, Corporate Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        });
        toast({
          title: "Success",
          description: "GST number verified successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid GST number",
          variant: "destructive"
        });
      }
    }, 1000);
  };

  const handleBillingDetailsSave = () => {
    if (!billingDetails.address || !billingDetails.city || !billingDetails.state || !billingDetails.pincode) {
      toast({
        title: "Error",
        description: "Please fill all billing details",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Billing details saved successfully",
    });
  };

  const handleInvoiceSettingsSave = () => {
    if (!invoiceSettings.prefix || !invoiceSettings.series) {
      toast({
        title: "Error",
        description: "Please fill required invoice settings",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Invoice settings saved successfully",
    });
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setInvoiceSettings(prev => ({ ...prev, signature: file }));
      toast({
        title: "Success",
        description: "Signature uploaded successfully",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Billing Settings
            </h1>
            <p className="text-muted-foreground">Configure your billing and invoice preferences</p>
          </div>
        </div>

        {/* Section 1: GST Billing Toggle */}
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>GST Billing</span>
            </CardTitle>
            <CardDescription>Enable GST billing for your invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/30 dark:border-purple-800/30">
              <div>
                <Label htmlFor="gst-toggle" className="text-sm font-medium text-foreground">Turn on GST Billing</Label>
                <p className="text-xs text-muted-foreground">Enable GST billing for your invoices</p>
              </div>
              <Switch
                id="gst-toggle"
                checked={gstEnabled}
                onCheckedChange={(checked) => {
                  setGstEnabled(checked);
                  if (!checked) {
                    setGstVerified(false);
                    setGstNumber('');
                  }
                }}
              />
            </div>

            {gstEnabled && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
                <div>
                  <Label htmlFor="gst-number" className="text-sm font-medium text-foreground mb-2 block">GST Number</Label>
                  <div className="flex space-x-3">
                    <Input
                      id="gst-number"
                      placeholder="Enter 15-digit GST number"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      maxLength={15}
                      disabled={gstVerified}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleGstVerification}
                      disabled={gstVerified}
                      className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700"
                    >
                      {gstVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                  {gstVerified && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ GST number verified successfully</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Billing Details */}
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Billing Details</span>
            </CardTitle>
            <CardDescription>
              {gstEnabled && gstVerified 
                ? "Auto-filled from GST verification" 
                : "Enter your billing information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-foreground mb-2 block">Billing Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your billing address"
                  value={billingDetails.address}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-foreground mb-2 block">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={billingDetails.city}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium text-foreground mb-2 block">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={billingDetails.state}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="pincode" className="text-sm font-medium text-foreground mb-2 block">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="Enter pincode"
                  value={billingDetails.pincode}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleBillingDetailsSave}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700"
              >
                Save Billing Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Invoice Settings */}
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Invoice Settings</span>
            </CardTitle>
            <CardDescription>Configure your invoice preferences and format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prefix" className="text-sm font-medium text-foreground mb-2 block">Invoice Prefix</Label>
                <Input
                  id="prefix"
                  placeholder="e.g., INV"
                  value={invoiceSettings.prefix}
                  onChange={(e) => setInvoiceSettings(prev => ({ ...prev, prefix: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="series" className="text-sm font-medium text-foreground mb-2 block">Invoice Series</Label>
                <Input
                  id="series"
                  placeholder="e.g., 2024"
                  value={invoiceSettings.series}
                  onChange={(e) => setInvoiceSettings(prev => ({ ...prev, series: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="cin" className="text-sm font-medium text-foreground mb-2 block">CIN Number</Label>
                <Input
                  id="cin"
                  placeholder="Enter CIN number"
                  value={invoiceSettings.cin}
                  onChange={(e) => setInvoiceSettings(prev => ({ ...prev, cin: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-medium text-foreground mb-2 block">Invoice Type</Label>
                <Select value={invoiceSettings.type} onValueChange={(value) => setInvoiceSettings(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Thermal">Thermal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/30 dark:border-purple-800/30">
                <div>
                  <Label htmlFor="signature" className="text-sm font-medium text-foreground">Digital Signature</Label>
                  <p className="text-xs text-muted-foreground">Upload your digital signature for invoices</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="signature"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('signature')?.click()}
                    className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-600/10 border-pink-500/20 hover:from-pink-500/20 hover:via-purple-500/20 hover:to-blue-600/20"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              
              {invoiceSettings.signature && (
                <div className="p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/30 dark:border-green-800/30">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ {invoiceSettings.signature.name}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/30 dark:border-purple-800/30">
                <div>
                  <Label htmlFor="hideBuyerContact" className="text-sm font-medium text-foreground">Hide Buyer Contact</Label>
                  <p className="text-xs text-muted-foreground">Hide buyer contact information on invoices</p>
                </div>
                <Switch
                  id="hideBuyerContact"
                  checked={invoiceSettings.hideBuyerContact}
                  onCheckedChange={(checked) => setInvoiceSettings(prev => ({ ...prev, hideBuyerContact: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleInvoiceSettingsSave}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700"
              >
                Save Invoice Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
