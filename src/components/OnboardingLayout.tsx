import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Wallet, 
  CreditCard, 
  Zap, 
  Bell, 
  Settings, 
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
  RefreshCw,
  RotateCcw,
  BarChart3,
  Mail,
  Building,
  Star,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OnboardingContent from './OnboardingContent';
import NotificationPanel from './NotificationPanel';

import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import API_CONFIG from '@/config/api';
import AppHeader from './AppHeader';
import { clearAllDataExceptPasswords } from '@/utils/clearAllData';


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
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  // Add refs for timeout management
  const sidebarTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'orders',
      title: 'Orders',
      icon: Package,
      route: '/dashboard/orders'
    },
    {
      id: 'fe-number',
      title: 'FE Number',
      icon: FileText,
      route: '/dashboard/fe-number'
    },
    {
      id: 'shipments',
      title: 'Shipments',
      icon: Truck,
      route: '/dashboard/prepaid-shipments',
      subItems: [
        {
          id: 'prepaid-shipments',
          title: 'Prepaid Shipment',
          icon: CreditCard,
          route: '/dashboard/prepaid-shipments'
        },
        {
          id: 'reverse-shipments',
          title: 'Reverse Shipment',
          icon: RotateCcw,
          route: '/dashboard/reverse-shipments'
        }
      ]
    },
    {
      id: 'action-needed',
      title: 'Action Needed',
      icon: AlertTriangle,
      route: '/dashboard/action-needed'
    },
    {
      id: 'support',
      title: 'Support',
      icon: Headphones,
      route: '/dashboard/support/support-dashboard'
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      icon: MessageCircle,
      route: '/dashboard/ai'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      route: '/dashboard/analytics'
    },
    {
      id: 'users',
      title: 'Support Users',
      icon: User,
      route: '/dashboard/support-user'
    },
    {
      id: 'vendors',
      title: 'Vendors',
      icon: Building,
      route: '/dashboard/vendors'
    }
  ];

  const routeMapping: { [key: string]: string } = {
    // Dashboard Routes (Primary)
    'orders': '/dashboard/orders',
    'fe-number': '/dashboard/fe-number',
    'shipments': '/dashboard/prepaid-shipments',
    'prepaid-shipments': '/dashboard/prepaid-shipments',
    'reverse-shipments': '/dashboard/reverse-shipments',
    'action-needed': '/dashboard/action-needed',
    'support': '/dashboard/support/support-dashboard',
    'ai': '/dashboard/ai',
    'analytics': '/dashboard/analytics',
    'users': '/dashboard/support-user',
    'vendors': '/dashboard/vendors'
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
          console.log('Logout API call successful');
        } else {
          console.error('Logout API failed:', response.status);
        }
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all application data except password refills
      console.log('🧹 Clearing all data except password refills...');
      clearAllDataExceptPasswords();
      
      // Redirect to login
      navigate('/login');
    }
  };

  // Add auto-close functionality for sidebar
  const handleSidebarMouseEnter = () => {
    // Clear any existing timeout
    if (sidebarTimeoutRef.current) {
      clearTimeout(sidebarTimeoutRef.current);
      sidebarTimeoutRef.current = null;
    }
    setSidebarOpen(true);
  };

  const handleSidebarMouseLeave = () => {
    // Set a delay before closing to prevent flickering
    // This delay allows users to move between sidebar and submenus
    sidebarTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
      // Auto-close all submenus when sidebar closes
      setExpandedMenus([]);
    }, 500); // Increased to 500ms for better UX when navigating submenus
  };

  // Add auto-close functionality for submenus
  const handleSubmenuMouseEnter = () => {
    // Clear any existing submenu timeout
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
      submenuTimeoutRef.current = null;
    }
    // Keep sidebar open when hovering over submenus
    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  const handleSubmenuMouseLeave = () => {
    // Set a delay before closing submenus
    submenuTimeoutRef.current = setTimeout(() => {
      if (!sidebarOpen) {
        setExpandedMenus([]);
      }
    }, 300); // Increased to 300ms for better UX
  };

  // Close submenus when sidebar closes
  useEffect(() => {
    if (!sidebarOpen) {
      setExpandedMenus([]);
    }
  }, [sidebarOpen]);

  // Auto-expand shipments menu when on shipment pages
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/dashboard/prepaid-shipments') || pathname.includes('/dashboard/reverse-shipments') || pathname.includes('/dashboard/action-needed')) {
      setExpandedMenus(prev => {
        if (!prev.includes('shipments')) {
          return [...prev, 'shipments'];
        }
        return prev;
      });
    }
  }, [location.pathname]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (sidebarTimeoutRef.current) {
        clearTimeout(sidebarTimeoutRef.current);
      }
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex">
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white/95 via-blue-50/90 to-purple-50/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-2xl transition-all duration-300 z-50 border-r border-purple-200/30 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gradient-to-r from-pink-200/30 via-blue-200/30 to-purple-200/30">
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
                    ? 'text-purple-600' 
                    : 'text-muted-foreground group-hover:text-purple-600'
                }`} />
                {sidebarOpen && (
                  <>
                    <span className={`ml-3 flex-1 relative z-10 transition-colors duration-300 ${
                      item.route && window.location.pathname === item.route
                        ? 'text-foreground font-medium' 
                        : 'text-foreground group-hover:text-foreground group-hover:font-medium'
                    }`}>{item.title}</span>
                    {item.progress !== undefined && (
                      <div className="w-8 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mr-2 overflow-hidden shadow-inner">
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
                          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 transition-colors duration-300" /> :
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 transition-colors duration-300" />
                        }
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Sub Menu Items */}
              {sidebarOpen && item.subItems && expandedMenus.includes(item.id) && (
                <div 
                  className="ml-8 space-y-1 animate-fade-in"
                  onMouseEnter={handleSubmenuMouseEnter}
                  onMouseLeave={handleSubmenuMouseLeave}
                >
                  {item.subItems.map((subItem) => {
                    const subItemRoute = subItem.route || routeMapping[subItem.id];
                    return (
                      <button
                        key={subItem.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (subItemRoute) navigate(subItemRoute);
                        }}
                        className={`w-full flex items-center px-4 py-2 text-left transition-all duration-300 group relative overflow-hidden rounded-lg mx-2 ${
                          window.location.pathname === subItemRoute
                            ? 'bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-blue-500/15 text-purple-600 shadow-md backdrop-blur-sm' 
                            : 'text-muted-foreground hover:bg-gradient-to-r hover:from-pink-500/8 hover:via-purple-500/8 hover:to-blue-500/8 hover:text-purple-600 hover:shadow-sm hover:backdrop-blur-sm'
                        }`}
                      >
                        {/* Animated background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/3 via-purple-500/3 to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                        
                        <subItem.icon className="w-4 h-4 relative z-10 transition-colors duration-300" />
                        <span className="ml-3 text-sm relative z-10 transition-all duration-300 group-hover:font-medium">{subItem.title}</span>
                        {subItem.progress !== undefined && (
                          <div className="ml-auto w-6 h-1.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${subItem.progress}%` }}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}
        onClick={() => {
          // Close sidebar and submenus when clicking on main content
          if (sidebarOpen) {
            setSidebarOpen(false);
            setExpandedMenus([]);
          }
        }}
      >
        {/* Header */}
        <AppHeader />
        {/* Main Content Area */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {showSettingsDropdown && (
        <div 
          className="fixed inset-0 z-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowSettingsDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default OnboardingLayout;

