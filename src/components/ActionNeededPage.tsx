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
  Trash2,
  MessageSquare
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
import SmartCache, { CacheStrategies, EnhancedCacheKeys } from '@/utils/smartCache';
import { usePageMeta, PageMetaConfigs } from '@/hooks/usePageMeta';

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
  user?: {
    id: number;
    email: string;
  };
}

type ShipmentFilterRequest = {
  date_range?: string;
  order_type?: string[];
  tracking_status?: string[];
};

interface ShipmentsFetchResult {
  shipments: ShipmentItem[];
  totalShipments: number;
  totalPages: number;
  filterOptions: Record<string, string>;
  fetchedAt: number;
  noShipmentsMessage?: string;
}

const ActionNeededPage = () => {
  // Set page meta tags
  usePageMeta(PageMetaConfigs.shipments);
  
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
  const [filterOptions, setFilterOptions] = useState<Record<string, string>>({});
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
  
  // Update Remark states
  const [showUpdateRemarkDialog, setShowUpdateRemarkDialog] = useState(false);
  const [selectedShipmentForRemark, setSelectedShipmentForRemark] = useState<ShipmentItem | null>(null);
  const [remarkType, setRemarkType] = useState<string>(''); // Pickup Failed, Delivery Failed, NDR / RTO
  const [issueSource, setIssueSource] = useState<string>(''); // Courier Partner Issue or Customer End
  const [customerEndIssue, setCustomerEndIssue] = useState<string>('');
  const [courierPartnerIssue, setCourierPartnerIssue] = useState<string>('');
  const [otherRemark, setOtherRemark] = useState<string>('');
  const [updatingRemark, setUpdatingRemark] = useState(false);
  
  // Update Eway states
  const [ewayAWB, setEwayAWB] = useState<string>('');
  const [ewayDCN, setEwayDCN] = useState<string>('');
  const [ewayEWBN, setEwayEWBN] = useState<string>('');
  const [updatingEway, setUpdatingEway] = useState(false);
  
  // Regenerate Pickup states
  const [regeneratingPickup, setRegeneratingPickup] = useState<string | null>(null);
  
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
    if (pathname.includes('/dashboard/action-needed')) {
      return 'action-needed';
    } else if (pathname.includes('/dashboard/reverse-shipments') || pathname.includes('/dashboard/shipments/reverse')) {
      return 'reverse';
    } else if (pathname.includes('/dashboard/prepaid-shipments') || pathname.includes('/dashboard/shipments/prepaid')) {
      return 'prepaid';
    }
    return 'all';
  };

  const currentPageType = getCurrentPageType();

  // Action Needed page only shows these statuses
  const ACTION_NEEDED_STATUSES = [
    "pickup_failed",
    "ndr",
    "rto_in_transit",
    "rvp_cancelled"
  ];

  // All available tracking statuses
  const ALL_TRACKING_STATUSES = [
    "pending", 
    "booked", 
    "pickup_failed", 
    "in_transit", 
    "out_for_delivery", 
    "delivered", 
    "ndr", 
    "rto_in_transit", 
    "rto_delivered", 
    "cancelled", 
    "rvp_cancelled"
  ];

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

  const applyFilteredShipments = (shipmentsData: ShipmentItem[], overrideSearchTerm?: string) => {
    const filteredByPageType = filterShipmentsForPageType(shipmentsData, currentPageType);
    const finalFiltered = filterShipmentsBySearchTerm(
      filteredByPageType,
      overrideSearchTerm !== undefined ? overrideSearchTerm : searchTerm
    );
    setFilteredShipments(finalFiltered);
  };

  const fetchShipments = async ({
    isRefresh = false,
    filters,
  }: {
    isRefresh?: boolean;
    filters?: ShipmentFilterRequest;
  } = {}) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (shipments.length === 0) {
      setIsLoading(true);
    }

    const defaultOrderType =
      currentPageType === 'reverse'
        ? ['reverse']
        : currentPageType === 'prepaid'
        ? ['prepaid', 'cod']
        : ['prepaid', 'cod'];

    // For action-needed page, only fetch the specific statuses
    const defaultTrackingStatus = currentPageType === 'action-needed'
      ? ACTION_NEEDED_STATUSES
      : ALL_TRACKING_STATUSES;

    const requestFilters: ShipmentFilterRequest =
      filters || {
        date_range: '',
        order_type: defaultOrderType,
        tracking_status: defaultTrackingStatus,
      };

    const cacheKey = EnhancedCacheKeys.shipments(
      currentPage,
      pageSize,
      currentPageType,
      requestFilters
    );

    let latestDataSource: 'cache' | 'network' | null = null;

    const updateStateFromResult = (result: ShipmentsFetchResult | null, isFromCache: boolean) => {
      if (!result) return;

      latestDataSource = isFromCache ? 'cache' : 'network';

      if (result.filterOptions) {
        setFilterOptions(result.filterOptions);
      }

      setShipments(result.shipments);
      applyFilteredShipments(result.shipments);
      setTotalShipments(result.totalShipments);
      setTotalPages(result.totalPages);

      if (result.fetchedAt) {
        setLastFetchTime(new Date(result.fetchedAt));
      }

      if (isFromCache) {
        setIsLoading(false);
      }
    };

    const fetchFromApi = async (): Promise<ShipmentsFetchResult> => {
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');

      // For action-needed page, use the manage-user/shipment-filter endpoint
      const isActionNeededPage = currentPageType === 'action-needed';
      const endpoint = isActionNeededPage 
        ? 'api/manage-user/shipment-filter'
        : 'api/shipments/filter';
      
      const baseUrl = `${
        import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'
      }${endpoint}`;
      const apiUrl = `${baseUrl}?per_page=${pageSize}&page=${currentPage}`;

      // For action-needed page, prepare the request body with specific filters
      let requestBody = requestFilters;
      if (isActionNeededPage) {
        requestBody = {
          // date_range: "2025-11-10 ~ 2025-11-10", // Commented out as per requirements
          order_type: ["reverse"],
          tracking_status: ["cancelled", "booked", "ndr"]
        };
      }

      console.log('🔍 Fetching shipments with Filter API');
      console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('🌐 API URL:', apiUrl);
      console.log('📄 Pagination:', { per_page: pageSize, page: currentPage });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      console.log('📥 API Response Data:', JSON.stringify(data, null, 2));

      const errorMessage = data?.error?.message || data?.message || '';
      const isNoShipmentsFound = errorMessage?.toLowerCase?.().includes('no shipments found');

      if (!data?.status && !isNoShipmentsFound) {
        const errorMsg = errorMessage || 'Failed to fetch shipments';
        console.error('❌ API returned error:', errorMsg);
        throw new Error(errorMsg);
      }

      const filtersFromResponse = data?.data?.filter_options || {};

      let shipmentsData: ShipmentItem[] = [];

      if (data?.data?.shipment_data && Array.isArray(data.data.shipment_data)) {
        shipmentsData = data.data.shipment_data;
      } else if (Array.isArray(data?.data)) {
        shipmentsData = data.data;
      } else if (data?.data?.shipments && Array.isArray(data.data.shipments)) {
        shipmentsData = data.data.shipments;
      } else if (data?.data?.data && Array.isArray(data.data.data)) {
        shipmentsData = data.data.data;
      } else if (Array.isArray(data?.shipments)) {
        shipmentsData = data.shipments;
      } else if (Array.isArray(data?.shipment_data)) {
        shipmentsData = data.shipment_data;
      } else {
        console.warn('⚠️ No shipments array found in response. Data structure:', data);
      }

      const shipmentsWithAWB = (shipmentsData || [])
        .filter((shipment) => shipment.awb !== null && shipment.awb !== '')
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.order_date || a.store_order?.sync_date || 0);
          const dateB = new Date(b.created_at || b.order_date || b.store_order?.sync_date || 0);
          return dateB.getTime() - dateA.getTime();
        });

      const totalShipmentsCount =
        data?.data?.pagination?.total ?? shipmentsWithAWB.length ?? 0;
      const totalPagesCount =
        data?.data?.pagination?.last_page ??
        (totalShipmentsCount > 0 ? Math.ceil(totalShipmentsCount / pageSize) : 0);

      return {
        shipments: shipmentsWithAWB,
        totalShipments: totalShipmentsCount,
        totalPages: totalPagesCount,
        filterOptions: filtersFromResponse,
        fetchedAt: Date.now(),
        noShipmentsMessage: isNoShipmentsFound
          ? errorMessage || 'No shipments found for the selected filters.'
          : undefined,
      };
    };

    try {
      let result: ShipmentsFetchResult | null;

      if (isRefresh) {
        result = await SmartCache.forceRefresh(
          cacheKey,
          fetchFromApi,
          CacheStrategies.shipments,
          updateStateFromResult
        );
      } else {
        result = await SmartCache.getData(
          cacheKey,
          fetchFromApi,
          CacheStrategies.shipments,
          updateStateFromResult
        );
      }

      if (
        result &&
        result.noShipmentsMessage &&
        result.shipments.length === 0 &&
        latestDataSource === 'network'
      ) {
        toast({
          title: 'No Shipments Found',
          description: result.noShipmentsMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast({
        title: 'Error Loading Shipments',
        description: error instanceof Error ? error.message : 'Failed to fetch shipments. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  // Reset all filters when page type changes (e.g., switching between prepaid and reverse)
  useEffect(() => {
    // Reset all filter states
    setActiveTab('all');
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
    setCurrentPage(1); // Reset to first page
    setShowFilter(false);
  }, [currentPageType]);

  // Fetch shipments when page type, page, or page size changes
  useEffect(() => {
    // On initial load or page type change, fetch with all tracking statuses
    // This ensures we get all shipments when the page loads or reloads
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
      'booked': { variant: 'default', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      'pending': { variant: 'outline', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
      'in_transit': { variant: 'secondary', icon: Truck, color: 'bg-blue-100 text-blue-800' },
      'out_for_delivery': { variant: 'secondary', icon: Car, color: 'bg-purple-100 text-purple-800' },
      'delivered': { variant: 'default', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      'pickup_failed': { variant: 'destructive', icon: XCircle, color: 'bg-red-100 text-red-800' },
      'ndr': { variant: 'destructive', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800' },
      'rto_in_transit': { variant: 'destructive', icon: RotateCcw, color: 'bg-red-100 text-red-800' },
      'rto_delivered': { variant: 'destructive', icon: Home, color: 'bg-red-100 text-red-800' },
      'cancelled': { variant: 'destructive', icon: X, color: 'bg-red-200 text-red-900 font-bold' }
    };
    const config = statusConfig[statusLower] || { variant: 'default', icon: Package, color: 'bg-gray-100 text-gray-800' };
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
      <Badge variant={isPrepaid ? 'default' : 'secondary'} className={isPrepaid ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
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

      // Add order types based on page type and current filters
      if (currentPageType === 'reverse') {
        exportFilters.order_type = ['reverse'];
      } else if (currentPageType === 'prepaid') {
        exportFilters.order_type = ['prepaid', 'cod'];
      } else {
        // For other pages, use the filter checkboxes
        if (!orderTypes.all) {
          const selectedTypes = [];
          if (orderTypes.prepaid) selectedTypes.push('prepaid');
          if (orderTypes.cod) selectedTypes.push('cod');
          if (selectedTypes.length > 0) {
            exportFilters.order_type = selectedTypes;
          }
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

  const handleRegeneratePickup = async (awb: string) => {
    if (!awb) {
      toast({
        title: "Invalid AWB",
        description: "AWB number is required to regenerate pickup.",
        variant: "destructive",
      });
      return;
    }

    setRegeneratingPickup(awb);
    
    try {
      const result = await shipmentService.regeneratePickup(awb);
      
      // Show the API response message in toast
      toast({
        title: result.success ? "Pickup Request" : "Pickup Request Failed",
        description: result.message || "Pickup request processed",
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Regenerate pickup error:', error);
      toast({
        title: "Pickup Request Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegeneratingPickup(null);
    }
  };

  const handleBulkRegeneratePickup = async () => {
    const selectedAwbs = filteredShipments
      .filter(shipment => selectedShipments.includes(shipment.id))
      .map(shipment => shipment.awb)
      .filter(awb => awb);
    
    if (selectedAwbs.length === 0) {
      toast({
        title: "No Shipments Selected",
        description: "Please select at least one shipment to regenerate pickup.",
        variant: "destructive",
      });
      return;
    }

    // Process each selected shipment
    for (const awb of selectedAwbs) {
      try {
        const result = await shipmentService.regeneratePickup(awb);
        // Show toast for each result
        toast({
          title: result.success ? "Pickup Request" : "Pickup Request Failed",
          description: `AWB ${awb}: ${result.message || "Pickup request processed"}`,
          variant: result.success ? "default" : "destructive",
        });
      } catch (error) {
        console.error(`Error regenerating pickup for ${awb}:`, error);
        toast({
          title: "Pickup Request Failed",
          description: `AWB ${awb}: ${error instanceof Error ? error.message : "An unexpected error occurred"}`,
          variant: "destructive",
        });
      }
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

  const filterShipmentsForPageType = (
    shipmentsData: ShipmentItem[],
    pageType: string
  ): ShipmentItem[] => {
    if (pageType === 'reverse') {
      return shipmentsData.filter(
        (shipment: ShipmentItem) => (shipment.payment_mode || '').toLowerCase() === 'reverse'
      );
    }

    if (pageType === 'prepaid') {
      return shipmentsData.filter((shipment: ShipmentItem) => {
        const paymentMode = (shipment.payment_mode || '').toLowerCase();
        return paymentMode === 'prepaid' || paymentMode === 'cod';
      });
    }

    return shipmentsData;
  };

  const filterShipmentsBySearchTerm = (
    shipmentsData: ShipmentItem[],
    term: string
  ): ShipmentItem[] => {
    if (!term) {
      return shipmentsData;
    }

    const searchLower = term.toLowerCase();
    return shipmentsData.filter((shipment) => {
      const awbMatch = shipment.awb?.toLowerCase().includes(searchLower);
      const nameMatch = shipment.customer_name?.toLowerCase().includes(searchLower);
      const orderMatch = shipment.store_order?.order_no?.toLowerCase().includes(searchLower);
      return Boolean(awbMatch || nameMatch || orderMatch);
    });
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

  // Enhanced filter function - calls Filter API instead of client-side filtering
  const applyFilters = async () => {
    try {
      setIsLoading(true);
      resetPagination(); // Reset pagination when filters are applied
      
      // Build date_range string - format: "YYYY-MM-DD ~ YYYY-MM-DD"
      let dateRangeStr = "";
      
      // Helper function to format date as YYYY-MM-DD (local timezone, not UTC)
      const formatDate = (date: Date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      if (dateFilter === 'custom' && dateFrom && dateTo) {
        // Custom date range
        const fromStr = formatDate(dateFrom);
        const toStr = formatDate(dateTo);
        if (fromStr && toStr) {
          dateRangeStr = `${fromStr} ~ ${toStr}`;
        }
        console.log('📅 Custom date range:', { dateFrom, dateTo, dateRangeStr });
      } else if (dateFilter !== 'all') {
        // Handle predefined date ranges
        const today = new Date();
        // Reset time to midnight to avoid timezone issues
        today.setHours(0, 0, 0, 0);
        
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
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today);
            break;
          case 'lastmonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            endDate.setHours(23, 59, 59, 999);
            break;
          default:
            startDate = new Date(today);
            endDate = new Date(today);
        }
        
        const fromStr = formatDate(startDate);
        const toStr = formatDate(endDate);
        if (fromStr && toStr) {
          dateRangeStr = `${fromStr} ~ ${toStr}`;
        }
        console.log('📅 Predefined date range:', { dateFilter, startDate, endDate, dateRangeStr });
      } else {
        // dateFilter === 'all' - empty string
        dateRangeStr = "";
        console.log('📅 No date filter (all time)');
      }
      
      // Build order_type array based on page type and selected filters
      const orderTypeArray: string[] = [];
      
      // If on reverse-shipments page, always use reverse
      if (currentPageType === 'reverse') {
        orderTypeArray.push('reverse');
      } else if (currentPageType === 'prepaid') {
        // If on prepaid-shipments page, use prepaid and cod
        orderTypeArray.push('prepaid', 'cod');
      } else {
        // For other pages, use the filter checkboxes
        if (!orderTypes.all) {
          if (orderTypes.prepaid) orderTypeArray.push('prepaid');
          if (orderTypes.cod) orderTypeArray.push('cod');
        } else {
          // If "all" is selected, include both prepaid and cod
          orderTypeArray.push('prepaid', 'cod');
        }
      }
      
      // Build tracking_status array - use selected statuses or all if none selected
      const trackingStatusArray = shipmentStatus.length > 0 
        ? shipmentStatus 
        : Object.keys(filterOptions).length > 0 
          ? Object.keys(filterOptions) 
          : ALL_TRACKING_STATUSES;
      
      // If activeTab is not 'all', filter by that status
      if (activeTab !== 'all') {
        const tabStatus = activeTab;
        if (!trackingStatusArray.includes(tabStatus)) {
          trackingStatusArray.push(tabStatus);
        }
      }
      
      // Build the filter request body
      const filterRequestBody = {
        date_range: dateRangeStr,
        order_type: orderTypeArray,
        tracking_status: trackingStatusArray
      };
      
      console.log('🔍 Applying filters with request:', JSON.stringify(filterRequestBody, null, 2));
      
      // Call fetchShipments with custom filters
      await fetchShipments({ filters: filterRequestBody });
      
      setShowFilter(false);
      
      toast({
        title: "Filters Applied",
        description: "Shipments filtered successfully.",
      });
    } catch (error) {
      console.error('Error applying filters:', error);
      toast({
        title: "Error Applying Filters",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = async () => {
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
    resetPagination(); // Reset pagination when filters are reset
    
    // Call API with default filters to reset (based on page type)
    try {
      const defaultOrderType = currentPageType === 'reverse' 
        ? ["reverse"]
        : currentPageType === 'prepaid'
        ? ["prepaid", "cod"]
        : ["prepaid", "cod"];
      
      const defaultTrackingStatus = currentPageType === 'action-needed'
        ? ACTION_NEEDED_STATUSES
        : Object.keys(filterOptions).length > 0 
          ? Object.keys(filterOptions) 
          : ALL_TRACKING_STATUSES;
      
      await fetchShipments({
        filters: {
          date_range: "",
          order_type: defaultOrderType,
          tracking_status: defaultTrackingStatus
        }
      });
    } catch (error) {
      console.error('Error resetting filters:', error);
    }
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

  const handleUpdateRemark = async () => {
    if (!selectedShipmentForRemark || !selectedShipmentForRemark.awb) {
      toast({
        title: "Error",
        description: "No shipment selected for updating remarks.",
        variant: "destructive",
      });
      return;
    }

    if (!remarkType) {
      toast({
        title: "Error",
        description: "Please select a remark type.",
        variant: "destructive",
      });
      return;
    }

    if (!issueSource) {
      toast({
        title: "Error",
        description: "Please select issue source (Courier Partner Issue or Customer End).",
        variant: "destructive",
      });
      return;
    }

    // Build remarks object based on selected type
    let remarks: {
      pickup_remark?: string;
      delivery_remark?: string;
      arrange_return?: string;
      ndr_remark?: string;
    } = {};

    // Set the appropriate remark field based on issue source and selected option
    let remarkText = '';
    
    if (issueSource === 'Customer End') {
      if (!customerEndIssue) {
        toast({
          title: "Error",
          description: "Please select a customer end issue.",
          variant: "destructive",
        });
        return;
      }
      if (customerEndIssue === 'Other') {
        if (!otherRemark.trim()) {
          toast({
            title: "Error",
            description: "Please enter a remark for 'Other'.",
            variant: "destructive",
          });
          return;
        }
        remarkText = otherRemark;
      } else {
        remarkText = customerEndIssue;
      }
    } else if (issueSource === 'Courier Partner Issue') {
      if (!courierPartnerIssue) {
        toast({
          title: "Error",
          description: "Please select a courier partner issue.",
          variant: "destructive",
        });
        return;
      }
      remarkText = courierPartnerIssue;
    }

    // Map remark type to the appropriate field
    if (remarkType === 'Pickup Failed') {
      remarks.pickup_remark = remarkText;
    } else if (remarkType === 'Delivery Failed') {
      remarks.delivery_remark = remarkText;
    } else if (remarkType === 'NDR / RTO') {
      remarks.ndr_remark = remarkText;
    }

    try {
      setUpdatingRemark(true);
      const result = await shipmentService.updateRemarks(selectedShipmentForRemark.awb, remarks);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message, // Use the exact message from API
        });
        setShowUpdateRemarkDialog(false);
        setSelectedShipmentForRemark(null);
        setRemarkType('');
        setIssueSource('');
        setCustomerEndIssue('');
        setCourierPartnerIssue('');
        setOtherRemark('');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating remark:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update remark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRemark(false);
    }
  };

  const handleUpdateEway = async () => {
    if (!ewayAWB || !ewayDCN || !ewayEWBN) {
      toast({
        title: "Error",
        description: "Please fill in all fields (AWB, Invoice Number, and Eway Number).",
        variant: "destructive",
      });
      return;
    }

    // Validate eway number is 12 digits
    if (ewayEWBN.length !== 12 || !/^\d+$/.test(ewayEWBN)) {
      toast({
        title: "Error",
        description: "Eway Number must be exactly 12 digits.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingEway(true);
      const result = await shipmentService.updateEwayBill(ewayAWB, ewayDCN, ewayEWBN);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Eway bill updated successfully!",
        });
        // Reset form
        setEwayAWB('');
        setEwayDCN('');
        setEwayEWBN('');
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update eway bill.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating eway bill:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update eway bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingEway(false);
    }
  };

  // Debug log
  console.log('Current shipments state:', shipments);
  console.log('Current filtered shipments:', filteredShipments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
            {currentPageType === 'action-needed' ? 'Action Needed' : 
             currentPageType === 'reverse' ? 'Reverse Shipments' : 
             currentPageType === 'prepaid' ? 'Prepaid & COD Shipments' : 
             'Shipments Management'}
          </h1>
          {currentPageType === 'action-needed' && (
            <p className="text-muted-foreground mt-1">Showing shipments requiring action: Pickup Failed, NDR, RTO In Transit, RVP Cancelled</p>
          )}
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
            onClick={async () => {
              // Reset all filters when refreshing
              setActiveTab('all');
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
              setCurrentPage(1);
              setShowFilter(false);
              
              // Fetch with all tracking statuses
              const defaultOrderType = currentPageType === 'reverse' 
                ? ["reverse"]
                : currentPageType === 'prepaid'
                ? ["prepaid", "cod"]
                : ["prepaid", "cod"];
              
              const defaultTrackingStatus = currentPageType === 'action-needed'
                ? ACTION_NEEDED_STATUSES
                : ALL_TRACKING_STATUSES;
              
              await fetchShipments({
                isRefresh: true,
                filters: {
                  date_range: "",
                  order_type: defaultOrderType,
                  tracking_status: defaultTrackingStatus
                }
              });
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
                      const newSearchTerm = e.target.value;
                      setSearchTerm(newSearchTerm);
                      applyFilteredShipments(shipments, newSearchTerm);
                      // Don't reset pagination here as it interferes with user navigation
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Filter</label>
                  <Select value={dateFilter} onValueChange={(value) => {
                    setDateFilter(value);
                    // Don't reset pagination here as it interferes with user navigation
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
                        {Object.keys(filterOptions).length > 0 ? (
                          Object.entries(filterOptions).map(([value, label]) => (
                            <div key={value} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-sm">
                              <Checkbox 
                                id={value}
                                checked={shipmentStatus.includes(value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setShipmentStatus(prev => [...prev, value]);
                                  } else {
                                    setShipmentStatus(prev => prev.filter(s => s !== value));
                                  }
                                  // Don't reset pagination here as it interferes with user navigation
                                }}
                              />
                              <label htmlFor={value} className="text-sm cursor-pointer flex-1">
                                {label}
                              </label>
                            </div>
                          ))
                        ) : (
                          // Fallback to default options if filterOptions not loaded yet
                          [
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
                                  // Don't reset pagination here as it interferes with user navigation
                                }}
                              />
                              <label htmlFor={status.value} className="text-sm cursor-pointer flex-1">
                                {status.label}
                              </label>
                            </div>
                          ))
                        )}
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
                            // Don't reset pagination here as it interferes with user navigation
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
                            // Don't reset pagination here as it interferes with user navigation
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
                      // Don't reset pagination here as it interferes with user navigation
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
                      // Don't reset pagination here as it interferes with user navigation
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
                      // Don't reset pagination here as it interferes with user navigation
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
        <Tabs value={activeTab} onValueChange={async (value) => {
          setActiveTab(value);
          
          // Don't fetch shipments if switching to update-eway tab
          if (value === 'update-eway') {
            return;
          }
          
          resetPagination(); // Reset to first page when changing tabs
          
          // Build order_type based on page type
          const orderTypeArray: string[] = [];
          if (currentPageType === 'reverse') {
            orderTypeArray.push('reverse');
          } else if (currentPageType === 'prepaid') {
            orderTypeArray.push('prepaid', 'cod');
          } else {
            orderTypeArray.push('prepaid', 'cod');
          }
          
          // Build tracking_status array based on selected tab
          // For action-needed page, only allow the specific statuses
          const availableStatuses = currentPageType === 'action-needed'
            ? ACTION_NEEDED_STATUSES
            : ALL_TRACKING_STATUSES;
          
          const trackingStatusArray = value === 'all' 
            ? availableStatuses
            : [value];
          
          // Call filter API with tab selection
          try {
            setIsLoading(true);
            await fetchShipments({
              filters: {
                date_range: "",
                order_type: orderTypeArray,
                tracking_status: trackingStatusArray
              }
            });
          } catch (error) {
            console.error('Error applying tab filter:', error);
          } finally {
            setIsLoading(false);
          }
        }}>
          <TabsList className="inline-flex py-1 text-xs" style={{ fontSize: '80%', padding: '0.25rem 0' }}>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            {currentPageType === 'action-needed' && (
              <TabsTrigger value="update-eway">Update Eway</TabsTrigger>
            )}
            {(currentPageType === 'action-needed' ? ACTION_NEEDED_STATUSES : ALL_TRACKING_STATUSES).map((statusKey) => {
              // Use label from filterOptions if available, otherwise use capitalized status key
              const statusLabel = filterOptions[statusKey] || statusKey.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              
              // Only show tab if it exists in filterOptions (when loaded) or show all if not loaded yet
              if (Object.keys(filterOptions).length > 0 && !filterOptions[statusKey]) {
                return null;
              }
              
              return (
                <TabsTrigger key={statusKey} value={statusKey}>
                  {statusLabel}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {/* Update Eway Tab Content */}
          {currentPageType === 'action-needed' && (
            <TabsContent value="update-eway" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Update Eway Bill</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter the AWB number, Invoice Number (DCN), and Eway Number (EWBN) to update the eway bill.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        AWB Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter AWB number"
                        value={ewayAWB}
                        onChange={(e) => setEwayAWB(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Invoice Number (DCN) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter Invoice Number"
                        value={ewayDCN}
                        onChange={(e) => setEwayDCN(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Eway Number (EWBN) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter 12-digit Eway Number"
                        value={ewayEWBN}
                        onChange={(e) => {
                          // Only allow digits and limit to 12 characters
                          const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                          setEwayEWBN(value);
                        }}
                        maxLength={12}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Eway Number must be exactly 12 digits
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEwayAWB('');
                        setEwayDCN('');
                        setEwayEWBN('');
                      }}
                      disabled={updatingEway}
                      className="min-w-[100px]"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleUpdateEway}
                      disabled={updatingEway || !ewayAWB || !ewayDCN || !ewayEWBN}
                      className="min-w-[140px] bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                    >
                      {updatingEway ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Update Eway
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
        </Tabs>
      )}

      {/* Enhanced Shipments Table - Only show when not on Update Eway tab */}
      {activeTab !== 'update-eway' && (
        <Card>
        {selectedShipments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-blue-900">
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
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800"
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
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800"
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
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Print Pick List
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkRegeneratePickup}
                    disabled={regeneratingPickup !== null}
                    className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800"
                  >
                    {regeneratingPickup ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Pickup
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkCancel}
                    className="bg-white hover:bg-red-50 border-red-300 text-red-700 hover:text-red-800"
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Loading shipments...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : getPaginatedShipments().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <div className="text-gray-500">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                      <p>No shipments found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                getPaginatedShipments().map((shipment) => (
                <TableRow 
                  key={shipment.id}
                  className="relative"
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
                        {formatDateTime(shipment.created_at || shipment.order_date)}
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
                      {shipment.user?.email && (
                        <div className="text-sm font-semibold text-blue-600">
                          <User className="w-3 h-3 inline mr-1" />
                          {shipment.user.email}
                        </div>
                      )}
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
                      <span className="text-sm text-gray-700">
                        {capitalizeWords(shipment.warehouse?.warehouse_name || '')} - {shipment.warehouse?.pincode || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      <span className="text-sm text-gray-700">
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
                      onClick={() => navigate(`/dashboard/shipment/${shipment.awb}`)}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Download Label"
                      onClick={() => handleDownloadShippingLabels([shipment.awb])}
                      className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors duration-200"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Update Remark"
                      onClick={() => {
                        setSelectedShipmentForRemark(shipment);
                        setShowUpdateRemarkDialog(true);
                        setRemarkType('');
                        setIssueSource('');
                        setCustomerEndIssue('');
                        setCourierPartnerIssue('');
                        setOtherRemark('');
                      }}
                      className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors duration-200"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Regenerate Pickup"
                      onClick={() => handleRegeneratePickup(shipment.awb)}
                      disabled={regeneratingPickup === shipment.awb}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                    >
                      {regeneratingPickup === shipment.awb ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Duplicate Order"
                      className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors duration-200"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Return Package"
                      className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors duration-200"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Cancel Shipment"
                      onClick={() => handleCancelShipment(shipment)}
                      className="text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                </TableRow>
                ))
              )}
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
      )}


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

      {/* Update Remark Dialog */}
      <Dialog open={showUpdateRemarkDialog} onOpenChange={setShowUpdateRemarkDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Update Remark</DialogTitle>
            {selectedShipmentForRemark && (
              <p className="text-sm text-muted-foreground mt-2">
                AWB: <span className="font-semibold text-foreground">{selectedShipmentForRemark.awb}</span>
              </p>
            )}
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason <span className="text-red-500">*</span></label>
              <Select value={remarkType} onValueChange={(value) => {
                setRemarkType(value);
                setIssueSource('');
                setCustomerEndIssue('');
                setCourierPartnerIssue('');
                setOtherRemark('');
              }}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pickup Failed">Pickup Failed</SelectItem>
                  <SelectItem value="Delivery Failed">Delivery Failed</SelectItem>
                  <SelectItem value="NDR / RTO">NDR / RTO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {remarkType && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Issue Source <span className="text-red-500">*</span></label>
                <Select value={issueSource} onValueChange={(value) => {
                  setIssueSource(value);
                  setCustomerEndIssue('');
                  setCourierPartnerIssue('');
                  setOtherRemark('');
                }}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select issue source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Courier Partner Issue">Courier Partner Issue</SelectItem>
                    <SelectItem value="Customer End">Customer End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {remarkType && issueSource === 'Customer End' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Customer End Issue <span className="text-red-500">*</span></label>
                <Select value={customerEndIssue} onValueChange={(value) => {
                  setCustomerEndIssue(value);
                  if (value !== 'Other') {
                    setOtherRemark('');
                  }
                }}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer Not Available">Customer Not Available</SelectItem>
                    <SelectItem value="Customer Not Responding">Customer Not Responding</SelectItem>
                    <SelectItem value="Phone Switched Off / Not Reachable">Phone Switched Off / Not Reachable</SelectItem>
                    <SelectItem value="Customer Address Incorrect">Customer Address Incorrect</SelectItem>
                    <SelectItem value="Shipment Not Ready">Shipment Not Ready</SelectItem>
                    <SelectItem value="Customer Requested Future Pickup">Customer Requested Future Pickup</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {remarkType && issueSource === 'Customer End' && customerEndIssue === 'Other' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Other Remark <span className="text-red-500">*</span></label>
                <Input
                  placeholder="Enter remark"
                  value={otherRemark}
                  onChange={(e) => setOtherRemark(e.target.value)}
                  className="h-11"
                />
              </div>
            )}

            {remarkType && issueSource === 'Courier Partner Issue' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Courier Partner Issue <span className="text-red-500">*</span></label>
                <Select value={courierPartnerIssue} onValueChange={setCourierPartnerIssue}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fake Remarks by Courier Partner">Fake Remarks by Courier Partner</SelectItem>
                    <SelectItem value="Operational Challenges at ground / manpower shortage">Operational Challenges at ground / manpower shortage</SelectItem>
                    <SelectItem value="Bad Weather">Bad Weather</SelectItem>
                    <SelectItem value="Oversized Shipment - FE arrived on two-wheeler">Oversized Shipment - FE arrived on two-wheeler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpdateRemarkDialog(false);
                setSelectedShipmentForRemark(null);
                setRemarkType('');
                setIssueSource('');
                setCustomerEndIssue('');
                setCourierPartnerIssue('');
                setOtherRemark('');
              }}
              disabled={updatingRemark}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRemark}
              disabled={updatingRemark || !remarkType || !issueSource}
              className="min-w-[140px] bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
            >
              {updatingRemark ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Remark"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionNeededPage;