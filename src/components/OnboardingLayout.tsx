import React, { useState } from 'react';
import { 
  Search, 
  Wallet, 
  CreditCard, 
  Zap, 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  ChevronRight,
  Home,
  Package,
  Truck,
  MoreHorizontal,
  LogOut,
  FileText,
  CheckCircle,
  Circle,
  Fingerprint,
  Tag,
  Receipt,
  MapPin,
  CreditCard as BankIcon,
  Bolt,
  Link,
  MessageSquare,
  AlertTriangle,
  Phone,
  DollarSign,
  MessageCircle,
  Headphones,
  History,
  Route,
  RefreshCw,
  Sparkles,
  BarChart3,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import OnboardingContent from './OnboardingContent';
import NotificationPanel from './NotificationPanel';

import { useNavigate, Outlet } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';
import API_CONFIG from '@/config/api';
import AppHeader from './AppHeader';


interface MenuItem {
  id: string;
  title: string;
  icon: any;
  subItems?: MenuItem[];
  isCompleted?: boolean;
  progress?: number;
  route?: string; // Added for navigation
}

const OnboardingLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['onboarding']);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const { walletBalance, updateWalletBalance, user } = useUser();

  // Update wallet balance on mount and when wallet is updated
  useEffect(() => {
    updateWalletBalance();
    
    const handleWalletUpdate = () => {
      updateWalletBalance();
    };
    
    window.addEventListener('walletBalanceUpdated', handleWalletUpdate);
    
    return () => {
      window.removeEventListener('walletBalanceUpdated', handleWalletUpdate);
    };
  }, [updateWalletBalance]);

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      route: '/dashboard/profile'
    },
    {
      id: 'ai',
      title: 'ParcelAce AI',
      icon: Sparkles,
      route: '/dashboard/ai'
    },
    {
      id: 'view-order',
      title: 'Shipment View Details',
      icon: Package,
      route: '/dashboard/orders/view'
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      icon: Home,
      progress: 30,
      subItems: [
        { id: 'checklist', title: 'Onboarding Checklist', icon: CheckCircle, progress: 60 },
        { id: 'kyc', title: 'KYC Verification', icon: Fingerprint, progress: 0, route: '/dashboard/kyc' },
        { id: 'integration', title: 'Shopify Integration', icon: Circle, progress: 0 }
      ]
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: Package,
      subItems: [
        { id: 'prepaid-orders', title: 'Prepaid Orders', icon: Package },
        { id: 'reverse-orders', title: 'Reverse Orders', icon: Package }
      ]
    },
    {
      id: 'shipments',
      title: 'Shipments',
      icon: Truck,
      subItems: [
        { id: 'prepaid-shipments', title: 'Prepaid Shipments', icon: Truck },
        { id: 'reverse-shipments', title: 'Reverse Shipments', icon: Truck },
        { id: 'tracking', title: 'Tracking', icon: Truck },
        { id: 'tracking-page', title: 'Tracking Page', icon: MapPin },
        { id: 'courier-selection', title: 'Courier Selection', icon: Route }
      ]
    },
    {
      id: 'finance',
      title: 'Finance',
      icon: DollarSign,
      subItems: [
        { id: 'cod-remittance', title: 'COD Remittance', icon: Receipt },
        { id: 'wallet-transaction', title: 'Wallet Transaction', icon: Wallet },
        { id: 'early-cod', title: 'Early COD', icon: Zap },
        { id: 'invoice', title: 'Invoice', icon: FileText }
      ]
    },
    {
      id: 'postship',
      title: 'Postship',
      icon: RefreshCw,
      subItems: [
        { id: 'return-pro', title: 'Return Pro', icon: Package }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      subItems: [
        { id: 'billing', title: 'Billing', icon: CreditCard },
        { id: 'invoice-settings', title: 'Invoice Settings', icon: FileText },
        { id: 'tracking-page', title: 'Tracking Page', icon: Tag },
        { id: 'warehouse', title: 'Warehouse', icon: MapPin }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      icon: MessageSquare,
      route: '/dashboard/support/support-dashboard'
    },

    {
      id: 'reports',
      title: 'Reports',
      icon: BarChart3,
      subItems: [
        { id: 'daily-report', title: 'Daily Report', icon: BarChart3 },
        { id: 'admin-email', title: 'Admin Email Reports', icon: Mail }
      ]
    },

  ];

  const routeMapping: { [key: string]: string } = {
    // Dashboard Routes (Primary)
    'profile': '/dashboard/profile',
    'ai': '/dashboard/ai',
    'checklist': '/onboarding/checklist',
    'integration': '/onboarding/shopify-integration',
    'aadhar-verification': '/dashboard/kyc',
    'pan-verification': '/dashboard/kyc',
    'bank-verification': '/dashboard/kyc',
    'gst-verification': '/dashboard/kyc',
    'prepaid-orders': '/dashboard/orders/prepaid',
    'reverse-orders': '/dashboard/orders/reverse',
    'prepaid-shipments': '/dashboard/shipments/prepaid',
    'reverse-shipments': '/dashboard/shipments/reverse',
    'tracking': '/dashboard/shipments/tracking',
    'tracking-page': '/dashboard/settings/tracking-page',
    'courier-selection': '/dashboard/shipments/courier-selection',
    'cod-remittance': '/dashboard/finance/cod-remittance',
    'wallet-transaction': '/dashboard/finance/wallet-transaction',
    'early-cod': '/dashboard/finance/early-cod',
    'invoice': '/dashboard/finance/invoice',
    'return-pro': '/onboarding/postship/return-pro',
    'billing': '/dashboard/settings/billing',
    'invoice-settings': '/dashboard/settings/invoice-settings',
    'warehouse': '/dashboard/warehouse',
    'warehouse-location': '/dashboard/settings/warehouse',
    'support-dashboard': '/dashboard/support/support-dashboard',
    'create-ticket': '/dashboard/support/create-ticket',
    'daily-report': '/dashboard/reports/daily',
    'admin-email': '/dashboard/reports/admin-email',

  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuClick = (menuId: string) => {
    if (menuItems.find(item => item.id === menuId)?.route) {
      navigate(menuItems.find(item => item.id === menuId)?.route || '/');
    }
    if (menuItems.find(item => item.id === menuId)?.subItems && menuItems.find(item => item.id === menuId)?.subItems.length > 0) {
      toggleMenu(menuId);
    }
  };

  const settingsOptions = [
    { icon: Tag, label: 'Shipping Labels' },
    { icon: Receipt, label: 'Billing & Invoices' },
    { icon: MapPin, label: 'Warehouse Location' },
    { icon: BankIcon, label: 'Bank Accounts' },
    { icon: Bolt, label: 'Courier Priority' },
    { icon: Link, label: 'Tracking Links' },
    { icon: MessageSquare, label: 'WhatsApp Notifications' },
    { icon: AlertTriangle, label: 'Admin Alerts' },
    { icon: Phone, label: 'Contact Person' }
  ];

  const handleLogout = async () => {
    try {
      const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      
      if (authToken) {
        const response = await fetch(`${API_CONFIG.BASE_URL}api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('Logout successful');
        } else {
          console.error('Logout API failed:', response.status);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all session data
      sessionStorage.clear();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Redirect to login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white/95 via-blue-50/90 to-purple-50/95 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-2xl transition-all duration-300 z-50 border-r border-purple-200/30 dark:border-purple-800/30 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gradient-to-r from-pink-200/30 via-blue-200/30 to-purple-200/30 dark:from-pink-800/30 dark:via-blue-800/30 dark:to-purple-800/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-foreground bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">ShipFast</span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-4">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.route) navigate(item.route);
                  if (item.subItems && item.subItems.length > 0) toggleMenu(item.id);
                }}
                className={`w-full flex items-center px-4 py-3 text-left transition-all duration-300 group relative overflow-hidden ${
                  item.route && window.location.pathname === item.route
                    ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 border-r-3 border-gradient-to-b from-pink-500 via-purple-500 to-blue-500 shadow-lg backdrop-blur-sm' 
                    : 'hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-purple-500/10 hover:to-blue-500/10 hover:shadow-md hover:backdrop-blur-sm'
                }`}
              >
                {/* Animated background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <item.icon className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                  item.route && window.location.pathname === item.route
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400'
                }`} />
                {sidebarOpen && (
                  <>
                    <span className={`ml-3 flex-1 relative z-10 transition-colors duration-300 ${
                      item.route && window.location.pathname === item.route
                        ? 'text-foreground font-medium' 
                        : 'text-foreground group-hover:text-foreground group-hover:font-medium'
                    }`}>{item.title}</span>
                    {item.progress !== undefined && (
                      <div className="w-8 h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full mr-2 overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.subItems && (
                      <div className={`transition-transform duration-300 ${
                        expandedMenus.includes(item.id) ? 'rotate-90' : ''
                      }`}>
                        {expandedMenus.includes(item.id) ? 
                          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" /> :
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                        }
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Sub Menu Items */}
              {sidebarOpen && item.subItems && expandedMenus.includes(item.id) && (
                <div className="ml-8 space-y-1 animate-fade-in">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (routeMapping[subItem.id]) navigate(routeMapping[subItem.id]);
                      }}
                      className={`w-full flex items-center px-4 py-2 text-left transition-all duration-300 group relative overflow-hidden rounded-lg mx-2 ${
                        window.location.pathname === routeMapping[subItem.id]
                          ? 'bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-blue-500/15 text-purple-600 dark:text-purple-400 shadow-md backdrop-blur-sm' 
                          : 'text-muted-foreground hover:bg-gradient-to-r hover:from-pink-500/8 hover:via-purple-500/8 hover:to-blue-500/8 hover:text-purple-600 dark:hover:text-purple-400 hover:shadow-sm hover:backdrop-blur-sm'
                      }`}
                    >
                      {/* Animated background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/3 via-purple-500/3 to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      
                      <subItem.icon className="w-4 h-4 relative z-10 transition-colors duration-300" />
                      <span className="ml-3 text-sm relative z-10 transition-all duration-300 group-hover:font-medium">{subItem.title}</span>
                      {subItem.progress !== undefined && (
                        <div className="ml-auto w-6 h-1.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${subItem.progress}%` }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <AppHeader />
        {/* Main Content Area */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>



      {/* Click outside to close dropdowns */}
      {(showProfileDropdown || showSettingsDropdown) && (
        <div 
          className="fixed inset-0 z-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowProfileDropdown(false);
            setShowSettingsDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default OnboardingLayout;
