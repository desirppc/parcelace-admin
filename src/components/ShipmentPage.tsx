import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Filter, 
  Download, 
  Search,
  Ship,
  Edit,
  X,
  Calendar,
  Check,
  AlertTriangle,
  Eye,
  Truck,
  Package,
  MapPin,
  CreditCard,
  Clock,
  RefreshCw,
  Copy,
  RotateCcw,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Loader2,
  Car,
  Home,
  Building,
  User,
  FileText,
  MoreHorizontal,
  Trash2
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { format, addDays, parseISO } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { DateRange } from 'react-day-picker';
import { shipmentService } from '@/services/shipmentService';
import { CacheKeys, CacheGroups, getCache, setCache, clearCacheByPrefix } from '@/utils/cache';

interface ShipmentItem {
  id: number;
  store_order_id: number;
  warehouse_id: number;
  awb: string;
  user_id: number;
  customer_name: string;
  customer_number: string;
  customer_address: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  payment_mode: string;
  cod_amount: number;
  total_amount: number;
  shipment_length: number;
  shipment_width: number;
  shipment_height: number;
  weight: number;
  shipping_mode: string;
  shipment_status: string;
  address_type: string;
  order_date: string;
  courier_partner_id: number;
  store_order: {
    id: number;
    order_id: string;
    order_no: string;
    total: string;
    total_tax: string;
    total_discount: string;
    cod_charges: string;
    collectable_amount: string;
    height: string;
    width: string;
    length: string;
    weight: string;
    parcel_type: string;
    shipment_mod: string;
    sync_date: string;
    store_order_items: Array<{
      id: number;
      store_order_id: number;
      name: string;
      quantity: number;
      price: string;
      total_price: string;
      sku: string | null;
      tax_rate: string | null;
      hsn_code: string | null;
      total_tax: string | null;
    }>;
  };
  warehouse: {
    id: number;
    warehouse_name: string;
    warehouse_code: string;
    first_name: string;
    last_name: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
    mobile_number: string;
    whatsapp_number: string;
    alternative_mobile_number: string;
  };
  courier_partner: {
    id: number;
    name: string;
  };
}

