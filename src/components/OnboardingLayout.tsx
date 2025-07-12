
import React, { useState } from 'react';
import { 
  Home, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  Headset, 
  ShieldCheck, 
  Package,
  ChevronDown,
  ChevronRight,
  FileText,
  CreditCard,
  Building,
  Landmark
} from 'lucide-react';
import OnboardingContent from './OnboardingContent';
import Header from './Header';
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  hasSubmenu: boolean;
  submenu: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  description: string;
}

const OnboardingLayout = () => {
  const [activeMenuItem, setActiveMenuItem] = useState<string>('onboarding');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['onboarding']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuItemClick = (id: string) => {
    setActiveMenuItem(id);
  };

  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: Home,
      description: 'Get started with ShipFast',
      hasSubmenu: true,
      submenu: [
        { id: 'account-setup', label: 'Account Setup', description: 'Setup your account' },
        { id: 'integration', label: 'Store Integration', description: 'Connect your store' },
        { id: 'first-shipment', label: 'First Shipment', description: 'Create your first shipment' },
      ]
    },
    {
      id: 'kyc',
      label: 'KYC Verification',
      icon: ShieldCheck,
      description: 'Complete your KYC verification',
      hasSubmenu: true,
      submenu: [
        { id: 'kyc-overview', label: 'KYC Overview', description: 'View verification status' },
        { id: 'aadhar-verification', label: 'Aadhar Verification', description: 'Verify Aadhar card' },
        { id: 'pan-verification', label: 'PAN Verification', description: 'Verify PAN card' },
        { id: 'gst-verification', label: 'GST Verification', description: 'Verify GST registration' },
        { id: 'bank-verification', label: 'Bank Verification', description: 'Verify bank account' },
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      description: 'Manage your orders',
      hasSubmenu: true,
      submenu: [
        { id: 'orders', label: 'All Orders', description: 'View all orders' },
        { id: 'prepaid-orders', label: 'Prepaid Orders', description: 'Prepaid orders only' },
        { id: 'reverse-orders', label: 'Reverse Orders', description: 'Return orders' },
      ]
    },
    {
      id: 'shipments',
      label: 'Shipments',
      icon: Package,
      description: 'Manage shipments and tracking',
      hasSubmenu: true,
      submenu: [
        { id: 'shipments', label: 'All Shipments', description: 'View all shipments' },
        { id: 'prepaid-shipments', label: 'Prepaid Shipments', description: 'Prepaid orders only' },
        { id: 'reverse-shipments', label: 'Reverse Shipments', description: 'Return orders' },
        { id: 'tracking', label: 'Track Shipments', description: 'Track shipment status' },
        { id: 'courier-selection', label: 'Select Courier Partner', description: 'Choose courier partner and rates' },
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: Wallet,
      description: 'Manage your finances',
      hasSubmenu: true,
      submenu: [
        { id: 'cod-remittance', label: 'COD Remittance', description: 'View COD remittance' },
        { id: 'wallet-transaction', label: 'Wallet Transactions', description: 'Track wallet transactions' },
        { id: 'early-cod', label: 'Early COD Plans', description: 'Manage early COD settings' },
        { id: 'invoice', label: 'Invoice Management', description: 'Manage invoices' },
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: Headset,
      description: 'Get support',
      hasSubmenu: true,
      submenu: [
        { id: 'support-dashboard', label: 'Support Dashboard', description: 'View support dashboard' },
        { id: 'create-ticket', label: 'Create Ticket', description: 'Create a new support ticket' },
        { id: 'my-tickets', label: 'My Tickets', description: 'View your tickets' },
        { id: 'ticket-history', label: 'Ticket History', description: 'View closed tickets' },
      ]
    },
  ];

  const renderMenuItems = () => {
    return menuItems.map((menuItem) => (
      <div key={menuItem.id} className="mb-2">
        <Button
          variant="ghost"
          className={`w-full justify-start px-3 py-2 h-10 text-left hover:bg-accent hover:text-accent-foreground ${
            expandedMenus.includes(menuItem.id) ? 'bg-accent/50' : ''
          }`}
          onClick={() => toggleMenuExpansion(menuItem.id)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <menuItem.icon className="w-5 h-5 text-muted-foreground" />
              {!sidebarCollapsed && (
                <span className="font-medium">{menuItem.label}</span>
              )}
            </div>
            {!sidebarCollapsed && menuItem.hasSubmenu && (
              expandedMenus.includes(menuItem.id) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )
            )}
          </div>
        </Button>

        {/* Submenu */}
        {menuItem.hasSubmenu && expandedMenus.includes(menuItem.id) && !sidebarCollapsed && (
          <div className="ml-6 mt-1 space-y-1">
            {menuItem.submenu.map((submenuItem) => (
              <Button
                key={submenuItem.id}
                variant="ghost"
                className={`w-full justify-start px-3 py-2 h-9 text-sm hover:bg-accent hover:text-accent-foreground ${
                  activeMenuItem === submenuItem.id ? 'bg-secondary text-secondary-foreground' : ''
                }`}
                onClick={() => handleMenuItemClick(submenuItem.id)}
              >
                <span>{submenuItem.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-secondary/30 border-r border-border transition-all duration-300 flex flex-col`}>
          <div className="p-4 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-center"
            >
              {sidebarCollapsed ? '→' : '←'}
            </Button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            {renderMenuItems()}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <OnboardingContent activeMenuItem={activeMenuItem} />
        </main>
      </div>
    </div>
  );
};

export default OnboardingLayout;
