
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
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
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
      <Card className="border-purple-200/30 dark:border-purple-800/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>GST Billing</CardTitle>
          </div>
          <CardDescription>Enable GST billing for your invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="gst-toggle" className="text-base font-medium">
              Turn on GST Billing
            </Label>
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
                <Label htmlFor="gst-number">GST Number</Label>
                <div className="flex space-x-3 mt-1">
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
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ GST number verified successfully</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Billing Details */}
      <Card className="border-purple-200/30 dark:border-purple-800/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>Billing Details</CardTitle>
          </div>
          <CardDescription>
            {gstEnabled && gstVerified 
              ? "Auto-filled from GST verification" 
              : "Enter your billing information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="address">Billing Address</Label>
              <Textarea
                id="address"
                placeholder="Enter complete billing address"
                value={billingDetails.address}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                disabled={gstEnabled && gstVerified}
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={billingDetails.city}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, city: e.target.value }))}
                  disabled={gstEnabled && gstVerified}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={billingDetails.state}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, state: e.target.value }))}
                  disabled={gstEnabled && gstVerified}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="Pincode"
                  value={billingDetails.pincode}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, pincode: e.target.value }))}
                  disabled={gstEnabled && gstVerified}
                />
              </div>
            </div>
          </div>
          {!(gstEnabled && gstVerified) && (
            <Button onClick={handleBillingDetailsSave} className="w-full">
              Save Billing Details
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Customise Invoice */}
      <Card className="border-purple-200/30 dark:border-purple-800/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>Customise Invoice</CardTitle>
          </div>
          <CardDescription>Customize your invoice appearance and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
              <Input
                id="invoice-prefix"
                placeholder="e.g., INV"
                value={invoiceSettings.prefix}
                onChange={(e) => setInvoiceSettings(prev => ({ ...prev, prefix: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="invoice-series">Invoice Series</Label>
              <Input
                id="invoice-series"
                placeholder="e.g., 2024"
                value={invoiceSettings.series}
                onChange={(e) => setInvoiceSettings(prev => ({ ...prev, series: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="cin">CIN (Corporate Identity Number)</Label>
            <Input
              id="cin"
              placeholder="Enter CIN number"
              value={invoiceSettings.cin}
              onChange={(e) => setInvoiceSettings(prev => ({ ...prev, cin: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="signature">Upload Signature</Label>
            <div className="mt-1">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {invoiceSettings.signature ? invoiceSettings.signature.name : 'Click to upload signature'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                />
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="invoice-type">Invoice Type</Label>
            <Select
              value={invoiceSettings.type}
              onValueChange={(value) => setInvoiceSettings(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 Format</SelectItem>
                <SelectItem value="Thermal">Thermal Print</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
            <div>
              <Label htmlFor="hide-contact" className="text-base font-medium">
                Hide Buyer Contact
              </Label>
              <p className="text-sm text-muted-foreground">Hide buyer contact details on invoice</p>
            </div>
            <Switch
              id="hide-contact"
              checked={invoiceSettings.hideBuyerContact}
              onCheckedChange={(checked) => setInvoiceSettings(prev => ({ ...prev, hideBuyerContact: checked }))}
            />
          </div>

          <Button onClick={handleInvoiceSettingsSave} className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700">
            Save Invoice Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
