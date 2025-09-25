import React from 'react';
import { Package, Shield, Truck, CreditCard, FileText, MessageSquare, BarChart3, Settings, Building, RefreshCw, Star } from 'lucide-react';
import KYCVerification from './KYCVerification';
import ViewOrder from './ViewOrder';
import OrdersPage from './OrdersPage';
import ShipmentPage from './ShipmentPage';
import CODRemittance from './CODRemittance';
import WalletTransaction from './WalletTransaction';
import EarlyCODPlans from './EarlyCODPlans';
import ReturnPro from './ReturnPro';
import Billing from './Billing';
import ShippingLabelSettings from './ShippingLabelSettings';
import WarehouseScreen from './WarehouseScreen';
import SupportDashboard from './SupportDashboard';
import CreateTicket from './CreateTicket';
import { SupportTicket } from '@/types/support';

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
        return <KYCVerification />;

      case 'view-order':
        return <ViewOrder />;

      case 'orders':
      case 'add-order':
      case 'prepaid-orders':
      case 'reverse-orders':
        return <OrdersPage />;

      case 'shipments':
      case 'prepaid-shipments':
      case 'reverse-shipments':
      case 'tracking':
      case 'courier-selection':
        return <ShipmentPage />;

      case 'cod-remittance':
        return <CODRemittance />;
      case 'wallet-transaction':
        return <WalletTransaction />;
      case 'early-cod':
        return <EarlyCODPlans />;
      case 'invoice':
        return <Billing />;

      case 'return-pro':
        return <ReturnPro />;

      case 'billing':
        return <Billing />;
      case 'tracking-page':
        return <ShippingLabelSettings />;
      case 'warehouse-location':
        return <WarehouseScreen />;

      case 'support-dashboard':
        return <SupportDashboard />;
      case 'create-ticket':
        return <CreateTicket />;
      case 'my-tickets':
      case 'ticket-history':
        return <SupportDashboard />; // Redirect to support dashboard instead

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
