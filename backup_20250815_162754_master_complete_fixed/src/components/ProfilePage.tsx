import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Shield, Store, ShoppingCart, CheckCircle, AlertCircle, Edit2, CreditCard, Building2, HeadphonesIcon } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface ProfileData {
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  kycVerified: boolean;
  salesPlatform: string;
  monthlyOrders: string;
  brandName: string;
  brandWebsite: string;
}

interface BankDetails {
  payeeName: string;
  accountNumber: string;
  ifsc: string;
  verified: boolean;
}

interface LegalDetails {
  legalEntity: string;
  legalName: string;
  gstin: string;
  address: string;
}

interface SupportDetails {
  firstLevel: {
    pocName: string;
    pocNumber: string;
    pocEmail: string;
  };
  secondLevel: {
    pocName: string;
    pocNumber: string;
    pocEmail: string;
  };
}

const ProfilePage = () => {
  const { user } = useUser();
  
  // Get user display name with proper fallback logic
  const getUserDisplayName = (): string => {
    if (user?.name) {
      return user.name;
    }
    
    // Try to get name from other sources
    const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.name) {
          return parsedUser.name;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Try to get name from sessionStorage user
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      try {
        const parsedUser = JSON.parse(sessionUser);
        if (parsedUser.name) {
          return parsedUser.name;
        }
      } catch (error) {
        console.error('Error parsing session user:', error);
      }
    }
    
    // Final fallback - try to get email prefix
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'Guest';
  };

  const [profileData, setProfileData] = useState<ProfileData>({
    name: getUserDisplayName(),
    email: user?.email || 'Loading...',
    emailVerified: !!user?.email_verified_at,
    phone: user?.phone || 'Loading...',
    phoneVerified: !!user?.mobile_verified_at,
    kycVerified: !!user?.is_kyc_verified,
    salesPlatform: 'Loading...',
    monthlyOrders: 'Loading...',
    brandName: 'Loading...',
    brandWebsite: 'Loading...'
  });

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    payeeName: getUserDisplayName(),
    accountNumber: '1234567890',
    ifsc: 'HDFC0001234',
    verified: true
  });

  const [legalDetails, setLegalDetails] = useState<LegalDetails>({
    legalEntity: 'Individual',
    legalName: getUserDisplayName(),
    gstin: '',
    address: '123 Main Street, City, State, 123456'
  });

  const [supportDetails, setSupportDetails] = useState<SupportDetails>({
    firstLevel: {
      pocName: 'John Doe',
      pocNumber: '+91 9876543210',
      pocEmail: 'john.doe@company.com'
    },
    secondLevel: {
      pocName: 'Jane Smith',
      pocNumber: '+91 9876543211',
      pocEmail: 'jane.smith@company.com'
    }
  });

  const [editingBank, setEditingBank] = useState(false);
  const [editingLegal, setEditingLegal] = useState(false);
  const [editingSupport, setEditingSupport] = useState(false);

  // Load profile data from localStorage on component mount
  useEffect(() => {
    const savedOnboardingData = localStorage.getItem('onboardingData');
    const savedKycData = localStorage.getItem('kycVerificationData');
    
    if (savedOnboardingData) {
      const onboardingData = JSON.parse(savedOnboardingData);
      setProfileData(prev => ({
        ...prev,
        salesPlatform: onboardingData.platforms?.join(', ') || prev.salesPlatform,
        monthlyOrders: onboardingData.monthlyOrders || prev.monthlyOrders
      }));
    }

    if (savedKycData) {
      const kycData = JSON.parse(savedKycData);
      setProfileData(prev => ({
        ...prev,
        kycVerified: Object.keys(kycData).length > 0
      }));
    }
  }, []);

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: getUserDisplayName(),
        email: user.email || prev.email,
        emailVerified: !!user.email_verified_at,
        phone: user.phone || prev.phone,
        phoneVerified: !!user.mobile_verified_at,
        kycVerified: !!user.is_kyc_verified,
      }));

      // Update bank and legal details with user name
      setBankDetails(prev => ({
        ...prev,
        payeeName: getUserDisplayName(),
      }));

      setLegalDetails(prev => ({
        ...prev,
        legalName: getUserDisplayName(),
      }));
    }
  }, [user]);

  const handleVerifyEmail = () => {
    console.log('Email verification initiated');
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleKYCVerification = () => {
    console.log('KYC verification clicked');
  };

  const handleSaveBankDetails = () => {
    console.log('Bank details saved:', bankDetails);
    setEditingBank(false);
  };

  const handleSaveLegalDetails = () => {
    console.log('Legal details saved:', legalDetails);
    setEditingLegal(false);
  };

  const handleSaveSupportDetails = () => {
    console.log('Support details saved:', supportDetails);
    setEditingSupport(false);
  };

  const getVerificationBadge = (verified: boolean, label: string) => {
    return verified ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        {label} Verified
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {label} Unverified
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-blue-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-blue-950/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Profile Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your profile information and business details
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Information Section */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      👤 Profile Information
                    </CardTitle>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditProfile}
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Name</span>
                  </div>
                  <span className="text-foreground">{profileData.name}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm">{profileData.email}</span>
                    {getVerificationBadge(profileData.emailVerified, 'Email')}
                    {!profileData.emailVerified && (
                      <Button 
                        size="sm" 
                        onClick={handleVerifyEmail}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs"
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Phone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{profileData.phone}</span>
                    {getVerificationBadge(profileData.phoneVerified, 'Phone')}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">KYC Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profileData.kycVerified ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        KYC Verified
                      </Badge>
                    ) : (
                      <>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          KYC Pending
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={handleKYCVerification}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs"
                        >
                          Complete KYC
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details Section */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200/30 dark:border-blue-800/30">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    🏪 Business Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Sales Platform</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {profileData.salesPlatform}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Monthly Orders</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {profileData.monthlyOrders} orders
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Brand Name</span>
                  </div>
                  <span className="text-foreground">{profileData.brandName}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Brand Website</span>
                  </div>
                  <span className="text-foreground text-sm">{profileData.brandWebsite}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details Section */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-200/30 dark:border-green-800/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      💳 Bank Details
                    </CardTitle>
                  </div>
                  <Dialog open={editingBank} onOpenChange={setEditingBank}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Bank Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="payeeName">Payee Name</Label>
                          <Input
                            id="payeeName"
                            value={bankDetails.payeeName}
                            onChange={(e) => setBankDetails(prev => ({ ...prev, payeeName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="ifsc">IFSC Code</Label>
                          <Input
                            id="ifsc"
                            value={bankDetails.ifsc}
                            onChange={(e) => setBankDetails(prev => ({ ...prev, ifsc: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleSaveBankDetails} className="w-full">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-medium text-foreground">Payee Name</span>
                  <span className="text-foreground">{bankDetails.payeeName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-medium text-foreground">Account Number</span>
                  <span className="text-foreground">****{bankDetails.accountNumber.slice(-4)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-medium text-foreground">IFSC</span>
                  <span className="text-foreground">{bankDetails.ifsc}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-foreground">Status</span>
                  {getVerificationBadge(bankDetails.verified, 'Bank')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Legal Details Section */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-orange-200/30 dark:border-orange-800/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      ⚖️ Legal Details
                    </CardTitle>
                  </div>
                  <Dialog open={editingLegal} onOpenChange={setEditingLegal}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Legal Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="legalEntity">Legal Entity</Label>
                          <Input
                            id="legalEntity"
                            value={legalDetails.legalEntity}
                            onChange={(e) => setLegalDetails(prev => ({ ...prev, legalEntity: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="legalName">Legal Name</Label>
                          <Input
                            id="legalName"
                            value={legalDetails.legalName}
                            onChange={(e) => setLegalDetails(prev => ({ ...prev, legalName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gstin">GSTIN</Label>
                          <Input
                            id="gstin"
                            value={legalDetails.gstin}
                            onChange={(e) => setLegalDetails(prev => ({ ...prev, gstin: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={legalDetails.address}
                            onChange={(e) => setLegalDetails(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleSaveLegalDetails} className="w-full">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-medium text-foreground">Legal Entity</span>
                  <span className="text-foreground">{legalDetails.legalEntity}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-medium text-foreground">Legal Name</span>
                  <span className="text-foreground">{legalDetails.legalName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="font-medium text-foreground">GSTIN</span>
                  <span className="text-foreground">{legalDetails.gstin || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-foreground">Address</span>
                  <span className="text-foreground text-right text-sm max-w-xs">{legalDetails.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Support Details Section */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-indigo-200/30 dark:border-indigo-800/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10">
                      <HeadphonesIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      🎧 Support Details
                    </CardTitle>
                  </div>
                  <Dialog open={editingSupport} onOpenChange={setEditingSupport}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Support Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="font-medium">1st Level Support</h4>
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="first-poc-name">POC Name</Label>
                              <Input
                                id="first-poc-name"
                                value={supportDetails.firstLevel.pocName}
                                onChange={(e) => setSupportDetails(prev => ({
                                  ...prev,
                                  firstLevel: { ...prev.firstLevel, pocName: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="first-poc-number">POC Number</Label>
                              <Input
                                id="first-poc-number"
                                value={supportDetails.firstLevel.pocNumber}
                                onChange={(e) => setSupportDetails(prev => ({
                                  ...prev,
                                  firstLevel: { ...prev.firstLevel, pocNumber: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="first-poc-email">POC Email</Label>
                              <Input
                                id="first-poc-email"
                                value={supportDetails.firstLevel.pocEmail}
                                onChange={(e) => setSupportDetails(prev => ({
                                  ...prev,
                                  firstLevel: { ...prev.firstLevel, pocEmail: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">2nd Level Support</h4>
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="second-poc-name">POC Name</Label>
                              <Input
                                id="second-poc-name"
                                value={supportDetails.secondLevel.pocName}
                                onChange={(e) => setSupportDetails(prev => ({
                                  ...prev,
                                  secondLevel: { ...prev.secondLevel, pocName: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="second-poc-number">POC Number</Label>
                              <Input
                                id="second-poc-number"
                                value={supportDetails.secondLevel.pocNumber}
                                onChange={(e) => setSupportDetails(prev => ({
                                  ...prev,
                                  secondLevel: { ...prev.secondLevel, pocNumber: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="second-poc-email">POC Email</Label>
                              <Input
                                id="second-poc-email"
                                value={supportDetails.secondLevel.pocEmail}
                                onChange={(e) => setSupportDetails(prev => ({
                                  ...prev,
                                  secondLevel: { ...prev.secondLevel, pocEmail: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                        <Button onClick={handleSaveSupportDetails} className="w-full">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground border-b pb-2">1st Level Support</h4>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">POC Name</span>
                      <span className="text-sm text-foreground">{supportDetails.firstLevel.pocName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">POC Number</span>
                      <span className="text-sm text-foreground">{supportDetails.firstLevel.pocNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">POC Email</span>
                      <span className="text-sm text-foreground">{supportDetails.firstLevel.pocEmail}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground border-b pb-2">2nd Level Support</h4>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">POC Name</span>
                      <span className="text-sm text-foreground">{supportDetails.secondLevel.pocName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">POC Number</span>
                      <span className="text-sm text-foreground">{supportDetails.secondLevel.pocNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">POC Email</span>
                      <span className="text-sm text-foreground">{supportDetails.secondLevel.pocEmail}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/30 dark:border-purple-800/30">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 w-fit mx-auto">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">Profile Completion</h3>
                    <p className="text-xs text-muted-foreground">
                      Keep your profile information up to date
                    </p>
                  </div>
                  <Button 
                    onClick={handleEditProfile}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm"
                    size="sm"
                  >
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-200/30 dark:border-green-800/30">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 w-fit mx-auto">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">Security & Verification</h3>
                    <p className="text-xs text-muted-foreground">
                      Complete your verification process
                    </p>
                  </div>
                  <Button 
                    onClick={handleKYCVerification}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-sm"
                    size="sm"
                  >
                    {profileData.kycVerified ? 'View KYC Details' : 'Complete KYC'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 