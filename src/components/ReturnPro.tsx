
import React, { useState } from 'react';
import { 
  ArrowRight, 
  Upload, 
  Camera, 
  Clock, 
  Package, 
  RefreshCw, 
  CheckCircle,
  Settings,
  CreditCard,
  FileText,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ReturnPro = () => {
  const [enableReturns, setEnableReturns] = useState(false);
  const [returnWindows, setReturnWindows] = useState('30');
  const [categoryWindows, setCategoryWindows] = useState(false);
  const [showReturnReasons, setShowReturnReasons] = useState([]);
  const [autoApproveReasons, setAutoApproveReasons] = useState([]);
  const [allowReturnMode, setAllowReturnMode] = useState('all');
  const [photoUpload, setPhotoUpload] = useState(false);
  const [showRefundTimelines, setShowRefundTimelines] = useState(true);
  const [askRefundMode, setAskRefundMode] = useState(false);
  const [refundModes, setRefundModes] = useState([]);
  const [autoBookingPickup, setAutoBookingPickup] = useState(false);
  const [reverseQC, setReverseQC] = useState(false);
  const [advancedAutoApproval, setAdvancedAutoApproval] = useState(false);
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState('1000');

  const returnReasons = [
    'Damaged/Defective',
    'Quality not as expected',
    'Size not as expected',
    'Item received too late',
    'Wrong item',
    'Missing items',
    'Does not fit',
    'Changed my mind',
    'Size mismatch',
    'Wrong product ordered',
    'Not as described',
    'Other'
  ];

  const refundModeOptions = [
    'Original Payment Mode',
    'Store Credit / Wallet',
    'Gift Card'
  ];

  const handleReasonToggle = (reason, type) => {
    if (type === 'show') {
      setShowReturnReasons(prev => 
        prev.includes(reason) 
          ? prev.filter(r => r !== reason)
          : [...prev, reason]
      );
    } else {
      setAutoApproveReasons(prev => 
        prev.includes(reason) 
          ? prev.filter(r => r !== reason)
          : [...prev, reason]
      );
    }
  };

  const handleRefundModeToggle = (mode) => {
    setRefundModes(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Return Pro
        </h1>
        <p className="text-muted-foreground">
          Automate your return process and enhance customer experience with intelligent return management.
        </p>
      </div>

      {/* Section 1: Return Enablement */}
      <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-orange-200/30 dark:border-orange-800/30 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Return Enablement</h2>
            <p className="text-sm text-muted-foreground">Configure basic return settings for your store</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enable Returns */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Enable Returns on Tracking Page</label>
              <p className="text-xs text-muted-foreground">Allow customers to initiate returns from the tracking page</p>
            </div>
            <Switch 
              checked={enableReturns} 
              onCheckedChange={setEnableReturns}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>

          {/* Return Window */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Return Window (Days)</label>
            <Input
              type="number"
              value={returnWindows}
              onChange={(e) => setReturnWindows(e.target.value)}
              className="w-32 border-orange-200/50 dark:border-orange-800/50 focus:border-orange-400 dark:focus:border-orange-600"
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">Number of days customers have to return items</p>
          </div>

          {/* Category Windows */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Different Windows by Category</label>
                <p className="text-xs text-muted-foreground">Set different return windows for different product categories</p>
              </div>
              <Switch 
                checked={categoryWindows} 
                onCheckedChange={setCategoryWindows}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>

            {categoryWindows && (
              <div className="ml-4 p-4 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg border border-orange-200/30 dark:border-orange-800/30">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Category Return Windows</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Input placeholder="Electronics" className="flex-1" />
                      <Input type="number" placeholder="15" className="w-20" />
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="Clothing" className="flex-1" />
                      <Input type="number" placeholder="30" className="w-20" />
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-orange-200/50 hover:bg-orange-50">
                    + Add Category
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Section 2: Return Reasons */}
      <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-blue-200/30 dark:border-blue-800/30 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Return Reasons</h2>
            <p className="text-sm text-muted-foreground">Configure which return reasons to show and auto-approve</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Show Return Reasons */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Show Return Reason on Tracking Page</label>
            <div className="grid grid-cols-2 gap-2">
              {returnReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <Checkbox
                    id={`show-${reason}`}
                    checked={showReturnReasons.includes(reason)}
                    onCheckedChange={() => handleReasonToggle(reason, 'show')}
                    className="border-blue-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label htmlFor={`show-${reason}`} className="text-xs text-foreground cursor-pointer">
                    {reason}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Auto Approve Reasons */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Auto Approve Return</label>
            <p className="text-xs text-muted-foreground mb-2">Select reasons that should be automatically approved</p>
            <div className="grid grid-cols-2 gap-2">
              {returnReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <Checkbox
                    id={`auto-${reason}`}
                    checked={autoApproveReasons.includes(reason)}
                    onCheckedChange={() => handleReasonToggle(reason, 'auto')}
                    className="border-blue-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label htmlFor={`auto-${reason}`} className="text-xs text-foreground cursor-pointer">
                    {reason}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: SKU & Product Rules */}
      <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-purple-200/30 dark:border-purple-800/30 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">SKU & Product Rules</h2>
            <p className="text-sm text-muted-foreground">Configure which products are eligible for returns</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Allow Return on</label>
            <Select value={allowReturnMode} onValueChange={setAllowReturnMode}>
              <SelectTrigger className="w-full border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600">
                <SelectValue placeholder="Select return eligibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="specific">Specific SKUs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {allowReturnMode === 'specific' && (
            <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Upload SKU List</label>
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-foreground mb-1">Upload CSV file with SKU list</p>
                  <p className="text-xs text-muted-foreground mb-3">CSV should contain SKU column</p>
                  <Button variant="outline" size="sm" className="border-purple-200/50 hover:bg-purple-50">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Section 4: Customer Experience Settings */}
      <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-green-200/30 dark:border-green-800/30 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Customer Experience Settings</h2>
            <p className="text-sm text-muted-foreground">Enhance the return experience for your customers</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Photo/Video Upload */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Photo / Video Upload on Return</label>
              <p className="text-xs text-muted-foreground">Allow customers to upload media with return requests</p>
            </div>
            <Switch 
              checked={photoUpload} 
              onCheckedChange={setPhotoUpload}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {/* Estimated Refund Timelines */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Show Estimated Refund Timelines</label>
              <p className="text-xs text-muted-foreground">Display expected refund processing times</p>
            </div>
            <Switch 
              checked={showRefundTimelines} 
              onCheckedChange={setShowRefundTimelines}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {/* Return Tracking Journey */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Return Tracking Journey</label>
              <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                Always Enabled
              </div>
            </div>
            <div className="p-4 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-200/30 dark:border-green-800/30">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Requested</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Pickup Scheduled</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>In Transit</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Item Received</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span>Refund Processed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 5: Refund & Payout Preferences */}
      <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-indigo-200/30 dark:border-indigo-800/30 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Refund & Payout Preferences</h2>
            <p className="text-sm text-muted-foreground">Configure refund options and payment preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ask for Refund Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Ask for Refund Mode</label>
              <p className="text-xs text-muted-foreground">Let customers choose how they want to receive refunds</p>
            </div>
            <Switch 
              checked={askRefundMode} 
              onCheckedChange={setAskRefundMode}
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>

          {/* Refund Mode Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Show Refund Mode Available</label>
            <div className="space-y-2">
              {refundModeOptions.map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <Checkbox
                    id={mode}
                    checked={refundModes.includes(mode)}
                    onCheckedChange={() => handleRefundModeToggle(mode)}
                    className="border-indigo-200 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                  />
                  <label htmlFor={mode} className="text-sm text-foreground cursor-pointer">
                    {mode}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Section 6: Operational Controls */}
      <Card className="p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-red-200/30 dark:border-red-800/30 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Operational Controls</h2>
            <p className="text-sm text-muted-foreground">Advanced automation settings for return processing</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Auto Booking Reverse Pickup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Auto Booking Reverse Pickup</label>
                <p className="text-xs text-muted-foreground">Automatically schedule pickup when return is approved</p>
              </div>
              <Switch 
                checked={autoBookingPickup} 
                onCheckedChange={setAutoBookingPickup}
                className="data-[state=checked]:bg-red-500"
              />
            </div>

            {autoBookingPickup && (
              <div className="ml-4 p-4 bg-red-50/50 dark:bg-red-900/20 rounded-lg border border-red-200/30 dark:border-red-800/30">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Reverse QC</label>
                    <p className="text-xs text-muted-foreground">Auto pass QC on return items</p>
                  </div>
                  <Switch 
                    checked={reverseQC} 
                    onCheckedChange={setReverseQC}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Advanced Auto-Approval */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Advanced Auto-Approval by Order Value</label>
                <p className="text-xs text-muted-foreground">Auto-approve returns based on order value threshold</p>
              </div>
              <Switch 
                checked={advancedAutoApproval} 
                onCheckedChange={setAdvancedAutoApproval}
                className="data-[state=checked]:bg-red-500"
              />
            </div>

            {advancedAutoApproval && (
              <div className="ml-4 space-y-2">
                <label className="text-sm font-medium text-foreground">Auto-approve orders under</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={autoApprovalThreshold}
                    onChange={(e) => setAutoApprovalThreshold(e.target.value)}
                    className="w-32 border-red-200/50 dark:border-red-800/50 focus:border-red-400 dark:focus:border-red-600"
                    placeholder="1000"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Returns for orders below this amount will be auto-approved</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-orange-500 via-blue-500 to-purple-600 hover:from-orange-600 hover:via-blue-600 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default ReturnPro;
