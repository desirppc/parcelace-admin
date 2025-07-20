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
import { useToast } from '@/hooks/use-toast';
import { format, addDays, parseISO } from 'date-fns';
import OnboardingLayout from './OnboardingLayout';
import { ExcelExportService, ExportColumn } from '@/utils/excelExport';
import { DateRange } from 'react-day-picker';

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
  const { toast } = useToast();

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
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
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
        setFilteredShipments(shipmentsWithAWB);
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
  }, []);

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

  const handleExport = () => {
    try {
      if (filteredShipments.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no shipments to export.",
          variant: "destructive",
        });
        return;
      }

      // Export columns configuration for shipments
      const exportColumns: ExportColumn[] = [
        { key: 'awb', header: 'AWB Number', width: 20 },
        { key: 'customer_name', header: 'Customer Name', width: 25 },
        { key: 'customer_number', header: 'Customer Phone', width: 20 },
        { key: 'customer_address', header: 'Delivery Address', width: 40 },
        { key: 'pincode', header: 'Pincode', width: 12 },
        { key: 'city', header: 'City', width: 20 },
        { key: 'state', header: 'State', width: 20 },
        { key: 'payment_mode', header: 'Payment Mode', width: 15 },
        { key: 'cod_amount', header: 'COD Amount (₹)', width: 15, format: ExcelExportService.formatCurrency },
        { key: 'total_amount', header: 'Total Amount (₹)', width: 15, format: ExcelExportService.formatCurrency },
        { key: 'weight', header: 'Weight (kg)', width: 12 },
        { key: 'shipment_status', header: 'Status', width: 15, format: ExcelExportService.formatStatus },
        { key: 'order_date', header: 'Order Date', width: 20, format: ExcelExportService.formatDate },
        { key: 'courier_partner.name', header: 'Courier Partner', width: 20 },
        { key: 'warehouse.warehouse_name', header: 'Warehouse', width: 25 }
      ];

      ExcelExportService.exportToExcel({
        filename: `shipments-${activeTab}-${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Shipments',
        columns: exportColumns,
        data: filteredShipments,
      });

      toast({
        title: "Export Successful",
        description: "Shipments exported to Excel file successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export shipments. Please try again.",
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

  // Enhanced filter function (copied from OrdersPage)
  const applyFilters = () => {
    let filtered = shipments;

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
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setOrderTypes({ prepaid: false, cod: false, all: true });
    setShipmentStatus([]);
    setFilteredShipments(shipments);
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
            Shipments Management
          </h1>
          {lastFetchTime && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastFetchTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => fetchShipments(true)}
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
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
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
                    id="all" 
                    checked={orderTypes.all}
                    onCheckedChange={(checked) => 
                      setOrderTypes(prev => ({ ...prev, all: !!checked, prepaid: false, cod: false }))
                    }
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

      {/* Enhanced Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
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

      {/* Enhanced Shipments Table */}
      <Card>
        {selectedShipments.length > 0 && (
          <CardHeader>
            <CardTitle>Selected Shipments ({selectedShipments.length})</CardTitle>
          </CardHeader>
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
              {filteredShipments.map((shipment) => (
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
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                        {capitalizeWords(shipment.warehouse?.warehouse_name || '')} - {shipment.warehouse?.pincode || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                        <span className="font-semibold bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{shipment.customer_name}</span> - {shipment.pincode}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                                  <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="View Details"
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:border-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Download Label"
                      className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900 dark:hover:border-green-600 dark:hover:text-green-300 transition-colors duration-200"
                    >
                      <Download className="w-3 h-3" />
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
                  <div className="font-medium text-purple-600 dark:text-purple-400">{shipment.awb}</div>
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
    </div>
  );
};

export default ShipmentPage;