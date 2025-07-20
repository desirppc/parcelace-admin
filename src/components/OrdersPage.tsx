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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { ExcelExportService, ExportColumn } from '@/utils/excelExport';
import CourierPartnerSelection from './CourierPartnerSelection';


const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showBulkShipModal, setShowBulkShipModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showBulkCancelConfirm, setShowBulkCancelConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [orderTypes, setOrderTypes] = useState({
    prepaid: false,
    cod: false,
    all: true
  });
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  
  // Import order states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Courier selection states
  const [showCourierSelection, setShowCourierSelection] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<any>(null);
  
  // Filter API states
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let authToken = sessionStorage.getItem('auth_token');
        if (!authToken) authToken = localStorage.getItem('auth_token');
        console.log('Using auth_token for API:', authToken);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order`, {
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
          setOrders(sortedOrders);
          // Filter based on active tab
          filterOrdersByTab(sortedOrders, activeTab);
        } else {
          toast({
            title: 'Error',
            description: data?.error?.message || data?.message || 'Failed to fetch orders.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Network Error',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setWarehousesLoading(true);
      try {
        let authToken = sessionStorage.getItem('auth_token');
        if (!authToken) authToken = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        let warehousesData = [];
        if (data && data.status && data.data && Array.isArray(data.data.warehouses_data)) {
          warehousesData = data.data.warehouses_data;
        } else if (data && Array.isArray(data)) {
          warehousesData = data;
        } else if (data && Array.isArray(data.data)) {
          warehousesData = data.data;
        } else if (data && data.data && Array.isArray(data.data.warehouses)) {
          warehousesData = data.data.warehouses;
        } else if (data && data.warehouses && Array.isArray(data.warehouses)) {
          warehousesData = data.warehouses;
        }
        setWarehouses(warehousesData);
      } catch (error) {
        setWarehouses([]);
      } finally {
        setWarehousesLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  // Filter orders based on active tab
  const filterOrdersByTab = (ordersData: any[], tab: string) => {
    let filtered = ordersData;
    
    if (tab === 'pending') {
      filtered = ordersData.filter((order: any) => 
        (order.status || '').toLowerCase() === 'pending' || !order.status || order.status === ''
      );
    }
    // For 'all' tab, show all orders
    
    setFilteredOrders(filtered);
  };

  // Update filtered orders when tab changes
  useEffect(() => {
    filterOrdersByTab(orders, activeTab);
  }, [activeTab, orders]);

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
    const displayStatus = status || 'Pending'; // Show "Pending" when status is empty
    const variants = {
      'booked': 'default',
      'shipped': 'secondary',
      'delivered': 'default',
      'cancelled': 'destructive',
      'pending': 'outline'
    };
    
    // Custom styling for better color distinction
    if (statusLower === 'booked' || displayStatus === 'booked') {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white border-green-500">{displayStatus}</Badge>;
    } else if (statusLower === 'pending' || !status || status === '') {
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500">{displayStatus}</Badge>;
    }
    
    return <Badge variant={variants[statusLower] || 'outline'}>{displayStatus}</Badge>;
  };

  const handleExport = () => {
    try {
      if (filteredOrders.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no orders to export.",
          variant: "destructive",
        });
        return;
      }

      // Export columns configuration for orders
      const exportColumns: ExportColumn[] = [
        { key: 'order_id', header: 'Order ID', width: 20 },
        { key: 'customer_name', header: 'Customer Name', width: 25 },
        { key: 'customer_phone', header: 'Customer Phone', width: 20 },
        { key: 'customer_email', header: 'Customer Email', width: 30 },
        { key: 'pickup_address', header: 'Pickup Address', width: 40 },
        { key: 'delivery_address', header: 'Delivery Address', width: 40 },
        { key: 'amount', header: 'Amount (₹)', width: 15, format: ExcelExportService.formatCurrency },
        { key: 'payment_mode', header: 'Payment Mode', width: 15 },
        { key: 'status', header: 'Status', width: 15, format: ExcelExportService.formatStatus },
        { key: 'created_at', header: 'Created Date', width: 20, format: ExcelExportService.formatDate },
        { key: 'updated_at', header: 'Updated Date', width: 20, format: ExcelExportService.formatDate }
      ];

      ExcelExportService.exportToExcel({
        filename: `orders-${activeTab}-${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Orders',
        columns: exportColumns,
        data: filteredOrders,
      });

      toast({
        title: "Export Successful",
        description: "Orders exported to Excel file successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShip = (order: any) => {
    setSelectedOrder(order);
    setShowShipModal(true);
  };

  const handleBulkShip = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to ship.",
        variant: "destructive"
      });
      return;
    }
    setShowBulkShipModal(true);
  };

  const handleWarehouseSelect = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
  };

  const confirmShipment = () => {
    if (!selectedWarehouse) {
      toast({
        title: "No Warehouse Selected",
        description: "Please select a warehouse to proceed.",
        variant: "destructive"
      });
      return;
    }

    // Close warehouse modal and open courier selection
    setShowShipModal(false);
    setShowCourierSelection(true);
    setSelectedOrderForShipping(selectedOrder);
  };

  const confirmBulkShipment = () => {
    if (!selectedWarehouse) {
      toast({
        title: "No Warehouse Selected",
        description: "Please select a warehouse to proceed.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bulk Shipment Booked",
      description: `${selectedOrders.length} orders have been assigned to ${selectedWarehouse.warehouse_name}`,
    });
    setShowBulkShipModal(false);
    setSelectedOrders([]);
    setSelectedWarehouse(null);
  };

  const handleCancelOrder = (order: any) => {
    setSelectedOrder(order);
    setShowCancelConfirm(true);
  };

  const handleViewOrder = (order: any) => {
    // Open order details in new tab using the database ID
    window.open(`/order/${order.id}`, '_blank');
  };

  const confirmCancelOrder = () => {
    toast({
      title: "Order Cancelled",
      description: `Order ${selectedOrder?.order_no} has been cancelled successfully.`,
    });
    setShowCancelConfirm(false);
    setSelectedOrder(null);
  };

  const handleBulkCancel = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to cancel.",
        variant: "destructive"
      });
      return;
    }
    setShowBulkCancelConfirm(true);
  };

  const confirmBulkCancel = () => {
    toast({
      title: "Orders Cancelled",
      description: `${selectedOrders.length} orders have been cancelled successfully.`,
    });
    setShowBulkCancelConfirm(false);
    setSelectedOrders([]);
  };

  const handleSelectOrder = (orderId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      // When selecting all, show only pending orders
      setActiveTab('pending');
      setSelectedOrders(filteredOrders.filter(order => 
        (order.status || '').toLowerCase() === 'pending' || !order.status || order.status === ''
      ).map(order => order.id));
    } else {
      // When unselecting all, show all orders
      setActiveTab('all');
      setSelectedOrders([]);
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
    setShowFilter(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setOrderTypes({ prepaid: false, cod: false, all: true });
    
    // Reset to original orders by refetching
    const fetchOrders = async () => {
      try {
        let authToken = sessionStorage.getItem('auth_token');
        if (!authToken) authToken = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order`, {
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
          filterOrdersByTab(sortedOrders, activeTab);
        }
      } catch (error) {
        console.error('Error resetting filters:', error);
      }
    };
    fetchOrders();
  };

  const filteredWarehouses = Array.isArray(warehouses)
    ? warehouses.filter(warehouse =>
        (warehouse.warehouse_name || '').toLowerCase().includes(warehouseSearch.toLowerCase()) ||
        (warehouse.city || '').toLowerCase().includes(warehouseSearch.toLowerCase()) ||
        (warehouse.state || '').toLowerCase().includes(warehouseSearch.toLowerCase())
      )
    : [];

  const hasSelectedOrders = selectedOrders.length > 0;

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

  // Import order handlers
  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel' || 
                 file.name.endsWith('.xlsx') || 
                 file.name.endsWith('.xls') || 
                 file.name.endsWith('.csv'))) {
      setImportFile(file);
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
    try {
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');

      const formData = new FormData();
      formData.append('spreadsheet', importFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order/import-bulk-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status) {
        toast({
          title: "Import Successful",
          description: data.message || "Orders imported successfully!",
        });
        setShowImportModal(false);
        setImportFile(null);
        // Refresh orders list
        window.location.reload();
      } else {
        toast({
          title: "Import Failed",
          description: data.message || data.error?.message || "Failed to import orders.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadSample = () => {
    // Use your existing CSV structure - please replace this with your actual CSV structure
    const sampleData = [
      // Replace these headers and sample rows with your actual CSV structure
      ['order_id', 'customer_name', 'customer_phone', 'customer_email', 'customer_address', 'product_name', 'quantity', 'price', 'order_type'],
      ['ORD001', 'John Doe', '+91-9876543210', 'john@example.com', '123 Main St, City, State 12345', 'Product 1', '2', '500', 'prepaid'],
      ['ORD002', 'Jane Smith', '+91-9876543211', 'jane@example.com', '456 Oak Ave, City, State 12345', 'Product 2', '1', '750', 'cod'],
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-import-order.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Courier selection handlers
  const handleCourierSelect = (courier: any, rate: any) => {
    if (courier === null && rate === null) {
      // Booking was successful, close modal and refresh orders
      setShowCourierSelection(false);
      setSelectedOrderForShipping(null);
      window.location.reload();
    }
  };

  const getOrderSummaryForCourier = (order: any) => {
    // Use selected warehouse if available, otherwise fall back to order data
    const warehouseDetails = selectedWarehouse || order.warehouse_details;
    const pickupLocation = warehouseDetails 
      ? `${warehouseDetails.city || 'Unknown'}, ${warehouseDetails.state || 'Unknown'} - ${warehouseDetails.pincode || 'Unknown'}`
      : "Warehouse location to be determined";

    return {
      orderId: parseInt(order.order_id) || 1,
      warehouseId: warehouseDetails?.id || 60,
      rtoId: warehouseDetails?.id || 60,
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
  };

  // API-based filter function
  const fetchFilteredOrders = async (filterPayload: any) => {
    setFilterLoading(true);
    try {
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order/filter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(filterPayload),
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
        filterOrdersByTab(sortedOrders, activeTab);
        
        toast({
          title: 'Filter Applied',
          description: `Found ${sortedOrders.length} orders matching your criteria.`,
        });
      } else {
        toast({
          title: 'Filter Error',
          description: data?.message || 'Failed to fetch filtered orders.',
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
            Orders Management
          </h1>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => navigate('/add-order')}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Order
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
                        disabled={!importFile || importLoading}
                        className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                      >
                        {importLoading ? 'Importing...' : 'Import'}
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
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-60 grid-cols-2 h-8">
            <TabsTrigger value="all" className="text-xs px-4 py-2">All Orders</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs px-4 py-2">Pending</TabsTrigger>
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

        {/* Conditional Tabs/Buttons */}
        {hasSelectedOrders ? (
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleBulkShip}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
            >
              <Ship className="w-4 h-4 mr-2" />
              Bulk Ship ({selectedOrders.length})
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBulkCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Bulk Cancel ({selectedOrders.length})
            </Button>
          </div>
        ) : null}

          {/* Tabs Content */}
          <TabsContent value="all" className="space-y-4">
            {/* All Orders Table */}
          <Card>
            {hasSelectedOrders && (
              <CardHeader>
                <CardTitle>Selected Orders ({selectedOrders.length})</CardTitle>
              </CardHeader>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(hasSelectedOrders ? filteredOrders.filter(order => selectedOrders.includes(order.id)) : filteredOrders).map((order) => (
                    <TableRow 
                      key={order.id}
                      className="relative"
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedOrders.includes(order.id)}
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
                      <TableCell>{`${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim()}</TableCell>
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
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10 hover:border-pink-500/30 hover:text-pink-600 transition-all duration-200"
                                title="Edit Order"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
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
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {/* Pending Orders Table */}
            <Card>
              {hasSelectedOrders && (
                <CardHeader>
                  <CardTitle>Selected Orders ({selectedOrders.length})</CardTitle>
                </CardHeader>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(hasSelectedOrders ? filteredOrders.filter(order => selectedOrders.includes(order.id)) : filteredOrders).map((order) => (
                  <TableRow 
                    key={order.id}
                    className="relative"
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedOrders.includes(order.id)}
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
                    <TableCell>{`${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim()}</TableCell>
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
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-blue-600/10 hover:border-pink-500/30 hover:text-pink-600 transition-all duration-200"
                                title="Edit Order"
                              >
                          <Edit className="w-4 h-4" />
                        </Button>
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
                ))}
              </TableBody>
            </Table>
          </Card>
          </TabsContent>
        </Tabs>

          {/* Ship Modal */}
          <Dialog open={showShipModal} onOpenChange={setShowShipModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Warehouse for {selectedOrder?.order_no}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search warehouses..." 
                    className="pl-10"
                    value={warehouseSearch}
                    onChange={(e) => setWarehouseSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {warehousesLoading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading warehouses...</div>
                  ) : filteredWarehouses.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No warehouses found.</div>
                  ) : filteredWarehouses.map((warehouse) => (
                    <div 
                      key={warehouse.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedWarehouse?.id === warehouse.id 
                          ? 'border-primary bg-gradient-to-r from-pink-500/10 to-blue-600/10' 
                          : 'hover:bg-gradient-to-r hover:from-pink-500/5 hover:to-blue-600/5 hover:border-primary/20'
                      }`}
                      onClick={() => handleWarehouseSelect(warehouse)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{warehouse.warehouse_name}</div>
                          <div className="text-sm text-muted-foreground">{warehouse.city}, {warehouse.state}</div>
                          <div className="text-xs text-muted-foreground">{warehouse.pincode}</div>
                        </div>
                        {selectedWarehouse?.id === warehouse.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowShipModal(false);
                      setSelectedWarehouse(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={confirmShipment}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    <Ship className="w-4 h-4 mr-2" />
                    Ship
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Ship Modal */}
          <Dialog open={showBulkShipModal} onOpenChange={setShowBulkShipModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Warehouse for {selectedOrders.length} Orders</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search warehouses..." 
                    className="pl-10"
                    value={warehouseSearch}
                    onChange={(e) => setWarehouseSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {warehousesLoading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading warehouses...</div>
                  ) : filteredWarehouses.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No warehouses found.</div>
                  ) : filteredWarehouses.map((warehouse) => (
                    <div 
                      key={warehouse.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedWarehouse?.id === warehouse.id 
                          ? 'border-primary bg-gradient-to-r from-pink-500/10 to-blue-600/10' 
                          : 'hover:bg-gradient-to-r hover:from-pink-500/5 hover:to-blue-600/5 hover:border-primary/20'
                      }`}
                      onClick={() => handleWarehouseSelect(warehouse)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{warehouse.warehouse_name}</div>
                          <div className="text-sm text-muted-foreground">{warehouse.city}, {warehouse.state}</div>
                          <div className="text-xs text-muted-foreground">{warehouse.pincode}</div>
                        </div>
                        {selectedWarehouse?.id === warehouse.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowBulkShipModal(false);
                      setSelectedWarehouse(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={confirmBulkShipment}
                    className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                  >
                    <Ship className="w-4 h-4 mr-2" />
                    Bulk Ship
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
                  <Button variant="destructive" onClick={confirmCancelOrder}>
                    Yes, Cancel Order
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
                <p>Are you sure you want to cancel <strong>{selectedOrders.length}</strong> selected orders?</p>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowBulkCancelConfirm(false)}>
                    Keep Orders
                  </Button>
                  <Button variant="destructive" onClick={confirmBulkCancel}>
                    Yes, Cancel Orders
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
                {selectedOrderForShipping && (
                  <CourierPartnerSelection
                    orderSummary={getOrderSummaryForCourier(selectedOrderForShipping)}
                    onCourierSelect={handleCourierSelect}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
    </>
  );
};

export default OrdersPage;