const ShipmentPage = () => {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<ShipmentItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedShipments, setSelectedShipments] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [orderTypes, setOrderTypes] = useState({
    prepaid: false,
    cod: false,
    all: true
  });
  const [shipmentStatus, setShipmentStatus] = useState<string[]>([]);
  const [hoveredShipment, setHoveredShipment] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showBulkCancelConfirm, setShowBulkCancelConfirm] = useState(false);
  const [selectedShipmentForCancel, setSelectedShipmentForCancel] = useState<ShipmentItem | null>(null);
  const [cancellingShipment, setCancellingShipment] = useState(false);
  const [cancellingBulk, setCancellingBulk] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalShipments, setTotalShipments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSizeOptions = [10, 20, 50, 100, 200, 500];
  
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current page type based on URL
  const getCurrentPageType = () => {
    const pathname = location.pathname;
    if (pathname.includes('/dashboard/shipments/reverse')) {
      return 'reverse';
    } else if (pathname.includes('/dashboard/shipments/prepaid')) {
      return 'prepaid';
    }
    return 'all';
  };

  const currentPageType = getCurrentPageType();

  // Date filter options (copied from OrdersPage)
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

    const fetchShipments = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // Try cache first
      const cached = getCache<any>(CacheKeys.shipments(currentPage, pageSize, currentPageType));
      if (!isRefresh && cached && Array.isArray(cached.shipments)) {
        setShipments(cached.shipments);
        setFilteredShipments(cached.shipments);
        setTotalShipments(cached.totalShipments || cached.shipments.length);
        setTotalPages(cached.totalPages || 1);
      }
      
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');
      
      // Build request body with pagination parameters
      const requestBody = {
        page: currentPage,
        per_page: pageSize
      };
      
      console.log('Fetching shipments with pagination:', requestBody);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (response.ok && data.status) {
        // Handle different possible response structures
        let shipmentsData = [];
        
        if (Array.isArray(data.data)) {
          shipmentsData = data.data;
        } else if (data.data && Array.isArray(data.data.shipment_data)) {
          shipmentsData = data.data.shipment_data;
        } else if (data.data && Array.isArray(data.data.shipments)) {
          shipmentsData = data.data.shipments;
        } else if (data.data && Array.isArray(data.data.data)) {
          shipmentsData = data.data.data;
        } else if (data.shipments && Array.isArray(data.shipments)) {
          shipmentsData = data.shipments;
        } else if (data.shipment_data && Array.isArray(data.shipment_data)) {
          shipmentsData = data.shipment_data;
        }
        
        console.log('Processed shipments data:', shipmentsData);
        
        // Filter out shipments where AWB is null and sort by latest first
        const shipmentsWithAWB = shipmentsData
          .filter(shipment => shipment.awb !== null && shipment.awb !== '')
          .sort((a, b) => {
            // Sort by order_date descending (latest first)
            const dateA = new Date(a.order_date || a.store_order?.sync_date || 0);
            const dateB = new Date(b.order_date || b.store_order?.sync_date || 0);
            return dateB.getTime() - dateA.getTime();
          });
        console.log('Shipments with AWB (sorted by latest):', shipmentsWithAWB);
        
        setShipments(shipmentsWithAWB);
        // Cache for 5 minutes
        setCache(
          CacheKeys.shipments(currentPage, pageSize, currentPageType),
          { shipments: shipmentsWithAWB, totalShipments: data.data.pagination?.total, totalPages: data.data.pagination?.last_page },
          5 * 60 * 1000
        );
        
        // Update pagination metadata if available
        if (data.data.pagination) {
          setTotalShipments(data.data.pagination.total || shipmentsWithAWB.length);
          setTotalPages(data.data.pagination.last_page || Math.ceil((data.data.pagination.total || shipmentsWithAWB.length) / pageSize));
        } else {
          // Fallback if no pagination metadata
          setTotalShipments(shipmentsWithAWB.length);
          setTotalPages(1);
        }
        
        // Apply page type filtering
        filterShipmentsByPageType(shipmentsWithAWB, currentPageType);
        setLastFetchTime(new Date());
      } else {
        console.log('API Error:', data);
        toast({
          title: 'Error',
          description: data?.error?.message || data?.message || 'Failed to fetch shipments.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.log('Network Error:', error);
      toast({
        title: 'Network Error',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [currentPageType, currentPage, pageSize]);

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    if (!str) return '';
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Helper function to format date with time
  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy, HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  // Helper function to calculate volumetric weight
  const calculateVolumetricWeight = (length: number, width: number, height: number) => {
    const volume = (length * width * height) / 5000; // Standard volumetric weight calculation
    return volume.toFixed(2);
  };

  // Enhanced status badge with icons
  const getStatusBadge = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    const statusConfig = {
      'booked': { variant: 'default', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      'pending': { variant: 'outline', icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      'in_transit': { variant: 'secondary', icon: Truck, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      'out_for_delivery': { variant: 'secondary', icon: Car, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
      'delivered': { variant: 'default', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      'pickup_failed': { variant: 'destructive', icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
      'ndr': { variant: 'destructive', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
      'rto_in_transit': { variant: 'destructive', icon: RotateCcw, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
      'rto_delivered': { variant: 'destructive', icon: Home, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
      'cancelled': { variant: 'destructive', icon: X, color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200 font-bold' }
    };
    const config = statusConfig[statusLower] || { variant: 'default', icon: Package, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} border-0`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {capitalizeWords(status)}
      </Badge>
    );
  };

  // Enhanced payment mode badge
  const getPaymentModeBadge = (mode: string) => {
    const modeLower = (mode || '').toLowerCase();
    const isPrepaid = modeLower === 'prepaid';
    return (
      <Badge variant={isPrepaid ? 'default' : 'secondary'} className={isPrepaid ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'}>
        {capitalizeWords(mode)}
      </Badge>
    );
  };

  const calculateExpectedDelivery = (orderDate: string) => {
    try {
      const date = new Date(orderDate);
      const expectedDate = addDays(date, 4);
      return format(expectedDate, 'dd MMM yyyy');
    } catch {
      return 'N/A';
    }
  };

  const getFirstProductName = (shipment: ShipmentItem) => {
    if (shipment.store_order?.store_order_items?.length > 0) {
      const firstItem = shipment.store_order.store_order_items[0];
      return `${firstItem.name} (${firstItem.quantity})`;
    }
    return 'N/A';
  };

  const handleExport = async () => {
    try {
      if (filteredShipments.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no shipments to export.",
          variant: "destructive",
        });
        return;
      }

      setExportLoading(true);

      // Show loading state
      toast({
        title: "Exporting Shipments",
        description: "Please wait while we prepare your export...",
      });

      // Prepare export filters based on current filters
      const exportFilters: {
        date_range?: string;
        order_type?: string[];
        selected_status?: string[];
      } = {};

      // Add order types based on current filters
      if (!orderTypes.all) {
        const selectedTypes = [];
        if (orderTypes.prepaid) selectedTypes.push('prepaid');
        if (orderTypes.cod) selectedTypes.push('cod');
        if (selectedTypes.length > 0) {
          exportFilters.order_type = selectedTypes;
        }
      }

      // Add shipment status if any are selected
      if (shipmentStatus.length > 0) {
        exportFilters.selected_status = shipmentStatus;
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

      // Call the API to export shipments
      const downloadUrl = await shipmentService.exportShipments(exportFilters);
      
      // Trigger download from the provided URL
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `shipments-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.target = '_blank'; // Open in new tab to avoid navigation issues
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Shipments exported successfully!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export shipments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadShippingLabels = async (awbNumbers: string[]) => {
    try {
      if (awbNumbers.length === 0) {
        toast({
          title: "No AWB Selected",
          description: "Please select at least one shipment to download labels.",
          variant: "destructive",
        });
        return;
      }

      // Show loading state
      toast({
        title: "Downloading Labels",
        description: "Please wait while we prepare your shipping labels...",
      });

      const result = await shipmentService.downloadShippingLabels(awbNumbers);
      
      if (result.success) {
        toast({
          title: "Download Successful",
          description: "Shipping labels downloaded successfully!",
        });
      } else {
        toast({
          title: "Download Failed",
          description: result.error || "Failed to download shipping labels. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = async (awbNumbers: string[]) => {
    try {
      if (awbNumbers.length === 0) {
        toast({
          title: "No AWB Selected",
          description: "Please select at least one shipment to download invoice.",
          variant: "destructive",
        });
        return;
      }

      // Show loading state
      toast({
        title: "Downloading Invoice",
        description: "Please wait while we prepare your invoice...",
      });

      const result = await shipmentService.downloadInvoice(awbNumbers);
      
      if (result.success) {
        toast({
          title: "Download Successful",
          description: "Invoice downloaded successfully!",
        });
      } else {
        toast({
          title: "Download Failed",
          description: result.error || "Failed to download invoice. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download invoice error:', error);
      toast({
        title: "Download Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectShipment = (shipmentId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedShipments(prev => [...prev, shipmentId]);
    } else {
      setSelectedShipments(prev => prev.filter(id => id !== shipmentId));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedShipments(filteredShipments.map(shipment => shipment.id));
    } else {
      setSelectedShipments([]);
    }
  };

  // Filter shipments based on current page type
  const filterShipmentsByPageType = (shipmentsData: ShipmentItem[], pageType: string) => {
    let filtered = shipmentsData;
    
    if (pageType === 'reverse') {
      filtered = shipmentsData.filter((shipment: ShipmentItem) => 
        (shipment.payment_mode || '').toLowerCase() === 'reverse'
      );
    } else if (pageType === 'prepaid') {
      filtered = shipmentsData.filter((shipment: ShipmentItem) => {
        const paymentMode = (shipment.payment_mode || '').toLowerCase();
        return paymentMode === 'prepaid' || paymentMode === 'cod';
      });
    }
    // For 'all' page type, show all shipments
    
    setFilteredShipments(filtered);
    resetPagination(); // Reset pagination when filtering
  };

  // Pagination functions
  const getPaginatedShipments = () => {
    // Since we're using server-side pagination, return all filtered shipments
    // The API already returns the correct page of data
    return filteredShipments;
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

  // Enhanced filter function (copied from OrdersPage)
  const applyFilters = () => {
    let filtered = shipments;

    // First apply page type filtering
    if (currentPageType === 'reverse') {
      filtered = filtered.filter((shipment: ShipmentItem) => 
        (shipment.payment_mode || '').toLowerCase() === 'reverse'
      );
    } else if (currentPageType === 'prepaid') {
      filtered = filtered.filter((shipment: ShipmentItem) => {
        const paymentMode = (shipment.payment_mode || '').toLowerCase();
        return paymentMode === 'prepaid' || paymentMode === 'cod';
      });
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(shipment => 
        shipment.awb?.toLowerCase().includes(searchLower) ||
        shipment.customer_name?.toLowerCase().includes(searchLower) ||
        shipment.store_order?.order_no?.toLowerCase().includes(searchLower)
      );
    }

    // Order type filter
    if (!orderTypes.all) {
      filtered = filtered.filter(shipment => {
        const paymentMode = (shipment.payment_mode || '').toLowerCase();
        if (orderTypes.prepaid && paymentMode === 'prepaid') return true;
        if (orderTypes.cod && paymentMode === 'cod') return true;
        return false;
      });
    }

    // Shipment status filter
    if (shipmentStatus.length > 0) {
      filtered = filtered.filter(shipment => 
        shipmentStatus.includes(shipment.shipment_status?.toLowerCase() || '')
      );
    }

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(shipment => shipment.shipment_status?.toLowerCase() === activeTab.replace(/_/g, ' '));
    }

    setFilteredShipments(filtered);
    setShowFilter(false);
    resetPagination(); // Reset pagination when filters are applied
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setOrderTypes({
      prepaid: false,
      cod: false,
      all: true
    });
    setShipmentStatus([]);
    setActiveTab('all');
    setFilteredShipments(shipments);
    resetPagination(); // Reset pagination when filters are reset
  };

  const handleCancelShipment = (shipment: ShipmentItem) => {
    setSelectedShipmentForCancel(shipment);
    setShowCancelConfirm(true);
  };

  const confirmCancelShipment = async () => {
    if (!selectedShipmentForCancel) return;
    
    try {
      setCancellingShipment(true);
      const result = await shipmentService.cancelShipment(selectedShipmentForCancel.awb);
      
      if (result.success) {
        toast({
          title: "Shipment Cancelled",
          description: result.message || `Shipment ${selectedShipmentForCancel.awb} has been cancelled successfully.`,
        });
        
        // Update the shipment status in local state
        setShipments(prev => prev.map(shipment => 
          shipment.id === selectedShipmentForCancel.id 
            ? { ...shipment, shipment_status: 'cancelled' }
            : shipment
        ));
        
        setFilteredShipments(prev => prev.map(shipment => 
          shipment.id === selectedShipmentForCancel.id 
            ? { ...shipment, shipment_status: 'cancelled' }
            : shipment
        ));
        
        setShowCancelConfirm(false);
        setSelectedShipmentForCancel(null);
      } else {
        toast({
          title: "Failed to Cancel Shipment",
          description: result.message || "An error occurred while cancelling the shipment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error cancelling shipment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while cancelling the shipment.",
        variant: "destructive"
      });
    } finally {
      setCancellingShipment(false);
    }
  };

  const handleBulkCancel = () => {
    if (selectedShipments.length === 0) {
      toast({
        title: "No Shipments Selected",
        description: "Please select at least one shipment to cancel.",
        variant: "destructive"
      });
      return;
    }
    setShowBulkCancelConfirm(true);
  };

  const confirmBulkCancel = async () => {
    if (selectedShipments.length === 0) return;
    
    try {
      setCancellingBulk(true);
      
      // Get AWB numbers for selected shipments
      const selectedAwbs = filteredShipments
        .filter(shipment => selectedShipments.includes(shipment.id))
        .map(shipment => shipment.awb)
        .filter(awb => awb); // Filter out any null/undefined AWBs
      
      if (selectedAwbs.length === 0) {
        toast({
          title: "No Valid AWBs",
          description: "Selected shipments do not have valid AWB numbers.",
          variant: "destructive"
        });
        return;
      }
      
      const result = await shipmentService.cancelBulkShipments(selectedAwbs);
      
      if (result.success) {
        toast({
          title: "Bulk Cancellation Successful",
          description: result.message || `${selectedAwbs.length} shipments have been cancelled successfully.`,
        });
        
        // Update shipment statuses in local state
        const cancelledIds = selectedShipments;
        setShipments(prev => prev.map(shipment => 
          cancelledIds.includes(shipment.id) 
            ? { ...shipment, shipment_status: 'cancelled' }
            : shipment
        ));
        
        setFilteredShipments(prev => prev.map(shipment => 
          cancelledIds.includes(shipment.id) 
            ? { ...shipment, shipment_status: 'cancelled' }
            : shipment
        ));
        
        // Clear selections
        setSelectedShipments([]);
        setShowBulkCancelConfirm(false);
      } else {
        toast({
          title: "Bulk Cancellation Failed",
          description: result.message || "An error occurred while cancelling the shipments.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error cancelling bulk shipments:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while cancelling the shipments.",
        variant: "destructive"
      });
    } finally {
      setCancellingBulk(false);
    }
  };

  const hasSelectedShipments = selectedShipments.length > 0;

  // Debug log
  console.log('Current shipments state:', shipments);
  console.log('Current filtered shipments:', filteredShipments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
            {currentPageType === 'reverse' ? 'Reverse Shipments' : 
             currentPageType === 'prepaid' ? 'Prepaid & COD Shipments' : 
             'Shipments Management'}
          </h1>
          {currentPageType === 'reverse' && (
            <p className="text-muted-foreground mt-1">Showing only reverse shipments</p>
          )}
          {currentPageType === 'prepaid' && (
            <p className="text-muted-foreground mt-1">Showing only prepaid and COD shipments</p>
          )}
          {lastFetchTime && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastFetchTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => {
              clearCacheByPrefix(CacheGroups.shipments);
              fetchShipments(true);
            }}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
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

      {/* Enhanced Filter Panel (copied from OrdersPage) */}
      {showFilter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Shipments</CardTitle>
          </CardHeader>
                      <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input 
                    placeholder="Search shipments..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      resetPagination(); // Reset pagination when search changes
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Filter</label>
                  <Select value={dateFilter} onValueChange={(value) => {
                    setDateFilter(value);
                    resetPagination(); // Reset pagination when date filter changes
                  }}>
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
                <div>
                  <label className="text-sm font-medium mb-2 block">Shipment Status</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {shipmentStatus.length > 0 ? (
                          `${shipmentStatus.length} status${shipmentStatus.length > 1 ? 'es' : ''} selected`
                        ) : (
                          "Select status"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" align="start">
                      <div className="p-2 space-y-1">
                        {[
                          { value: 'booked', label: 'Created' },
                          { value: 'in_transit', label: 'In Transit' },
                          { value: 'ndr', label: 'NDR' },
                          { value: 'delivered', label: 'Delivered' },
                          { value: 'rto_in_transit', label: 'RTO' },
                          { value: 'rto_delivered', label: 'RTO Delivered' },
                          { value: 'out_for_delivery', label: 'Out For Delivery' },
                          { value: 'pickup_failed', label: 'Pickup Failed' },
                          { value: 'cancelled', label: 'Cancelled' }
                        ].map((status) => (
                          <div key={status.value} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-sm">
                            <Checkbox 
                              id={status.value}
                              checked={shipmentStatus.includes(status.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setShipmentStatus(prev => [...prev, status.value]);
                                } else {
                                  setShipmentStatus(prev => prev.filter(s => s !== status.value));
                                }
                                resetPagination(); // Reset pagination when status changes
                              }}
                            />
                            <label htmlFor={status.value} className="text-sm cursor-pointer flex-1">
                              {status.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
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
                          onSelect={(date) => {
                            setDateFrom(date);
                            resetPagination(); // Reset pagination when date changes
                          }}
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
                          onSelect={(date) => {
                            setDateTo(date);
                            resetPagination(); // Reset pagination when date changes
                          }}
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
                    onCheckedChange={(checked) => {
                      setOrderTypes(prev => ({ ...prev, prepaid: !!checked, all: false }));
                      resetPagination(); // Reset pagination when order type changes
                    }}
                  />
                  <label htmlFor="prepaid" className="text-sm">Prepaid</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cod" 
                    checked={orderTypes.cod}
                    onCheckedChange={(checked) => {
                      setOrderTypes(prev => ({ ...prev, cod: !!checked, all: false }));
                      resetPagination(); // Reset pagination when order type changes
                    }}
                  />
                  <label htmlFor="cod" className="text-sm">COD</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="all" 
                    checked={orderTypes.all}
                    onCheckedChange={(checked) => {
                      setOrderTypes(prev => ({ ...prev, all: !!checked, prepaid: false, cod: false }));
                      resetPagination(); // Reset pagination when order type changes
                    }}
                  />
                  <label htmlFor="all" className="text-sm">All</label>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={applyFilters}
                className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
              >
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Tabs - Hidden when multi-select is active */}
      {selectedShipments.length === 0 && (
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          resetPagination(); // Reset pagination when tab changes
        }}>
          <TabsList className="inline-flex py-1 text-xs" style={{ fontSize: '80%', padding: '0.25rem 0' }}>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pickup_failed">Pickup Failure</TabsTrigger>
            <TabsTrigger value="in_transit">In Transit</TabsTrigger>
            <TabsTrigger value="out_for_delivery">Out For Delivery</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="ndr">NDR</TabsTrigger>
            <TabsTrigger value="rto_in_transit">RTO</TabsTrigger>
            <TabsTrigger value="rto_delivered">RTO Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Enhanced Shipments Table */}
      <Card>
        {selectedShipments.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {selectedShipments.length} selected
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const selectedAwbs = filteredShipments
                        .filter(shipment => selectedShipments.includes(shipment.id))
                        .map(shipment => shipment.awb)
                        .filter(awb => awb);
                      
                      console.log('Selected shipments:', selectedShipments);
                      console.log('Selected AWBs:', selectedAwbs);
                      console.log('Total AWBs to download:', selectedAwbs.length);
                      
                      if (selectedAwbs.length === 0) {
                        toast({
                          title: "No Valid AWBs",
                          description: "Selected shipments don't have valid AWB numbers.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      handleDownloadShippingLabels(selectedAwbs);
                    }}
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Bulk Label
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const selectedAwbs = filteredShipments
                        .filter(shipment => selectedShipments.includes(shipment.id))
                        .map(shipment => shipment.awb)
                        .filter(awb => awb);
                      
                      console.log('Selected shipments for invoice:', selectedShipments);
                      console.log('Selected AWBs for invoice:', selectedAwbs);
                      console.log('Total AWBs to download invoice:', selectedAwbs.length);
                      
                      if (selectedAwbs.length === 0) {
                        toast({
                          title: "No Valid AWBs",
                          description: "Selected shipments don't have valid AWB numbers.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      handleDownloadInvoice(selectedAwbs);
                    }}
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement Print Pick List functionality
                      toast({
                        title: "Print Pick List",
                        description: "Print Pick List functionality coming soon!",
                      });
                    }}
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Print Pick List
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement Pickup functionality
                      toast({
                        title: "Pickup",
                        description: "Pickup functionality coming soon!",
                      });
                    }}
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Pickup
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkCancel}
                    className="bg-white hover:bg-red-50 border-red-300 text-red-700 hover:text-red-800 dark:bg-red-900 dark:hover:bg-red-800 dark:border-blue-600 dark:text-red-300 dark:hover:text-red-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading shipments...</p>
            </div>
          </CardContent>
        ) : filteredShipments.length === 0 ? (
          <CardContent className="py-8">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No shipments found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or check the console for API response</p>
            </div>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedShipments.length === filteredShipments.length && filteredShipments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Tracking Details</TableHead>
                <TableHead>Order Details</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Order Amount</TableHead>
                <TableHead>Status | Date of Delivery</TableHead>
                <TableHead>Address Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getPaginatedShipments().map((shipment) => (
                <TableRow 
                  key={shipment.id}
                  className="relative"
                  onMouseEnter={() => setHoveredShipment(shipment.id)}
                  onMouseLeave={() => setHoveredShipment(null)}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedShipments.includes(shipment.id)}
                      onCheckedChange={(checked) => handleSelectShipment(shipment.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        <Truck className="w-4 h-4 inline mr-1" />
                        {shipment.awb}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {capitalizeWords(shipment.courier_partner?.name || '')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(shipment.order_date)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        <Package className="w-4 h-4 inline mr-1" />
                        {shipment.store_order?.order_no}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getFirstProductName(shipment)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {shipment.shipment_length} × {shipment.shipment_width} × {shipment.shipment_height} cm
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Dead Weight: {shipment.weight}g
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Volumetric Weight: {calculateVolumetricWeight(shipment.shipment_length, shipment.shipment_width, shipment.shipment_height)} KG
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        ₹{shipment.total_amount}
                      </div>
                      <div>{getPaymentModeBadge(shipment.payment_mode)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{getStatusBadge(shipment.shipment_status)}</div>
                      <div className="text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Expected: {calculateExpectedDelivery(shipment.order_date)}
                      </div>
                    </div>
                  </TableCell>
                                  <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {capitalizeWords(shipment.warehouse?.warehouse_name || '')} - {shipment.warehouse?.pincode || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{shipment.customer_name}</span> - {shipment.pincode}
                      </span>
                    </div>
                  </div>
                </TableCell>
                                  <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title={`View Details (ID: ${shipment.id})`}
                      onClick={() => navigate(`/dashboard/shipments/${shipment.id}`)}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:border-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Download Label"
                      onClick={() => handleDownloadShippingLabels([shipment.awb])}
                      className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900 dark:hover:border-green-600 dark:hover:text-green-300 transition-colors duration-200"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Download Invoice"
                      onClick={() => handleDownloadInvoice([shipment.awb])}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:border-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Duplicate Order"
                      className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:border-purple-600 dark:hover:text-purple-300 transition-colors duration-200"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Return Package"
                      className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:hover:bg-orange-900 dark:hover:border-orange-600 dark:hover:text-orange-300 transition-colors duration-200"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Cancel Shipment"
                      onClick={() => handleCancelShipment(shipment)}
                      className="text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900 dark:hover:border-red-600 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Pagination Controls */}
        {filteredShipments.length > 0 && (
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalShipments)} of {totalShipments} entries
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
      </Card>

      {/* Enhanced Shipment Hover Popup */}
      {hoveredShipment && (() => {
        const shipment = filteredShipments.find(s => s.id === hoveredShipment);
        if (!shipment) return null;
        
        return (
          <div className="fixed z-50 pointer-events-none">
            <div className="absolute left-full top-0 ml-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-purple-200/30 dark:border-purple-800/30 p-4 animate-fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-purple-600 dark:text-purple-400">
                    <div>ID: {shipment.id}</div>
                    <div className="text-xs text-gray-500">AWB: {shipment.awb}</div>
                  </div>
                  {getStatusBadge(shipment.shipment_status)}
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Order:</span>
                    <span className="ml-2 font-medium">{shipment.store_order?.order_no}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="ml-2 font-medium">{shipment.customer_name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Courier:</span>
                    <span className="ml-2">{capitalizeWords(shipment.courier_partner?.name || '')}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-medium">₹{shipment.total_amount}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="ml-2">{getPaymentModeBadge(shipment.payment_mode)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Expected:</span>
                    <span className="ml-2">{calculateExpectedDelivery(shipment.order_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cancel Shipment Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel the shipment with AWB{" "}
              <span className="font-semibold text-foreground">
                {selectedShipmentForCancel?.awb}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancellingShipment}
              >
                No, Keep It
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelShipment}
                disabled={cancellingShipment}
              >
                {cancellingShipment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Shipment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Cancel Shipments Confirmation Dialog */}
      <Dialog open={showBulkCancelConfirm} onOpenChange={setShowBulkCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Multiple Shipments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel{" "}
              <span className="font-semibold text-foreground">
                {selectedShipments.length}
              </span>{" "}
              selected shipments? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowBulkCancelConfirm(false)}
                disabled={cancellingBulk}
              >
                No, Keep Them
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkCancel}
                disabled={cancellingBulk}
              >
                {cancellingBulk ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Shipments"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShipmentPage;