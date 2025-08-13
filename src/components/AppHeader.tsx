import React, { useState, useEffect } from 'react';
import { Wallet, Settings, User, ChevronDown, LogOut, Sun, Moon, Search, Plus, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { razorpayService } from '@/services/razorpayService';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AppHeader: React.FC = () => {
  const { user, walletBalance, updateWalletBalance } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [amount, setAmount] = useState('500');
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);

  // Listen for wallet balance updates
  useEffect(() => {
    const handleWalletUpdate = (event: CustomEvent) => {
      console.log('Wallet balance updated via event:', event.detail);
      updateWalletBalance();
    };

    window.addEventListener('updateWalletBalance', handleWalletUpdate as EventListener);
    window.addEventListener('walletBalanceUpdated', handleWalletUpdate as EventListener);

    return () => {
      window.removeEventListener('updateWalletBalance', handleWalletUpdate as EventListener);
      window.removeEventListener('walletBalanceUpdated', handleWalletUpdate as EventListener);
    };
  }, [updateWalletBalance]);

  // Update wallet balance on component mount
  useEffect(() => {
    updateWalletBalance();
  }, [updateWalletBalance]);

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

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/login');
  };

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setAmount(value.toString());
  };

  const handleCustomAmount = (value: string) => {
    setAmount(value);
    setSelectedAmount(parseInt(value) || 0);
  };

  const currentBalance = walletBalance;
  const rechargeAmount = selectedAmount;
  const totalAmount = rechargeAmount;

  const handlePayment = async () => {
    if (totalAmount < 500) {
      toast({
        title: "Invalid Amount",
        description: "Minimum recharge amount is ₹500",
        variant: "destructive",
      });
      return;
    }

    if (totalAmount > 5000000) {
      toast({
        title: "Invalid Amount",
        description: "Maximum recharge amount is ₹50,00,000",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Starting payment process for amount:', totalAmount);
      await razorpayService.initiatePayment(totalAmount);
      // Don't show success message here - it will be shown after actual payment completion
      setIsRechargeOpen(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIClick = () => {
    navigate('/ai');
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-purple-200 dark:border-purple-800 px-6 py-4 flex items-center justify-between z-40">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Input
            placeholder="Search orders, tracking..."
            className="pl-10 h-10 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200/50 dark:border-purple-800/50 focus:bg-white dark:focus:bg-gray-900 focus:border-purple-400 dark:focus:border-purple-600 transition-all duration-300"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-4 h-4 text-muted-foreground" />
          </span>
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

        {/* Wallet Balance Display */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            ₹{walletBalance.toLocaleString()}
          </span>
        </div>

        {/* Recharge Button */}
        <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white font-medium shadow-md hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 transition-all duration-200">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Recharge</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800">
            <DialogTitle className="sr-only">Add money to wallet</DialogTitle>
            <div className="bg-white dark:bg-gray-900 rounded-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-200 dark:border-purple-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add money to wallet</h2>
              </div>

              {/* Current Balance Highlight */}
              <div className="px-6 pt-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Wallet Balance</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{currentBalance.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter amount in multiples of 100
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      className="pl-8 h-12 text-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                      placeholder="500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Min. value: ₹500 & Max value: ₹50,00000
                  </p>
                </div>

                {/* Quick Amount Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Or select from below</p>
                  <div className="flex flex-wrap gap-2">
                    {predefinedAmounts.map((value) => (
                      <Button
                        key={value}
                        variant={selectedAmount === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAmountSelect(value)}
                        className={`h-10 px-4 ${
                          selectedAmount === value 
                            ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        ₹ {value.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Total Amount Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Total Amount</h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Recharge Amount</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">₹{rechargeAmount.toLocaleString()}</span>
                  </div>
                  
                  <hr className="border-gray-200 dark:border-gray-700" />
                  
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-900 dark:text-gray-100">Total ₹</span>
                    <span className="text-gray-900 dark:text-gray-100">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Continue Button */}
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Continue to Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 w-10 p-0 border-purple-200/50 dark:border-purple-800/50 flex items-center hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
              <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-purple-200 dark:border-purple-800 z-[70] animate-fade-in min-w-[400px]">
            <DropdownMenuLabel className="text-purple-600 dark:text-purple-400 font-semibold px-4 py-2">Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="grid grid-cols-2 gap-0">
              <div className="p-2">
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  Shipping Labels
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  Billing & Invoices
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  Warehouse Location
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  Bank Accounts
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  Courier Priority
                </DropdownMenuItem>
              </div>
              <div className="p-2">
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  Tracking Links
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  WhatsApp Notifications
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  Admin Alerts
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  Contact Person
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer rounded-md mx-2 mb-1">
                  API Settings
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 px-3 border-purple-200/50 dark:border-purple-800/50 flex items-center hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
              <User className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm">{getDisplayName()}</span>
              <ChevronDown className="w-3 h-3 ml-2 text-purple-600 dark:text-purple-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-purple-200 dark:border-purple-800 z-[70] animate-fade-in min-w-[180px]">
                            <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} className="flex items-center hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors duration-200">
              <User className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-200">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader; 