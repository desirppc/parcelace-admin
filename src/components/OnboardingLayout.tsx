
import React, { useState } from 'react';
import { Home, ShoppingCart, Truck, Wallet, Headset, ShieldCheck, Package } from 'lucide-react';
import OnboardingContent from './OnboardingContent';
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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

  const handleMenuItemClick = (id: string) => {
    setActiveMenuItem(id);
  };

  const menuItems = [
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
        { id: 'kyc-verification', label: 'Identity Verification', description: 'Complete KYC process' },
        { id: 'kyc-status', label: 'Verification Status', description: 'Check verification status' },
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
      <AccordionItem value={menuItem.id} key={menuItem.id}>
        <AccordionTrigger className="data-[state=open]:text-secondary-foreground">
          <div className="flex items-center space-x-2">
            <menuItem.icon className="w-4 h-4" />
            <span>{menuItem.label}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="ml-6 mt-2 space-y-1">
            {menuItem.submenu.map((submenuItem) => (
              <li key={submenuItem.id}>
                <button
                  onClick={() => handleMenuItemClick(submenuItem.id)}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${activeMenuItem === submenuItem.id ? 'bg-secondary text-secondary-foreground' : ''}`}
                >
                  {submenuItem.label}
                </button>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    ));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        {/* Header Section */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-foreground">ShipFast</h1>
          <p className="text-sm text-muted-foreground">Dashboard</p>
        </div>
        
        {/* Navigation */}
        <div className="py-4">
          <Accordion type="single" collapsible className="w-full px-2">
            {renderMenuItems()}
          </Accordion>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {menuItems.find(item => 
                item.submenu.some(sub => sub.id === activeMenuItem)
              )?.submenu.find(sub => sub.id === activeMenuItem)?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {menuItems.find(item => 
                item.submenu.some(sub => sub.id === activeMenuItem)
              )?.submenu.find(sub => sub.id === activeMenuItem)?.description || 'Welcome to ShipFast'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <OnboardingContent activeMenuItem={activeMenuItem} />
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayout;
