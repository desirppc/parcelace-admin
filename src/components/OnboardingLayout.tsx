
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
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OnboardingContent from './OnboardingContent';

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
        { id: 'tracking', title: 'Tracking', icon: Truck }
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-gray-900">ShipFast</span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-4">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                  activeMenuItem === item.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <item.icon className="w-5 h-5 text-gray-600" />
                {sidebarOpen && (
                  <>
                    <span className="ml-3 flex-1 text-gray-700">{item.title}</span>
                    {item.progress !== undefined && (
                      <div className="w-8 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.subItems && (
                      expandedMenus.includes(item.id) ? 
                        <ChevronDown className="w-4 h-4 text-gray-400" /> :
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </>
                )}
              </button>

              {/* Sub Menu Items */}
              {sidebarOpen && item.subItems && expandedMenus.includes(item.id) && (
                <div className="ml-8 space-y-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveMenuItem(subItem.id)}
                      className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                        activeMenuItem === subItem.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      <subItem.icon className="w-4 h-4" />
                      <span className="ml-3 text-sm">{subItem.title}</span>
                      {subItem.progress !== undefined && (
                        <div className="ml-auto w-6 h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
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
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search order ID, tracking ID..."
                  className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Wallet Balance */}
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Wallet className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">₹2,450</span>
              </div>

              {/* Recharge Button */}
              <Button 
                onClick={() => setShowRechargeModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 h-10"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Recharge Now
              </Button>

              {/* Quick Actions */}
              <Button variant="outline" className="h-10 w-10 p-0">
                <Zap className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <Button variant="outline" className="h-10 w-10 p-0 relative">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>

              {/* Settings Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="h-10 w-10 p-0"
                  onMouseEnter={() => setShowSettingsDropdown(true)}
                  onMouseLeave={() => setShowSettingsDropdown(false)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                {showSettingsDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
                    onMouseEnter={() => setShowSettingsDropdown(true)}
                    onMouseLeave={() => setShowSettingsDropdown(false)}
                  >
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">
                        Account Settings
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">
                        Preferences
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">
                        API Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="h-10 px-3"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm">John Doe</span>
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Terms & Conditions
                      </button>
                      <hr className="my-1" />
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center text-red-600">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Recharge Wallet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <Input placeholder="Enter amount" className="w-full" />
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowRechargeModal(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowRechargeModal(false)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
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
