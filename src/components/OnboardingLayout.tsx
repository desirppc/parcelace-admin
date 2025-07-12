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
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import OnboardingContent from './OnboardingContent';
import NotificationPanel from './NotificationPanel';

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  subItems?: MenuItem[];
  isCompleted?: boolean;
  progress?: number;
}

const OnboardingLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['onboarding']);
  const [activeMenuItem, setActiveMenuItem] = useState('onboarding');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'onboarding',
      title: 'Onboarding',
      icon: Home,
      progress: 30,
      subItems: [
        { id: 'account-setup', title: 'Account Setup', icon: CheckCircle, progress: 60 },
        { id: 'integration', title: 'Shopify Integration', icon: Circle, progress: 0 },
        { id: 'first-shipment', title: 'First Shipment', icon: Circle, progress: 0 }
      ]
    },
    {
      id: 'kyc',
      title: 'KYC Verification',
      icon: Fingerprint,
      progress: 0,
      subItems: [
        { id: 'aadhar-verification', title: 'Aadhar Verification', icon: Circle, progress: 0 },
        { id: 'pan-verification', title: 'PAN Verification', icon: Circle, progress: 0 },
        { id: 'bank-verification', title: 'Bank Verification', icon: Circle, progress: 0 },
        { id: 'gst-verification', title: 'GST Verification', icon: Circle, progress: 0 }
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
        { id: 'tracking-page', title: 'Tracking Page', icon: Tag }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      icon: MessageSquare,
      subItems: [
        { id: 'support-dashboard', title: 'Support Dashboard', icon: MessageCircle },
        { id: 'create-ticket', title: 'Create Ticket', icon: MessageSquare },
        { id: 'my-tickets', title: 'My Tickets', icon: FileText },
        { id: 'ticket-history', title: 'Ticket History', icon: History }
      ]
    }
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuClick = (menuId: string) => {
    setActiveMenuItem(menuId);
    const menuItem = menuItems.find(item => item.id === menuId);
    if (menuItem?.subItems && menuItem.subItems.length > 0) {
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
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left transition-all duration-300 group relative overflow-hidden ${
                  activeMenuItem === item.id 
                    ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 border-r-3 border-gradient-to-b from-pink-500 via-purple-500 to-blue-500 shadow-lg backdrop-blur-sm' 
                    : 'hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-purple-500/10 hover:to-blue-500/10 hover:shadow-md hover:backdrop-blur-sm'
                }`}
              >
                {/* Animated background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <item.icon className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                  activeMenuItem === item.id 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400'
                }`} />
                {sidebarOpen && (
                  <>
                    <span className={`ml-3 flex-1 relative z-10 transition-colors duration-300 ${
                      activeMenuItem === item.id 
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
                      onClick={() => setActiveMenuItem(subItem.id)}
                      className={`w-full flex items-center px-4 py-2 text-left transition-all duration-300 group relative overflow-hidden rounded-lg mx-2 ${
                        activeMenuItem === subItem.id 
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
        {/* Top Bar */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 shadow-sm border-b border-purple-200/30 dark:border-purple-800/30 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search order ID, tracking ID..."
                  className="pl-10 h-10 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200/50 dark:border-purple-800/50 focus:bg-white dark:focus:bg-gray-900 focus:border-purple-400 dark:focus:border-purple-600 transition-all duration-300"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Wallet Balance */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/30 dark:to-blue-900/30 px-3 py-2 rounded-lg border border-purple-200/30 dark:border-purple-800/30 backdrop-blur-sm">
                <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-foreground">₹2,450</span>
              </div>

              {/* Recharge Button */}
              <Button 
                onClick={() => setShowRechargeModal(true)}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white px-4 py-2 h-10 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Recharge Now
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Quick Actions */}
              <Button variant="outline" className="h-10 w-10 p-0 border-purple-200/50 dark:border-purple-800/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </Button>

              {/* Notifications */}
              <NotificationPanel />

              {/* Settings Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="h-10 w-10 p-0 border-purple-200/50 dark:border-purple-800/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                >
                  <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </Button>
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-purple-200/30 dark:border-purple-800/30 z-50 animate-fade-in">
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        {settingsOptions.map((option, index) => (
                          <button
                            key={index}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 text-left transition-all duration-300 group"
                          >
                            <option.icon className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300" />
                            <span className="text-sm font-medium text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="h-10 px-3 border-purple-200/50 dark:border-purple-800/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <User className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm">John Doe</span>
                  <ChevronDown className="w-3 h-3 ml-2 text-purple-600 dark:text-purple-400" />
                </Button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-purple-200/30 dark:border-purple-800/30 z-10 animate-fade-in">
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 text-sm flex items-center transition-all duration-300">
                        <User className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                        Profile
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 text-sm flex items-center transition-all duration-300">
                        <FileText className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                        Terms & Conditions
                      </button>
                      <hr className="my-1 border-purple-200/30 dark:border-purple-800/30" />
                      <button className="w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 text-sm flex items-center text-red-600 dark:text-red-400 transition-all duration-300">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          <OnboardingContent activeMenuItem={activeMenuItem} />
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg p-6 w-full max-w-md shadow-2xl border border-purple-200/30 dark:border-purple-800/30">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Recharge Wallet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amount
                </label>
                <Input placeholder="Enter amount" className="w-full border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600 transition-all duration-300" />
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowRechargeModal(false)}
                  variant="outline" 
                  className="flex-1 border-purple-200/50 dark:border-purple-800/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowRechargeModal(false)}
                  className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Recharge
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showProfileDropdown || showSettingsDropdown) && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowSettingsDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default OnboardingLayout;
