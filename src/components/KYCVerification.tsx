
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, FileText, CreditCard, Building, Landmark, Edit2 } from 'lucide-react';
import { EntityType, KYCType, KYCRequirement, KYCState } from '@/types/kyc';

// Lazy load KYC verification components
const AadharVerification = lazy(() => import('./AadharVerification'));
const PANVerification = lazy(() => import('./PANVerification'));
const GSTVerification = lazy(() => import('./GSTVerification'));
const BankVerification = lazy(() => import('./BankVerification'));

// Loading component for Suspense fallback
const KYCLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const KYCVerification = () => {
  const [kycState, setKycState] = useState<KYCState>({
    entityType: null,
    requirements: [],
    currentVerification: null,
    verificationData: {}
  });
  const [entityTypeSelected, setEntityTypeSelected] = useState(false);

  // Load saved entity type on component mount
  useEffect(() => {
    const savedEntityType = localStorage.getItem('kycEntityType');
    if (savedEntityType) {
      const entityType = savedEntityType as EntityType;
      const requirements = getKYCRequirements(entityType);
      setKycState({
        entityType,
        requirements,
        currentVerification: null,
        verificationData: JSON.parse(localStorage.getItem('kycVerificationData') || '{}')
      });
      setEntityTypeSelected(true);
    }
  }, []);

  const getKYCRequirements = (entityType: EntityType): KYCRequirement[] => {
    const baseRequirements: KYCRequirement[] = [
      {
        type: 'aadhar',
        required: entityType === 'individual',
        status: 'not-started' as const,
        label: 'Aadhar Verification',
        description: 'Identity verification using Aadhar card'
      },
      {
        type: 'pan',
        required: entityType === 'individual',
        status: 'not-started' as const,
        label: 'PAN Verification',
        description: 'Tax identification verification'
      },
      {
        type: 'gst',
        required: entityType !== 'individual',
        status: 'not-started' as const,
        label: 'GST Verification',
        description: 'Business registration verification'
      },
      {
        type: 'bank',
        required: false,
        status: 'not-started' as const,
        label: 'Bank Verification',
        description: 'Bank account verification (Optional)'
      }
    ];

    return baseRequirements;
  };

  const handleEntityTypeChange = (entityType: EntityType) => {
    const requirements = getKYCRequirements(entityType);
    setKycState({
      ...kycState,
      entityType,
      requirements
    });
    setEntityTypeSelected(true);
    // Save to localStorage
    localStorage.setItem('kycEntityType', entityType);
  };

  const handleChangeEntityType = () => {
    // Clear saved data and reset
    localStorage.removeItem('kycEntityType');
    localStorage.removeItem('kycVerificationData');
    setEntityTypeSelected(false);
    setKycState({
      entityType: null,
      requirements: [],
      currentVerification: null,
      verificationData: {}
    });
  };

  const handleStartVerification = (kycType: KYCType) => {
    setKycState({
      ...kycState,
      currentVerification: kycType
    });
  };

  const handleVerificationComplete = (kycType: KYCType, success: boolean, data?: any) => {
    const updatedRequirements = kycState.requirements.map(req => 
      req.type === kycType 
        ? { ...req, status: success ? 'verified' as const : 'failed' as const }
        : req
    );

    const updatedVerificationData = {
      ...kycState.verificationData,
      [kycType]: data
    };

    setKycState({
      ...kycState,
      requirements: updatedRequirements,
      currentVerification: null,
      verificationData: updatedVerificationData
    });

    // Save verification data to localStorage
    localStorage.setItem('kycVerificationData', JSON.stringify(updatedVerificationData));
  };

  // Update requirements status based on saved verification data
  useEffect(() => {
    if (kycState.verificationData && kycState.requirements.length > 0) {
      const updatedRequirements = kycState.requirements.map(req => ({
        ...req,
        status: kycState.verificationData[req.type] ? 'verified' as const : req.status
      }));
      
      setKycState(prev => ({
        ...prev,
        requirements: updatedRequirements
      }));
    }
  }, [kycState.verificationData]);

  const getKYCIcon = (type: KYCType) => {
    switch (type) {
      case 'aadhar':
        return <FileText className="w-6 h-6" />;
      case 'pan':
        return <CreditCard className="w-6 h-6" />;
      case 'gst':
        return <Building className="w-6 h-6" />;
      case 'bank':
        return <Landmark className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getStatusBadge = (requirement: KYCRequirement) => {
    switch (requirement.status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ Verified</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      default:
        return requirement.required 
          ? <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Required</Badge>
          : <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Optional</Badge>;
    }
  };

  const canStartShipping = () => {
    const requiredVerifications = kycState.requirements.filter(req => req.required);
    return requiredVerifications.every(req => req.status === 'verified');
  };

  const getCardClassName = (requirement: KYCRequirement) => {
    const baseClasses = "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300";
    
    if (requirement.status === 'verified') {
      return `${baseClasses} border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20`;
    }
    
    return baseClasses;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-blue-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-blue-950/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            KYC Verification
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete your KYC verification to start shipping. Select your entity type and complete the required verifications.
          </p>
        </div>

        {/* Entity Type Selection - Only show if not selected */}
        {!entityTypeSelected && (
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Step 1: Select Entity Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleEntityTypeChange}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select your legal entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="private-limited">Private Limited</SelectItem>
                  <SelectItem value="public">Public Limited</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* KYC Requirements - Only show after entity type is selected */}
        {entityTypeSelected && kycState.entityType && (
          <div className="space-y-6">
            {/* Entity Type Display with Change Option */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30 rounded-lg p-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Entity Type: {kycState.entityType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <p className="text-sm text-muted-foreground">Complete the required verifications below</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleChangeEntityType}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Change
              </Button>
            </div>

            <h2 className="text-2xl font-semibold text-foreground text-center">
              Complete Required Verifications
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {kycState.requirements.map((requirement) => (
                <Card 
                  key={requirement.type}
                  className={getCardClassName(requirement)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          requirement.status === 'verified' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-gradient-to-br from-pink-500/10 to-purple-500/10'
                        }`}>
                          {requirement.status === 'verified' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            getKYCIcon(requirement.type)
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-foreground">
                            {requirement.label}
                          </CardTitle>
                        </div>
                      </div>
                      {getStatusBadge(requirement)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {requirement.description}
                    </p>
                    
                    {requirement.status === 'verified' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Verification Complete</span>
                      </div>
                    ) : requirement.status === 'failed' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Verification Failed</span>
                        </div>
                        <Button 
                          onClick={() => handleStartVerification(requirement.type)}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        >
                          Retry Verification
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleStartVerification(requirement.type)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                      >
                        {requirement.type === 'aadhar' && 'Verify Aadhar'}
                        {requirement.type === 'pan' && 'Verify PAN'}
                        {requirement.type === 'gst' && 'Verify GST'}
                        {requirement.type === 'bank' && 'Verify Bank Account'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Shipping Status */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {canStartShipping() ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-lg font-semibold">Ready to Start Shipping!</span>
                      </div>
                      <p className="text-muted-foreground">
                        All required verifications are complete. You can now start using our shipping services.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-orange-600">
                        <AlertCircle className="w-6 h-6" />
                        <span className="text-lg font-semibold">Complete Required Verifications</span>
                      </div>
                      <p className="text-muted-foreground">
                        Please complete all required KYC verifications to start shipping.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verification Modals */}
        {kycState.currentVerification === 'aadhar' && (
          <Suspense fallback={<KYCLoader />}>
            <AadharVerification 
              onComplete={(success, data) => handleVerificationComplete('aadhar', success, data)}
              onClose={() => setKycState({...kycState, currentVerification: null})}
            />
          </Suspense>
        )}
        
        {kycState.currentVerification === 'pan' && (
          <Suspense fallback={<KYCLoader />}>
            <PANVerification 
              onComplete={(success, data) => handleVerificationComplete('pan', success, data)}
              onClose={() => setKycState({...kycState, currentVerification: null})}
            />
          </Suspense>
        )}
        
        {kycState.currentVerification === 'gst' && (
          <Suspense fallback={<KYCLoader />}>
            <GSTVerification 
              onComplete={(success, data) => handleVerificationComplete('gst', success, data)}
              onClose={() => setKycState({...kycState, currentVerification: null})}
            />
          </Suspense>
        )}
        
        {kycState.currentVerification === 'bank' && (
          <Suspense fallback={<KYCLoader />}>
            <BankVerification 
              onComplete={(success, data) => handleVerificationComplete('bank', success, data)}
              onClose={() => setKycState({...kycState, currentVerification: null})}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default KYCVerification;
