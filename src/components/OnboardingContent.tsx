
import React, { useState } from 'react';
import OrdersPage from './OrdersPage';
import ShipmentPage from './ShipmentPage';
import CODRemittance from './CODRemittance';
import WalletTransaction from './WalletTransaction';
import EarlyCODPlans from './EarlyCODPlans';
import InvoiceManagement from './InvoiceManagement';
import SupportDashboard from './SupportDashboard';
import CreateTicket from './CreateTicket';
import TicketList from './TicketList';
import TicketDetails from './TicketDetails';
import KYCVerification from './KYCVerification';
import CourierPartnerSelection from './CourierPartnerSelection';
import AadharVerification from './AadharVerification';
import PANVerification from './PANVerification';
import BankVerification from './BankVerification';
import GSTVerification from './GSTVerification';
import Billing from './Billing';
import { SupportTicket } from '@/types/support';

interface OnboardingContentProps {
  activeMenuItem: string;
}

const OnboardingContent: React.FC<OnboardingContentProps> = ({ activeMenuItem }) => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setShowTicketDetails(false);
  };

  const renderOnboardingStep = () => {
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg p-6 shadow-lg border border-purple-200/30 dark:border-purple-800/30">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome to ShipFast!
            </h2>
            <p className="text-muted-foreground">
              Let's get your shipping operations up and running in just a few steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-pink-200/30 dark:border-pink-800/30">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-xl">⚙️</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Setup Account</h3>
              <p className="text-sm text-muted-foreground">Complete your profile and verify your business details</p>
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-full w-3/5 rounded-full shadow-sm"></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">60% Complete</span>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-xl">🔗</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Connect Store</h3>
              <p className="text-sm text-muted-foreground">Integrate with Shopify, WooCommerce, or other platforms</p>
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-full w-0 rounded-full shadow-sm"></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">Not Started</span>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg border border-blue-200/30 dark:border-blue-800/30">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-xl">📦</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">First Shipment</h3>
              <p className="text-sm text-muted-foreground">Create your first order and start shipping</p>
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-green-600 h-full w-0 rounded-full shadow-sm"></div>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">Not Started</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle support section routing
  if (activeMenuItem === 'my-tickets' || activeMenuItem === 'ticket-history') {
    if (showTicketDetails && selectedTicket) {
      return <TicketDetails ticket={selectedTicket} onBack={handleBackToList} />;
    }
    return <TicketList onTicketSelect={handleTicketSelect} />;
  }

  switch (activeMenuItem) {
    // Onboarding
    case 'onboarding':
    case 'account-setup':
    case 'integration':
    case 'first-shipment':
      return renderOnboardingStep();
    
    // KYC - Main KYC page or individual verification pages
    case 'kyc':
      return <KYCVerification />;
    case 'aadhar-verification':
      return <AadharVerification />;
    case 'pan-verification':
      return <PANVerification />;
    case 'bank-verification':
      return <BankVerification />;
    case 'gst-verification':
      return <GSTVerification />;
    
    // Orders
    case 'orders':
    case 'prepaid-orders':
    case 'reverse-orders':
      return <OrdersPage />;
    
    // Shipments
    case 'shipments':
    case 'prepaid-shipments':
    case 'reverse-shipments':
    case 'tracking': 
      return <ShipmentPage />;
    case 'courier-selection':
      return <CourierPartnerSelection />;
    
    // Finance
    case 'finance':
    case 'cod-remittance':
      return <CODRemittance />;
    case 'wallet-transaction':
      return <WalletTransaction />;
    case 'early-cod':
      return <EarlyCODPlans />;
    case 'invoice':
      return <InvoiceManagement />;
    
    // Settings
    case 'settings':
    case 'billing':
      return <Billing />;
    
    // Support
    case 'support':
    case 'support-dashboard':
      return <SupportDashboard />;
    case 'create-ticket':
      return <CreateTicket />;
    
    default:
      return renderOnboardingStep();
  }
};

export default OnboardingContent;
