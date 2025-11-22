import React, { useState, useEffect, useRef } from 'react';
import { Settings, User, ChevronDown, LogOut, Sun, Moon, Search, Loader2, Sparkles, Package, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { getSessionInfo } from '@/utils/authUtils';
import { getApiUrl, getAuthHeaders } from '@/config/api';
import API_CONFIG from '@/config/api';
import { clearAllDataExceptPasswords } from '@/utils/clearAllData';

// Search result interface
interface SearchResult {
  id: number;
  store_order_id: number;
  awb: string | null;
  customer_number: string;
  shipment_date?: string;
  shipment_status?: string;
  order_date?: string;
  store_order: {
    id: number;
    order_no: string;
  };
}

const AppHeader: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const sessionInfo = getSessionInfo();

  // Search related state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set loading state based on user data availability
  useEffect(() => {
    if (user && user.name) {
      setIsUserDataLoading(false);
    } else {
      // If no user data after 2 seconds, set loading to false to show fallback
      const timer = setTimeout(() => {
        setIsUserDataLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Get display name with proper fallback logic
  const getDisplayName = () => {
    if (isUserDataLoading) {
      return 'Loading...';
    }
    
    if (user?.name) {
      return user.name;
    }
    
    // Try to get name from other sources
    const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.name) {
          return parsedUser.name;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Final fallback - show email prefix if available
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'Guest';
  };

  const handleLogout = () => {
    console.log('🧹 Logging out - clearing all data except password refills...');
    clearAllDataExceptPasswords();
    navigate('/login');
  };

  const handleAIClick = () => {
    navigate('/ai');
  };

  // Search API function
  const searchAWB = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Required",
          description: "Please login to search",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AWB_SEARCH), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(authToken),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ value: query.trim() })
      });

      const data = await response.json();
      
      // Check for session expiry
      if (response.status === 401 || 
          data.message === 'Session expired' || 
          data.error?.message === 'Your session has expired. Please log in again to continue.' ||
          (data.status === 'false' && data.message === 'Session expired')) {
        console.log('🔒 Session expired detected in AppHeader search');
        window.dispatchEvent(new CustomEvent('sessionExpired'));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      if (data.status && data.data) {
        setSearchResults(data.data);
        setShowSearchDropdown(true);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchDropdown(false);
      toast({
        title: "Search Failed",
        description: "Unable to search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchAWB(value);
    }, 300); // 300ms delay
  };

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    
    if (result.awb) {
      // Navigate to shipment details if AWB exists
      navigate(`/dashboard/shipment/${result.awb}`);
    } else {
      // Navigate to order details if no AWB
      navigate(`/dashboard/orders/${result.store_order_id}`);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full bg-white shadow-sm border-b border-purple-200 px-6 py-4 flex items-center justify-between z-40">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative" ref={searchInputRef}>
          <Input
            ref={searchInputRef}
            placeholder="Search by AWb, Order Id, Customer Number"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 h-10 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-200/50 focus:bg-white focus:border-purple-400 transition-all duration-300"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-4 h-4 text-muted-foreground" />
          </span>
          {isSearching && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </span>
          )}
          
          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-purple-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={`${result.id}-${result.store_order_id}`}
                  onClick={() => handleSearchResultClick(result)}
                  className="p-4 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-900">
                          {result.store_order.order_no}
                        </span>
                        {result.awb && (
                          <span className="text-sm text-gray-600">
                            AWB {result.awb}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {result.shipment_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(result.shipment_date)}</span>
                          </div>
                        )}
                        {result.shipment_status && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {result.shipment_status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      {result.awb ? 'Shipment' : 'Order'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* No Results */}
          {showSearchDropdown && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-purple-200 rounded-lg shadow-xl z-50 p-4">
              <div className="text-center text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Right Side */}
      <div className="flex items-center space-x-4 ml-4">
        {/* ParcelAce AI Button */}
        <Button 
          onClick={handleAIClick}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 text-white font-medium shadow-md hover:from-purple-600 hover:via-pink-600 hover:to-blue-700 transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">ParcelAce AI</span>
        </Button>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 w-10 p-0 border-purple-200/50 flex items-center hover:bg-purple-50 transition-colors duration-200">
              <Settings className="w-4 h-4 text-purple-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white rounded-lg shadow-xl border border-purple-200 z-[70] animate-fade-in min-w-[200px]">
            <DropdownMenuLabel className="text-purple-600 font-semibold px-4 py-2">Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 px-3 border-purple-200/50 flex items-center hover:bg-purple-50 transition-colors duration-200">
              <User className="w-4 h-4 mr-2 text-purple-600" />
              <span className="text-sm">{getDisplayName()}</span>
              <ChevronDown className="w-3 h-3 ml-2 text-purple-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white rounded-lg shadow-xl border border-purple-200 z-[70] animate-fade-in min-w-[180px]">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-200">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Session Status Indicator - Removed as isSessionValid is not available */}
      </div>
    </header>
  );
};

export default AppHeader; 