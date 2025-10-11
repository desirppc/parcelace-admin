import React, { Suspense, lazy } from 'react';
import { Package, Shield, Truck, CreditCard, FileText, MessageSquare, BarChart3, Settings, Building, RefreshCw, Star } from 'lucide-react';
import { SupportTicket } from '@/types/support';

// Lazy load all components to prevent them from loading when OnboardingContent loads
const KYCVerification = lazy(() => import('./KYCVerification'));
const ViewOrder = lazy(() => import('./ViewOrder'));
const OrdersPage = lazy(() => import('./OrdersPage'));
const ShipmentPage = lazy(() => import('./ShipmentPage'));
const CODRemittance = lazy(() => import('./CODRemittance'));
const WalletTransaction = lazy(() => import('./WalletTransaction'));
const EarlyCODPlans = lazy(() => import('./EarlyCODPlans'));
const ReturnPro = lazy(() => import('./ReturnPro'));
const Billing = lazy(() => import('./Billing'));
const ShippingLabelSettings = lazy(() => import('./ShippingLabelSettings'));
const WarehouseScreen = lazy(() => import('./WarehouseScreen'));
const SupportDashboard = lazy(() => import('./SupportDashboard'));
const CreateTicket = lazy(() => import('./CreateTicket'));

// Loading component for Suspense fallback
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

interface OnboardingContentProps {
  activeMenuItem: string;
}

const OnboardingContent: React.FC<OnboardingContentProps> = ({ activeMenuItem }) => {
  const handleTicketSelect = (ticket: SupportTicket) => {
    console.log('Selected ticket:', ticket);
    // TODO: Implement ticket selection logic (e.g., open ticket details modal)
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'onboarding':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 rounded-full mb-4 shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome to ShipFast
              </h1>
              <p className="text-muted-foreground mb-8">
                Complete your onboarding to start shipping efficiently
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg p-6 border border-purple-200/30 dark:border-purple-800/30 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold">Account Setup</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your profile and business information
                </p>
                <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">60% Complete</p>
              </div>
            </div>
          </div>
        );

      case 'kyc':
      case 'aadhar-verification':
      case 'pan-verification':
      case 'bank-verification':
      case 'gst-verification':
        return <Suspense fallback={<ComponentLoader />}><KYCVerification /></Suspense>;

      case 'view-order':
        return <Suspense fallback={<ComponentLoader />}><ViewOrder /></Suspense>;

      case 'orders':
      case 'add-order':
      case 'prepaid-orders':
        return <Suspense fallback={<ComponentLoader />}><OrdersPage /></Suspense>;

      case 'shipments':
      case 'prepaid-shipments':
      case 'reverse-shipments':
      case 'tracking':
      case 'courier-selection':
        return <Suspense fallback={<ComponentLoader />}><ShipmentPage /></Suspense>;

      case 'cod-remittance':
        return <Suspense fallback={<ComponentLoader />}><CODRemittance /></Suspense>;
      case 'wallet-transaction':
        return <Suspense fallback={<ComponentLoader />}><WalletTransaction /></Suspense>;
      case 'early-cod':
        return <Suspense fallback={<ComponentLoader />}><EarlyCODPlans /></Suspense>;
      case 'invoice':
        return <Suspense fallback={<ComponentLoader />}><Billing /></Suspense>;

      case 'return-pro':
        return <Suspense fallback={<ComponentLoader />}><ReturnPro /></Suspense>;

      case 'billing':
        return <Suspense fallback={<ComponentLoader />}><Billing /></Suspense>;
      case 'tracking-page':
        return <Suspense fallback={<ComponentLoader />}><ShippingLabelSettings /></Suspense>;
      case 'warehouse-location':
        return <Suspense fallback={<ComponentLoader />}><WarehouseScreen /></Suspense>;

      case 'support-dashboard':
        return <Suspense fallback={<ComponentLoader />}><SupportDashboard /></Suspense>;
      case 'create-ticket':
        return <Suspense fallback={<ComponentLoader />}><CreateTicket /></Suspense>;
      case 'my-tickets':
      case 'ticket-history':
        return <Suspense fallback={<ComponentLoader />}><SupportDashboard /></Suspense>; // Redirect to support dashboard instead

      default:
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Shipments Dashboard
            </h2>
            <p className="text-muted-foreground">
              {activeMenuItem.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} content will be implemented here.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full">
      {renderContent()}
    </div>
  );
};

export default OnboardingContent;
