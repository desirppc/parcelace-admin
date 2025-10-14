import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Upload, 
  Filter, 
  Download, 
  Search,
  Ship,
  X,
  Calendar,
  Check,
  AlertTriangle,
  Eye,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { orderService } from '@/services/orderService';
import API_CONFIG from '@/config/api';
import { getApiUrl, getAuthHeaders } from '@/config/api';
import { testImportAPI, testFileValidation } from '@/utils/testImportAPI';
import { CacheKeys, CacheGroups, getCache, setCache, clearCacheByPrefix } from '@/utils/cache';
import { EnhancedCacheKeys } from '@/utils/smartCache';
import { usePageMeta, PageMetaConfigs } from '@/hooks/usePageMeta';


const OrdersPage = () => {
  // Set page meta tags
  usePageMeta(PageMetaConfigs.orders);
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showBulkCancelConfirm, setShowBulkCancelConfirm] = useState(false);
  const [showBulkShipModal, setShowBulkShipModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [orderTypes, setOrderTypes] = useState({
    prepaid: false,
    cod: false,
    reverse: false,
    all: true
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Import order states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Courier selection states
  const [showCourierSelection, setShowCourierSelection] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<any>(null);
  
  // Filter API states
  const [filterLoading, setFilterLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSizeOptions = [10, 20, 50, 100, 200, 500];

  // Determine current page type based on URL
  const getCurrentPageType = () => {
    // Always return 'all' to show all order types
    return 'all';
  };

  const currentPageType = getCurrentPageType();

  useEffect(() => {
    const fetchOrders = async () => {
      const cacheKey = EnhancedCacheKeys.orders(currentPage, pageSize, currentPageType);
      
      // Clear any existing cache for orders to ensure fresh data
      clearCacheByPrefix(CacheGroups.orders);
      
      // Fetch fresh data directly without showing cached data first
      setLoading(true);
      try {
        let authToken = sessionStorage.getItem('auth_token');
        if (!authToken) authToken = localStorage.getItem('auth_token');
        console.log('Using auth_token for API:', authToken);
        
        // Build URL with pagination parameters
        const url = new URL(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order`);
        url.searchParams.set('per_page', pageSize.toString());
        url.searchParams.set('page', currentPage.toString());
        
        console.log('Fetching fresh orders with pagination:', { page: currentPage, per_page: pageSize });
        
        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        
        if (response.ok && data.status && data.data?.orders_data) {
          // Sort orders by latest first (by order_date or created_at)
          const sortedOrders = data.data.orders_data.sort((a: any, b: any) => {
            const dateA = new Date(a.order_date || a.created_at || a.sync_date || 0);
            const dateB = new Date(b.order_date || b.created_at || b.sync_date || 0);
            return dateB.getTime() - dateA.getTime();
          });
          
          const totalOrders = data.data.pagination?.total || sortedOrders.length;
          const totalPages = data.data.pagination?.last_page || Math.ceil(totalOrders / pageSize);
          
          // Update state with fresh data
          setOrders(sortedOrders);
          setTotalOrders(totalOrders);
          setTotalPages(totalPages);
          filterOrdersByPageType(sortedOrders, currentPageType);
          
          // Cache the fresh data for future use
          const cacheData = {
            orders: sortedOrders,
            totalOrders,
            totalPages,
            timestamp: Date.now()
          };
          setCache(cacheKey, cacheData, 2 * 60 * 1000); // Cache for only 2 minutes
          
          console.log('✅ Fresh orders data loaded and cached');
        } else {
          throw new Error(data?.error?.message || data?.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error Loading Orders",
          description: "Failed to fetch orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPageType, currentPage, pageSize]);

  useEffect(() => {
  }, []);

  // Filter orders based on current page type
  const filterOrdersByPageType = (ordersData: any[], pageType: string) => {
    // Apply page type filtering first, then apply current tab filtering
    filterOrdersByTab(ordersData, activeTab);
  };

  // Filter orders based on active tab
  const filterOrdersByTab = (ordersData: any[], tab: string) => {
    let filtered = ordersData;
    
    // No page type filtering - show all orders
    
    // Then apply tab filtering
    if (tab === 'pending') {
      filtered = filtered.filter((order: any) => 
        (order.status || '').toLowerCase() === 'pending' || !order.status || order.status === ''
      );
    }
    // For 'all' tab, keep the page type filtering
    
    setFilteredOrders(filtered);
    // Don't reset pagination here as it interferes with user navigation
  };

  // Update filtered orders when tab changes or page type changes
  useEffect(() => {
    filterOrdersByTab(orders, activeTab);
    // Don't reset pagination here as it interferes with user navigation
  }, [activeTab, orders, currentPageType]);

  // Clean up unselectable orders when orders change
  useEffect(() => {
    if (selectedOrders.length > 0) {
      cleanupUnselectableOrders();
    }
  }, [orders, filteredOrders]);

  const dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thismonth', label: 'This Month' },
    { value: 'lastmonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const getStatusBadge = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    
    // Capitalize first letter of status
    const capitalizeFirstLetter = (str: string) => {
      if (!str) return 'Pending';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    
    const displayStatus = capitalizeFirstLetter(status || 'Pending');
    const variants = {
      'booked': 'default',
      'shipped': 'secondary',
      'delivered': 'default',
      'cancelled': 'destructive',
      'pending': 'outline'
    };
    
    // Custom styling for better color distinction
    if (statusLower === 'booked') {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white border-green-500">{displayStatus}</Badge>;
    } else if (statusLower === 'pending' || !status || status === '') {
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500">{displayStatus}</Badge>;
    }
    
    return <Badge variant={variants[statusLower] || 'outline'}>{displayStatus}</Badge>;
  };

  const handleExport = async () => {
    try {
      if (filteredOrders.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no orders to export.",
          variant: "destructive",
        });
        return;
      }

      setExportLoading(true);

      // Show loading state
      toast({
        title: "Exporting Orders",
        description: "Please wait while we prepare your export...",
      });

      // Prepare export filters based on current page type and filters
      const exportFilters: {
        date_range?: string;
        order_id?: string;
        order_type?: string[];
      } = {};

      // No order type filtering - export all orders

      // Add search term if available
      if (searchTerm) {
        exportFilters.order_id = searchTerm;
      }

      // Add date range if custom dates are selected
      if (dateFilter === 'custom' && dateFrom && dateTo) {
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0];
        };
        exportFilters.date_range = `${formatDate(dateFrom)} ~ ${formatDate(dateTo)}`;
      } else if (dateFilter !== 'all') {
        // Handle predefined date ranges
        const today = new Date();
        let startDate: Date;
        let endDate: Date;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(today);
            endDate = new Date(today);
            break;
          case 'yesterday':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 1);
            endDate = new Date(startDate);
            break;
          case 'last7days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = new Date(today);
            break;
          case 'last30days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);
            endDate = new Date(today);
            break;
          case 'thismonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today);
            break;
          case 'lastmonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
          default:
            startDate = new Date();
            endDate = new Date();
        }
        
        if (startDate && endDate) {
          const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0];
          };
          exportFilters.date_range = `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
        }
      }

      // Call the API to export orders
      const downloadUrl = await orderService.exportOrders(exportFilters);
      
      // Trigger download from the provided URL
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `orders-${currentPageType}-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.target = '_blank'; // Open in new tab to avoid navigation issues
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Orders exported successfully!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleShip = (order: any) => {
    setSelectedOrder(order);
    setShowShipModal(true);
  };

  const handleBulkShip = () => {
    const currentPageSelectedIds = getCurrentPageSelectedIds();
    
    if (currentPageSelectedIds.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders on the current page to ship.",
        variant: "destructive"
      });
      return;
    }

    // Additional check to ensure all selected orders can be shipped
    if (!canBulkShipSelectedOrders()) {
      toast({
        title: "Cannot Ship Selected Orders",
        description: "Some selected orders have 'booked' or 'cancelled' fees and cannot be shipped.",
        variant: "destructive"
      });
      return;
    }

    // Show the bulk ship modal for courier selection
    setShowBulkShipModal(true);
  };

  const handleBulkShipConfirm = async () => {
    const currentPageSelectedIds = getCurrentPageSelectedIds();
    
    try {
      // Close the modal
      setShowBulkShipModal(false);
      
      // Navigate to CourierChoiceHub with selected orders
      navigate('/dashboard/shipments/courier-choice-hub', {
        state: {
          selectedOrders: currentPageSelectedIds,
          warehouseId: '60', // Default warehouse ID
          rtoId: '60' // Default RTO ID
        }
      });
      
      // Clear the current page selections
      setSelectedOrders(prev => prev.filter(id => !currentPageSelectedIds.includes(id)));
      
    } catch (error) {
      console.error('Error in bulk ship confirmation:', error);
      toast({
        title: "Error",
        description: "Failed to proceed with bulk shipping. Please try again.",
        variant: "destructive"
      });
    }
  };



  const confirmShipment = () => {
    // Close courier modal and open courier selection
    setShowShipModal(false);
    setShowCourierSelection(true);
    setSelectedOrderForShipping(selectedOrder);
  };



  const handleCancelOrder = (order: any) => {
    setSelectedOrder(order);
    setShowCancelConfirm(true);
  };

  const handleViewOrder = (order: any) => {
    navigate(`/dashboard/orders/${order.id}`);
  };



  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setCancellingOrderId(selectedOrder.id);
      const result = await orderService.cancelOrder(selectedOrder.id);
      
      if (result.success) {
        toast({
          title: "Order Cancelled",
          description: result.message || `Order ${selectedOrder?.order_no} has been cancelled successfully.`,
        });
        
        // Update the order status in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrder.id 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
        
        setFilteredOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrder.id 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
        
        setShowCancelConfirm(false);
        setSelectedOrder(null);
      } else {
        toast({
          title: "Failed to Cancel Order",
          description: result.message || "An error occurred while cancelling the order.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while cancelling the order.",
        variant: "destructive"
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleBulkCancel = () => {
    const currentPageSelectedIds = getCurrentPageSelectedIds();
    
    if (currentPageSelectedIds.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders on the current page to cancel.",
        variant: "destructive"
      });
      return;
    }
    setShowBulkCancelConfirm(true);
    }

  const confirmBulkCancel = async () => {
    const currentPageSelectedIds = getCurrentPageSelectedIds();
    
    if (currentPageSelectedIds.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders on the current page to cancel.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setFilterLoading(true);
      let successCount = 0;
      let failedCount = 0;
      
      console.log('Bulk cancelling orders:', {
        totalSelected: selectedOrders.length,
        currentPageSelected: currentPageSelectedIds.length,
        currentPageSelectedIds
      });
      
      // Cancel only the orders selected on the current page
      for (const orderId of currentPageSelectedIds) {
        try {
          const result = await orderService.cancelOrder(orderId);
          if (result.success) {
            successCount++;
            // Update the order status in the local state
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === orderId 
                  ? { ...order, status: 'cancelled' }
                  : order
              )
            );
            
            setFilteredOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === orderId 
                  ? { ...order, status: 'cancelled' }
                  : order
              )
            );
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Error cancelling order ${orderId}:`, error);
          failedCount++;
        }
      }
      
      // Show results
      if (successCount > 0) {
        toast({
          title: "Bulk Cancel Complete",
          description: `Successfully cancelled ${successCount} order${successCount !== 1 ? 's' : ''} from current page${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
          variant: failedCount > 0 ? "default" : "default"
        });
      } else {
        toast({
          title: "Bulk Cancel Failed",
          description: `Failed to cancel any orders. Please try again.`,
          variant: "destructive"
        });
      }
      
      setShowBulkCancelConfirm(false);
      // Only clear selections for the current page, keep other page selections
      setSelectedOrders(prev => prev.filter(id => !currentPageSelectedIds.includes(id)));
    } catch (error) {
      console.error('Error in bulk cancel:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during bulk cancellation.",
        variant: "destructive"
      });
    } finally {
      setFilterLoading(false);
    }
  };

  const handleSelectOrder = (orderId: string, isChecked: boolean) => {
    // Find the order to check if it can be selected
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (isChecked) {
      // Only allow selection if order can be selected for bulk operations
      if (canSelectOrderForBulkOps(order)) {
        setSelectedOrders(prev => [...prev, orderId]);
      } else {
        toast({
          title: "Cannot Select Order",
          description: `Order with status '${order.status}' cannot be selected for bulk operations.`,
          variant: "destructive"
        });
      }
    } else {
      // Always allow deselection
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    console.log('handleSelectAll called with:', isChecked);
    console.log('Current selectedOrders:', selectedOrders);
    console.log('Current page orders:', getPaginatedOrders());
    
    const currentOrders = getPaginatedOrders();
    const selectableOrders = currentOrders.filter(order => canSelectOrderForBulkOps(order));
    const allSelectableSelected = selectableOrders.every(order => selectedOrders.includes(order.id));
    
    if (allSelectableSelected) {
      // If all selectable orders on current page are selected, deselect them all
      console.log('Deselecting all selectable orders on current page');
      setSelectedOrders(prev => prev.filter(id => !selectableOrders.some(order => order.id === id)));
    } else {
      // Select all selectable orders on current page
      const selectableOrderIds = selectableOrders.map(order => order.id);
      console.log('Selecting all selectable orders:', selectableOrderIds);
      setSelectedOrders(prev => {
        const combined = [...new Set([...prev, ...selectableOrderIds])];
        console.log('Combined selected orders:', combined);
        return combined;
      });
    }
  };

  const applyFilters = () => {
    // Build filter payload for API
    const filterPayload: any = {};
    
    // Add order numbers if search term is provided
    if (searchTerm) {
      filterPayload.order_no = searchTerm;
    }
    
    // Add order types if any are selected
    if (!orderTypes.all) {
      const selectedTypes = [];
      if (orderTypes.prepaid) selectedTypes.push('prepaid');
      if (orderTypes.cod) selectedTypes.push('cod');
      if (orderTypes.reverse) selectedTypes.push('reverse');
      if (selectedTypes.length > 0) {
        filterPayload.order_types = selectedTypes;
      }
    }
    
    // Add date range if custom dates are selected
    if (dateFilter === 'custom' && dateFrom && dateTo) {
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };
      filterPayload.date_range = `${formatDate(dateFrom)} ~ ${formatDate(dateTo)}`;
    } else if (dateFilter !== 'all') {
      // Handle predefined date ranges
      const today = new Date();
      let startDate: Date;
      let endDate: Date;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(today);
          endDate = new Date(today);
          break;
        case 'yesterday':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 1);
          endDate = new Date(startDate);
          break;
        case 'last7days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          endDate = new Date(today);
          break;
        case 'last30days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          endDate = new Date(today);
          break;
        case 'thismonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today);
          break;
        case 'lastmonth':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        default:
          startDate = new Date();
          endDate = new Date();
      }
      
      if (startDate && endDate) {
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0];
        };
        filterPayload.date_range = `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
      }
    }
    
    // Call API with filter payload
    fetchFilteredOrders(filterPayload);
    resetPagination(); // Reset pagination when filters are applied
    setShowFilter(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setOrderTypes({ prepaid: false, cod: false, reverse: false, all: true });
    
    // Reset to original orders by refetching
    const fetchOrders = async () => {
      try {
        let authToken = sessionStorage.getItem('auth_token');
        if (!authToken) authToken = localStorage.getItem('auth_token');
        
        // Build URL with pagination parameters
        const url = new URL(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order`);
        url.searchParams.set('per_page', pageSize.toString());
        url.searchParams.set('page', currentPage.toString());
        
        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok && data.status && data.data?.orders_data) {
          const sortedOrders = data.data.orders_data.sort((a: any, b: any) => {
            const dateA = new Date(a.order_date || a.created_at || a.sync_date || 0);
            const dateB = new Date(b.order_date || b.created_at || b.sync_date || 0);
            return dateB.getTime() - dateA.getTime();
          });
          setOrders(sortedOrders);
          
          // Update pagination metadata if available
          if (data.data.pagination) {
            setTotalOrders(data.data.pagination.total || sortedOrders.length);
            setTotalPages(data.data.pagination.last_page || Math.ceil((data.data.pagination.total || sortedOrders.length) / pageSize));
          } else {
            // Fallback if no pagination metadata
            setTotalOrders(sortedOrders.length);
            setTotalPages(1);
          }
          
          filterOrdersByTab(sortedOrders, activeTab);
        }
      } catch (error) {
        console.error('Error resetting filters:', error);
      }
    };
    resetPagination(); // Reset pagination when filters are reset
    // Invalidate cache before refetch
    clearCacheByPrefix(CacheGroups.orders);
    fetchOrders();
  };

  const hasSelectedOrders = selectedOrders.length > 0;
  
  const isAllCurrentPageSelected = () => {
    const currentPageOrders = getPaginatedOrders();
    const selectableOrders = currentPageOrders.filter(order => canSelectOrderForBulkOps(order));
    const result = selectableOrders.length > 0 && selectableOrders.every(order => selectedOrders.includes(order.id));
    console.log('isAllCurrentPageSelected:', {
      currentPageOrders: currentPageOrders.map(o => ({ id: o.id, order_no: o.order_no, status: o.status })),
      selectableOrders: selectableOrders.map(o => ({ id: o.id, order_no: o.order_no, status: o.status })),
      selectedOrders,
      result
    });
    return result;
  };

  const isSomeCurrentPageSelected = () => {
    const currentPageOrders = getPaginatedOrders();
    return currentPageOrders.length > 0 && currentPageOrders.some(order => selectedOrders.includes(order.id)) && !isAllCurrentPageSelected();
  };

  const getCurrentPageSelectedCount = () => {
    const currentPageOrders = getPaginatedOrders();
    return currentPageOrders.filter(order => selectedOrders.includes(order.id)).length;
  };

  const getCurrentPageSelectedIds = () => {
    const currentPageOrders = getPaginatedOrders();
    return currentPageOrders
      .filter(order => selectedOrders.includes(order.id))
      .map(order => order.id);
  };

  // Check if current page has any orders that can be shipped (not booked or cancelled)
  const canShowBulkShipOptions = () => {
    const currentPageOrders = getPaginatedOrders();
    return currentPageOrders.some(order => {
      const status = (order.status || '').toLowerCase();
      return status !== 'booked' && status !== 'cancelled';
    });
  };

  // Check if selected orders on current page can be shipped
  const canBulkShipSelectedOrders = () => {
    const currentPageSelectedIds = getCurrentPageSelectedIds();
    if (currentPageSelectedIds.length === 0) return false;
    
    const currentPageOrders = getPaginatedOrders();
    const selectedOrdersOnPage = currentPageOrders.filter(order => 
      currentPageSelectedIds.includes(order.id)
    );
    
    return selectedOrdersOnPage.every(order => {
      const status = (order.status || '').toLowerCase();
      return status !== 'booked' && status !== 'cancelled';
    });
  };

  // Check if order can be cancelled
  const canCancelOrder = (order: any) => {
    const status = (order.status || '').toLowerCase();
    return status !== 'booked' && status !== 'cancelled';
  };

  const canShipOrder = (order: any) => {
    const status = (order.status || '').toLowerCase();
    return !status || status === '' || status === 'pending';
  };

  const getOrderTypeBadge = (orderType: string) => {
    const type = (orderType || '').toLowerCase();
    if (type === 'prepaid') {
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500">Prepaid</Badge>;
    } else if (type === 'cod') {
      return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500">COD</Badge>;
    } else if (type === 'reverse') {
      return <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-purple-500">Reverse</Badge>;
    }
    return <Badge variant="secondary">{orderType}</Badge>;
  };

  const isOrderCancelled = (order: any) => {
    const status = (order.status || '').toLowerCase();
    return status === 'cancelled';
  };

  // Check if order can be selected for bulk operations
  const canSelectOrderForBulkOps = (order: any) => {
    const status = (order.status || '').toLowerCase();
    // Only allow selection of orders that can be shipped or cancelled
    // Booked orders cannot be selected as they are already processed
    return status !== 'cancelled' && status !== 'delivered' && status !== 'booked';
  };

  // Clean up selected orders when they become unselectable
  const cleanupUnselectableOrders = () => {
    const currentPageOrders = getPaginatedOrders();
    const unselectableOrders = currentPageOrders.filter(order => 
      selectedOrders.includes(order.id) && !canSelectOrderForBulkOps(order)
    );
    
    if (unselectableOrders.length > 0) {
      console.log('Cleaning up unselectable orders:', unselectableOrders.map(o => ({ id: o.id, order_no: o.order_no, status: o.status })));
      setSelectedOrders(prev => prev.filter(id => !unselectableOrders.some(order => order.id === id)));
      
      toast({
        title: "Selection Updated",
        description: `${unselectableOrders.length} order${unselectableOrders.length !== 1 ? 's' : ''} with 'cancelled', 'delivered', or 'booked' status were automatically deselected.`,
        variant: "default"
      });
    }
  };

  // Import order handlers
  const handleFileSelect = (file: File) => {
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // More flexible file type validation
    const isValidFile = (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
      file.type === 'application/vnd.ms-excel' || // .xls
      file.type === 'text/csv' || // .csv
      file.type === 'application/csv' || // alternative CSV MIME type
      file.name.toLowerCase().endsWith('.xlsx') ||
      file.name.toLowerCase().endsWith('.xls') ||
      file.name.toLowerCase().endsWith('.csv')
    );

    if (file && isValidFile) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setImportFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} is ready for import.`,
      });
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select an Excel (.xlsx, .xls) or CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    setImportLoading(true);
    
    // Enhanced Debug Logging
    console.log('🚀 Starting Import Process...');
    console.log('📁 File Details:', {
      name: importFile.name,
      type: importFile.type,
      size: importFile.size,
      lastModified: new Date(importFile.lastModified).toISOString()
    });
    
    // Use API config for the endpoint
    const importUrl = getApiUrl(API_CONFIG.ENDPOINTS.ORDER_IMPORT);
    
    try {
      // Check both auth_token and access_token
      let authToken = sessionStorage.getItem('auth_token');
      let accessToken = sessionStorage.getItem('access_token');
      
      if (!authToken) authToken = localStorage.getItem('auth_token');
      if (!accessToken) accessToken = localStorage.getItem('access_token');

      console.log('🔐 Token Check:', {
        authToken: {
          hasSession: !!sessionStorage.getItem('auth_token'),
          hasLocal: !!localStorage.getItem('auth_token'),
          length: authToken ? authToken.length : 0,
          preview: authToken ? authToken.substring(0, 20) + '...' : 'None'
        },
        accessToken: {
          hasSession: !!sessionStorage.getItem('access_token'),
          hasLocal: !!localStorage.getItem('access_token'),
          length: accessToken ? accessToken.length : 0,
          preview: accessToken ? accessToken.substring(0, 20) + '...' : 'None'
        }
      });

      // Use access_token if available, otherwise fall back to auth_token
      const tokenToUse = accessToken || authToken;
      const tokenType = accessToken ? 'access_token' : 'auth_token';

      console.log('🎯 Using Token:', {
        type: tokenType,
        token: tokenToUse ? tokenToUse.substring(0, 20) + '...' : 'None',
        length: tokenToUse ? tokenToUse.length : 0
      });

      if (!tokenToUse) {
        console.error('❌ No authentication token found (neither auth_token nor access_token)');
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }
      
      const formData = new FormData();
      formData.append('spreadsheet', importFile);
      
      console.log('🌐 Import API Configuration:', {
        endpoint: API_CONFIG.ENDPOINTS.ORDER_IMPORT,
        baseUrl: API_CONFIG.BASE_URL,
        fullUrl: importUrl,
        environment: import.meta.env.MODE,
        viteApiUrl: import.meta.env.VITE_API_URL
      });

      console.log('📤 FormData Details:', {
        hasFile: formData.has('spreadsheet'),
        fileInFormData: formData.get('spreadsheet'),
        formDataEntries: Array.from(formData.entries())
      });

      console.log('🚀 Making API Request...');
      const requestStartTime = Date.now();

      const response = await fetch(importUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      const requestDuration = Date.now() - requestStartTime;
      console.log('⏱️ Request Duration:', requestDuration + 'ms');

      const data = await response.json();
      
      console.log('📥 Import API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        requestDuration: requestDuration + 'ms',
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });

      if (response.ok && data.status) {
        toast({
          title: "Import Successful",
          description: data.message || "Orders imported successfully!",
        });
        setShowImportModal(false);
        setImportFile(null);
        
        // Wait a moment for backend processing, then refresh orders data
        setTimeout(async () => {
          setRefreshLoading(true);
          try {
            console.log('Starting to refresh orders after import...');
            
            // Clear all order cache to ensure fresh data
            clearCacheByPrefix(CacheGroups.orders);
            
            let authToken = sessionStorage.getItem('auth_token');
            if (!authToken) authToken = localStorage.getItem('auth_token');
            
            const url = new URL(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order`);
            url.searchParams.set('per_page', pageSize.toString());
            url.searchParams.set('page', '1'); // Always refresh to page 1 after import
            
            console.log('🔄 Post-import refresh - fetching fresh orders');
            
            const refreshResponse = await fetch(url.toString(), {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json',
              },
            });
            
            console.log('Refresh response status:', refreshResponse.status);
            const refreshData = await refreshResponse.json();
            console.log('Refresh response data:', refreshData);
            
            if (refreshResponse.ok && refreshData.status && refreshData.data?.orders_data) {
              // Sort orders by latest first
              const sortedOrders = refreshData.data.orders_data.sort((a: any, b: any) => {
                const dateA = new Date(a.order_date || a.created_at || a.sync_date || 0);
                const dateB = new Date(b.order_date || b.created_at || b.sync_date || 0);
                return dateB.getTime() - dateA.getTime();
              });
              
              console.log('Previous orders count:', orders.length);
              console.log('New orders count:', sortedOrders.length);
              console.log('New orders:', sortedOrders.slice(0, 3)); // Log first 3 orders
              
              const totalOrders = refreshData.data.pagination?.total || sortedOrders.length;
              const totalPages = refreshData.data.pagination?.last_page || Math.ceil(totalOrders / pageSize);
              
              // Update state with fresh data
              setOrders(sortedOrders);
              setTotalOrders(totalOrders);
              setTotalPages(totalPages);
              
              // Cache the fresh data
              const cacheKey = EnhancedCacheKeys.orders(1, pageSize, currentPageType);
              const cacheData = {
                orders: sortedOrders,
                totalOrders,
                totalPages,
                timestamp: Date.now()
              };
              setCache(cacheKey, cacheData, 2 * 60 * 1000); // Cache for only 2 minutes
              
              // Reapply current filters
              filterOrdersByPageType(sortedOrders, currentPageType);
              resetPagination();
              
              toast({
                title: "Orders Refreshed",
                description: `Orders list updated: ${orders.length} → ${sortedOrders.length} orders`,
              });
              
              console.log('✅ Post-import refresh completed with fresh data');
            } else {
              console.error('Refresh failed:', refreshData);
              toast({
                title: "Refresh Failed",
                description: refreshData?.message || "Failed to refresh orders list.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error('Error refreshing orders:', error);
            toast({
              title: "Refresh Warning",
              description: "Orders imported but failed to refresh the list. Please refresh the page manually.",
              variant: "destructive",
            });
          } finally {
            setRefreshLoading(false);
          }
        }, 2000); // Wait 2 seconds for backend processing
      } else {
        let errorMessage = "Failed to import orders.";
        
        if (response.status === 500) {
          errorMessage = "Server error: The server encountered an internal error. Please contact support.";
        } else if (response.status === 413) {
          errorMessage = "File too large: Please select a smaller file.";
        } else if (response.status === 415) {
          errorMessage = "Unsupported file type: Please use Excel (.xlsx, .xls) or CSV files.";
        } else if (response.status === 400) {
          errorMessage = data?.error?.message || data.message || "Invalid file format or data. Please check your file and try again.";
        } else if (response.status === 401) {
          // Authentication error - handled globally by apiRequest
          errorMessage = "Session expired. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "Access denied. You don't have permission to import orders.";
        } else if (data?.error?.message) {
          errorMessage = data.error.message;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        }
        
        console.error('Import failed:', {
          status: response.status,
          data: data,
          errorMessage: errorMessage,
          url: importUrl
        });
        
        toast({
          title: "Import Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Import Network Error:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        url: importUrl,
        file: importFile ? {
          name: importFile.name,
          type: importFile.type,
          size: importFile.size
        } : 'No file',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
      console.log('🏁 Import process completed');
    }
  };

  const handleDownloadSample = () => {
    // Download the sample CSV file from the provided URL
    const sampleUrl = 'https://app.parcelace.io/public/excelFormat/sample_import_order.csv';
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = sampleUrl;
    a.download = 'sample_import_order.csv';
    a.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Courier selection handlers
  const handleCourierSelect = (courier: any, rate: any) => {
    if (courier === null && rate === null) {
      // Booking was successful, close modal and refresh orders
      setShowCourierSelection(false);
      setSelectedOrderForShipping(null);
      
      // Clear cache and refresh orders instead of reloading the page
      clearCacheByPrefix(CacheGroups.orders);
      
      // Trigger a fresh fetch by updating the page
      setCurrentPage(1);
      
      toast({
        title: "Order Booked Successfully",
        description: "Order has been booked and orders list will refresh shortly.",
      });
    }
  };

  const getOrderSummaryForCourier = (order: any) => {
    // Debug logging to see what's in the order object
    console.log('=== DEBUG: getOrderSummaryForCourier ===');
    console.log('Order object:', order);
    console.log('Order ID:', order.order_id);
    console.log('Order ID type:', typeof order.order_id);
    console.log('Parsed order ID:', parseInt(order.order_id));
    
    // Use default warehouse details
    const pickupLocation = order.warehouse_details 
      ? `${order.warehouse_details.city || 'Unknown'}, ${order.warehouse_details.state || 'Unknown'} - ${order.warehouse_details.pincode || 'Unknown'}`
      : "Default warehouse location";

    const result = {
      orderId: parseInt(order.order_id) || 1,
      warehouseId: 60, // Default warehouse ID
      rtoId: 60, // Default RTO ID
      parcelType: order.parcel_type || 'parcel',
      pickupLocation: pickupLocation,
      deliveryLocation: `${order.customer_details?.city || 'Unknown'}, ${order.customer_details?.zipcode || 'Unknown'}`,
      orderType: order.order_type || 'prepaid',
      weight: parseFloat(order.weight) || 0,
      volumetricWeight: parseFloat(order.volumetric_weight) || 0,
      dimensions: {
        length: parseFloat(order.length) || 0,
        width: parseFloat(order.width) || 0,
        height: parseFloat(order.height) || 0
      }
    };
    
    console.log('Generated order summary:', result);
    console.log('=== END DEBUG ===');
    
    return result;
  };

  // Pagination functions
  const getPaginatedOrders = () => {
    // Since we're using server-side pagination, return all filtered orders
    // The API already returns the correct page of data
    return filteredOrders;
  };

  const getTotalPages = () => {
    return totalPages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // The useEffect will automatically trigger API call with new page
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    // The useEffect will automatically trigger API call with new page size
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // API-based filter function
  const fetchFilteredOrders = async (filterPayload: any) => {
    setFilterLoading(true);
    try {
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');
      
      // Add pagination parameters to filter payload
      const payloadWithPagination = {
        ...filterPayload,
        per_page: pageSize,
        page: currentPage
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order/filter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payloadWithPagination),
      });

      const data = await response.json();
      
      if (response.ok && data.status && data.data?.orders_data) {
        // Sort orders by latest first
        const sortedOrders = data.data.orders_data.sort((a: any, b: any) => {
          const dateA = new Date(a.order_date || a.created_at || a.sync_date || 0);
          const dateB = new Date(b.order_date || b.created_at || b.sync_date || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setOrders(sortedOrders);
        
        // Update pagination metadata if available
        if (data.data.pagination) {
          setTotalOrders(data.data.pagination.total || sortedOrders.length);
          setTotalPages(data.data.pagination.last_page || Math.ceil((data.data.pagination.total || sortedOrders.length) / pageSize));
        } else {
          // Fallback if no pagination metadata
          setTotalOrders(sortedOrders.length);
          setTotalPages(1);
        }
        
        filterOrdersByTab(sortedOrders, activeTab);
        
        toast({
          title: 'Filter Applied',
          description: `Found ${data.data.pagination?.total || sortedOrders.length} orders matching your criteria.`,
        });
      } else {
        toast({
          title: 'Filter Error',
          description: data?.error?.message || data?.message || 'Failed to fetch filtered orders.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Filter API error:', error);
      toast({
        title: 'Network Error',
        description: 'Failed to apply filters. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setFilterLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
              Orders Management
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => navigate('/dashboard/orders/add')}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Order
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                setRefreshLoading(true);
                try {
                  // Clear all order cache to ensure fresh data
                  clearCacheByPrefix(CacheGroups.orders);
                  
                  // Fetch fresh data directly
                  let authToken = sessionStorage.getItem('auth_token');
                  if (!authToken) authToken = localStorage.getItem('auth_token');
                  
                  const url = new URL(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order`);
                  url.searchParams.set('per_page', pageSize.toString());
                  url.searchParams.set('page', currentPage.toString());
                  
                  console.log('🔄 Manual refresh - fetching fresh orders');
                  
                  const response = await fetch(url.toString(), {
                    headers: {
                      'Authorization': `Bearer ${authToken}`,
                      'Accept': 'application/json',
                    },
                  });
                  const data = await response.json();
                  
                  if (response.ok && data.status && data.data?.orders_data) {
                    const sortedOrders = data.data.orders_data.sort((a: any, b: any) => {
                      const dateA = new Date(a.order_date || a.created_at || a.sync_date || 0);
                      const dateB = new Date(b.order_date || b.created_at || b.sync_date || 0);
                      return dateB.getTime() - dateA.getTime();
                    });
                    
                    const totalOrders = data.data.pagination?.total || sortedOrders.length;
                    const totalPages = data.data.pagination?.last_page || Math.ceil(totalOrders / pageSize);
                    
                    // Update state with fresh data
                    setOrders(sortedOrders);
                    setTotalOrders(totalOrders);
                    setTotalPages(totalPages);
                    filterOrdersByPageType(sortedOrders, currentPageType);
                    
                    // Cache the fresh data
                    const cacheKey = EnhancedCacheKeys.orders(currentPage, pageSize, currentPageType);
                    const cacheData = {
                      orders: sortedOrders,
                      totalOrders,
                      totalPages,
                      timestamp: Date.now()
                    };
                    setCache(cacheKey, cacheData, 2 * 60 * 1000); // Cache for only 2 minutes
                    
                    toast({
                      title: "Orders Refreshed",
                      description: `Orders list updated successfully with fresh data`,
                    });
                    
                    console.log('✅ Manual refresh completed with fresh data');
                  } else {
                    throw new Error(data?.error?.message || data?.message || 'Failed to fetch orders');
                  }
                } catch (error) {
                  console.error('Error refreshing orders:', error);
                  toast({
                    title: "Refresh Failed",
                    description: "Failed to refresh orders list.",
                    variant: "destructive",
                  });
                } finally {
                  setRefreshLoading(false);
                }
              }}
              disabled={refreshLoading}
            >
              {refreshLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Now'
              )}
            </Button>
            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Orders
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Orders</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div 
                    className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : importFile 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-border'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {importFile ? (
                      <div className="space-y-2">
                        <Check className="w-12 h-12 mx-auto text-green-600 mb-4" />
                        <p className="text-sm font-medium text-green-800">File Selected</p>
                        <p className="text-xs text-green-600">{importFile.name}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setImportFile(null)}
                          className="mt-2"
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop your Excel file here or click to browse
                        </p>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        />
                        <label 
                          htmlFor="file-upload" 
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                  </div>
                  
                  {importFile && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-blue-800">
                          Supported formats: Excel (.xlsx, .xls) and CSV files
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Debug Panel - Only show in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-yellow-800">🔍 Import Debug Info</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-3 text-xs"
                          onClick={() => {
                            const debugData = {
                              file: importFile ? {
                                name: importFile.name,
                                type: importFile.type,
                                size: importFile.size,
                                lastModified: new Date(importFile.lastModified).toISOString()
                              } : null,
                              apiConfig: {
                                endpoint: API_CONFIG.ENDPOINTS.ORDER_IMPORT,
                                baseUrl: API_CONFIG.BASE_URL,
                                fullUrl: getApiUrl(API_CONFIG.ENDPOINTS.ORDER_IMPORT)
                              },
                              auth: {
                                authToken: {
                                  hasSession: !!sessionStorage.getItem('auth_token'),
                                  hasLocal: !!localStorage.getItem('auth_token'),
                                  preview: sessionStorage.getItem('auth_token')?.substring(0, 20) + '...' || 'None'
                                },
                                accessToken: {
                                  hasSession: !!sessionStorage.getItem('access_token'),
                                  hasLocal: !!localStorage.getItem('access_token'),
                                  preview: sessionStorage.getItem('access_token')?.substring(0, 20) + '...' || 'None'
                                }
                              },
                              environment: {
                                mode: import.meta.env.MODE,
                                viteApiUrl: import.meta.env.VITE_API_URL
                              }
                            };
                            navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
                            toast({
                              title: "Copied!",
                              description: "Debug info copied to clipboard",
                              variant: "default",
                            });
                          }}
                        >
                          📋 Copy Debug Info
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="font-medium text-yellow-800 mb-1">File Info:</div>
                          <div className="text-yellow-700">
                            {importFile ? (
                              <>
                                <div>Name: {importFile.name}</div>
                                <div>Type: {importFile.type}</div>
                                <div>Size: {(importFile.size / 1024).toFixed(2)} KB</div>
                                <div>Modified: {new Date(importFile.lastModified).toLocaleString()}</div>
                              </>
                            ) : (
                              <div>No file selected</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-yellow-800 mb-1">API Config:</div>
                          <div className="text-yellow-700">
                            <div>Endpoint: {API_CONFIG.ENDPOINTS.ORDER_IMPORT}</div>
                            <div>Base URL: {API_CONFIG.BASE_URL}</div>
                            <div>Environment: {import.meta.env.MODE}</div>
                            <div>Auth Token: {sessionStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing'}</div>
                            <div>Access Token: {sessionStorage.getItem('access_token') ? '✅ Present' : '❌ Missing'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {refreshLoading && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                        <p className="text-sm text-green-800">
                          Refreshing orders list... Please wait.
                        </p>
                      </div>
                    </div>
                  )}
                  

                  

                  
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleDownloadSample}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Sample
                    </Button>
                    

                    
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowImportModal(false);
                          setImportFile(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleImport}
                        disabled={!importFile || importLoading || refreshLoading}
                        className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                      >
                        {importLoading ? 'Importing...' : refreshLoading ? 'Refreshing...' : 'Import'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bulk Action Buttons - Above Tabs */}
        {hasSelectedOrders && (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              {canShowBulkShipOptions() && canBulkShipSelectedOrders() && (
                <Button 
                  size="sm"
                  onClick={handleBulkShip}
                  className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                >
                  <Ship className="w-4 h-4 mr-2" />
                  Bulk Ship ({getCurrentPageSelectedCount()})
                </Button>
              )}
              <Button 
                size="sm"
                variant="destructive"
                onClick={handleBulkCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Bulk Cancel ({getCurrentPageSelectedCount()})
              </Button>
            </div>
            {hasSelectedOrders && !canShowBulkShipOptions() && (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                ℹ️ Bulk ship options are not available for orders with "booked", "cancelled", or "delivered" status
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-48 grid-cols-2 h-8 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="all" 
              className={`text-xs px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'all' 
                  ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white shadow-md !text-white' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
              style={activeTab === 'all' ? { color: 'white' } : {}}
            >
              All Orders
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className={`text-xs px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'pending' 
                  ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white shadow-md !text-white' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
              style={activeTab === 'pending' ? { color: 'white' } : {}}
            >
              Pending
            </TabsTrigger>
          </TabsList>

        {/* Filter Panel */}
        {showFilter && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input 
                    placeholder="Search orders..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Filter</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {dateFilter === 'custom' && (
                    <div className="flex space-x-4">
                      <div className="w-40">
                      <label className="text-sm font-medium mb-2 block">From Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'From'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <CalendarComponent
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                      <div className="w-40">
                      <label className="text-sm font-medium mb-2 block">To Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'To'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <CalendarComponent
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-3 block">Order Type</label>
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="prepaid" 
                      checked={orderTypes.prepaid}
                      onCheckedChange={(checked) => 
                        setOrderTypes(prev => ({ ...prev, prepaid: !!checked, all: false }))
                      }
                    />
                    <label htmlFor="prepaid" className="text-sm">Prepaid</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cod" 
                      checked={orderTypes.cod}
                      onCheckedChange={(checked) => 
                        setOrderTypes(prev => ({ ...prev, cod: !!checked, all: false }))
                      }
                    />
                    <label htmlFor="cod" className="text-sm">COD</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="reverse" 
                      checked={orderTypes.reverse}
                      onCheckedChange={(checked) => 
                        setOrderTypes(prev => ({ ...prev, reverse: !!checked, all: false }))
                      }
                    />
                    <label htmlFor="reverse" className="text-sm">Reverse</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="all" 
                      checked={orderTypes.all}
                      onCheckedChange={(checked) => 
                        setOrderTypes(prev => ({ ...prev, all: !!checked, prepaid: false, cod: false, reverse: false }))
                      }
                    />
                    <label htmlFor="all" className="text-sm">All</label>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                  <Button 
                    onClick={applyFilters}
                    disabled={filterLoading}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    {filterLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Applying Filters...
                      </>
                    ) : (
                      'Apply Filters'
                    )}
                  </Button>
                <Button variant="outline" onClick={resetFilters} disabled={filterLoading}>Reset</Button>
              </div>
            </CardContent>
          </Card>
        )}



          {/* Tabs Content */}
          <TabsContent value="all" className="space-y-4">
            {/* All Orders Table */}
          <Card>
            {hasSelectedOrders && (
              <CardHeader>
                <CardTitle>
                  Selected Orders ({getCurrentPageSelectedCount()})
                  {!canShowBulkShipOptions() && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      • Bulk operations not available for this page
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={isAllCurrentPageSelected()}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-32">Order ID</TableHead>
                    <TableHead className="w-28">Date</TableHead>
                    <TableHead className="w-48">Customer</TableHead>
                    <TableHead className="w-24">Pincode</TableHead>
                    <TableHead className="w-24">Type</TableHead>
                    <TableHead className="w-20">Weight (gm)</TableHead>
                    <TableHead className="w-28">Invoice</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Loading orders...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : getPaginatedOrders().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-gray-500">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                          <p>No orders found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getPaginatedOrders().map((order) => (
                    <TableRow 
                      key={order.id}
                      className="relative"
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedOrders.includes(order.id)}
                          disabled={!canSelectOrderForBulkOps(order)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedOrders(prev => [...prev, order.id]);
                            } else {
                              setSelectedOrders(prev => prev.filter(id => id !== order.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order.order_no}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell className="max-w-48 truncate" title={`${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim()}>
                        {`${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim()}
                      </TableCell>
                      <TableCell>{order.pincode}</TableCell>
                      <TableCell>
                        {getOrderTypeBadge(order.order_type)}
                      </TableCell>
                      <TableCell>{order.weight}</TableCell>
                      <TableCell>₹{order.invoice_value}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                            className="hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 hover:border-purple-500/30 hover:text-purple-600 transition-all duration-200"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isOrderCancelled(order) && (
                            <>
                              {canShipOrder(order) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleShip(order)}
                                  className="hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10 hover:border-pink-500/30 hover:text-pink-600 transition-all duration-200"
                                  title="Ship Order"
                                >
                                  <Ship className="w-4 h-4" />
                                </Button>
                              )}
                              {canCancelOrder(order) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleCancelOrder(order)}
                                  className="hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10 hover:border-pink-500/30 hover:text-pink-600 transition-all duration-200"
                                  title="Cancel Order"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {/* Pending Orders Table */}
            <Card>
              {hasSelectedOrders && (
                <CardHeader>
                  <CardTitle>
                    Selected Orders ({getCurrentPageSelectedCount()})
                    {!canShowBulkShipOptions() && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        • Bulk operations not available for this page
                    </span>
                    )}
                  </CardTitle>
                </CardHeader>
              )}
                          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={isAllCurrentPageSelected()}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-32">Order ID</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead className="w-48">Customer</TableHead>
                  <TableHead className="w-24">Pincode</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                                      <TableHead className="w-20">Weight (gm)</TableHead>
                  <TableHead className="w-28">Invoice</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading orders...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : getPaginatedOrders().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-gray-500">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p>No orders found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  getPaginatedOrders().map((order) => (
                  <TableRow 
                    key={order.id}
                    className="relative"
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedOrders.includes(order.id)}
                        disabled={!canSelectOrderForBulkOps(order)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrders(prev => [...prev, order.id]);
                          } else {
                            setSelectedOrders(prev => prev.filter(id => id !== order.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.order_no}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell className="max-w-48 truncate" title={`${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim()}>
                      {`${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim()}
                    </TableCell>
                    <TableCell>{order.pincode}</TableCell>
                    <TableCell>
                        {getOrderTypeBadge(order.order_type)}
                    </TableCell>
                    <TableCell>{order.weight}</TableCell>
                    <TableCell>₹{order.invoice_value}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                            className="hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 hover:border-purple-500/30 hover:text-purple-600 transition-all duration-200"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isOrderCancelled(order) && (
                            <>
                              {canShipOrder(order) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShip(order)}
                                  className="hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10 hover:border-pink-500/30 hover:text-pink-600 transition-all duration-200"
                                  title="Ship Order"
                        >
                          <Ship className="w-4 h-4" />
                        </Button>
                              )}
                        {canCancelOrder(order) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelOrder(order)}
                                  className="hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10 hover:border-pink-500/30 hover:text-pink-600 transition-all duration-200"
                                  title="Cancel Order"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                              )}
                            </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
          </TabsContent>




        </Tabs>

        {/* Pagination Controls */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} entries
              </div>
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {/* Page numbers */}
                {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current page
                  if (
                    page === 1 ||
                    page === getTotalPages() ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === getTotalPages() ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

          {/* Ship Modal */}
          <Dialog open={showShipModal} onOpenChange={setShowShipModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ship Order {selectedOrder?.order_no}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Ready to ship this order? You'll be taken to the courier selection page.</p>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowShipModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmShipment}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    <Ship className="w-4 h-4 mr-2" />
                    Proceed to Ship
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Ship Modal */}
          <Dialog open={showBulkShipModal} onOpenChange={setShowBulkShipModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Get Courier Rates for {getCurrentPageSelectedCount()} Orders</DialogTitle>
                <DialogDescription>
                  Ready to get courier rates for your selected orders?
                </DialogDescription>
                {!canBulkShipSelectedOrders() && (
                  <div className="text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                    ⚠️ Some selected orders cannot be shipped (booked or cancelled status)
                  </div>
                )}
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                  💡 <strong>What happens next?</strong> You'll be taken to the Courier Choice Hub where you can:
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>Get real-time courier rates for your selected orders</li>
                    <li>Compare different courier partners and pricing</li>
                    <li>Apply bulk courier selection to all orders at once</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-3 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBulkShipModal(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={handleBulkShipConfirm}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    <Ship className="w-4 h-4 mr-2" />
                    Get Courier Rates
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Cancel Confirmation Dialog */}
          <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span>Cancel Order</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to cancel order <strong>{selectedOrder?.order_no}</strong>?</p>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                    Keep Order
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmCancelOrder}
                    disabled={filterLoading}
                  >
                    {filterLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel Order'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Cancel Confirmation Dialog */}
          <Dialog open={showBulkCancelConfirm} onOpenChange={setShowBulkCancelConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span>Cancel Orders</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to cancel <strong>{getCurrentPageSelectedCount()}</strong> selected orders?</p>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowBulkCancelConfirm(false)}>
                    Keep Orders
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmBulkCancel}
                    disabled={filterLoading}
                  >
                    {filterLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel Orders'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Courier Partner Selection Modal */}
          <Dialog open={showCourierSelection} onOpenChange={setShowCourierSelection}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select Courier Partner for Order {selectedOrderForShipping?.order_no}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="text-center text-gray-500 py-8">
                  Courier selection functionality has been removed.
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
    </>
  );
};

export default OrdersPage;
