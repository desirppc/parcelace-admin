
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  BarChart, 
  Settings, 
  Menu,
  Package,
  FileText,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import NotificationPanel from './NotificationPanel';

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('onboarding');

  const menuItems = [
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: LayoutDashboard
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart
    },
    {
      id: 'shipments',
      label: 'Shipments',
      icon: Package
    },
    {
      id: 'prepaid-orders',
      label: 'Prepaid Orders',
      icon: CreditCard
    },
    {
      id: 'reverse-orders',
      label: 'Reverse Orders',
      icon: RotateCcw
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${isSidebarExpanded ? 'w-64' : 'w-16'} transition-all duration-300 bg-background/80 backdrop-blur-sm border-r border-border shadow-lg`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-center h-16 border-b border-border p-4">
            <h1 className={`text-2xl font-bold transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
              ShipFast
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenuItem(item.id)}
                    className={`w-full flex items-center px-3 py-3 rounded-xl text-left transition-all duration-200 group ${
                      activeMenuItem === item.id
                        ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white shadow-lg transform scale-105'
                        : 'text-muted-foreground hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10 hover:text-foreground hover:shadow-md hover:scale-105 hover:border-primary/20'
                    }`}
                  >
                    <item.icon className={`${isSidebarExpanded ? 'w-5 h-5 mr-3' : 'w-5 h-5'} transition-transform duration-200 ${
                      activeMenuItem === item.id ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    {isSidebarExpanded && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                    {!isSidebarExpanded && activeMenuItem === item.id && (
                      <div className="absolute left-16 bg-gradient-to-r from-pink-500 to-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ShipFast © 2024
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  className="hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-semibold text-foreground">
                  {menuItems.find(item => item.id === activeMenuItem)?.label || 'Dashboard'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <NotificationPanel />
                <ThemeToggle />
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">John Doe</p>
                    <p className="text-xs text-muted-foreground">john@example.com</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
