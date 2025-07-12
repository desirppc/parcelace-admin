import React, { useState } from 'react';
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
  AlertTriangle
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

// Mock order data
const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    product: 'Wireless Headphones',
    customer: 'John Smith',
    invoice: 'Prepaid',
    type: 'Standard',
    status: 'Pending'
  },
  {
    id: 'ORD-002',
    date: '2024-01-14',
    product: 'Smartphone Case',
    customer: 'Sarah Johnson',
    invoice: 'COD',
    type: 'Express',
    status: 'Shipped'
  },
  {
    id: 'ORD-003',
    date: '2024-01-13',
    product: 'Laptop Stand',
    customer: 'Mike Wilson',
    invoice: 'Prepaid',
    type: 'Standard',
    status: 'Pending'
  }
];

const OrdersPage = () => {
  const [orders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
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
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);
  const { toast } = useToast();

  const warehouses = [
    { id: 'WH-001', name: 'Mumbai Warehouse', location: 'Mumbai, Maharashtra' },
    { id: 'WH-002', name: 'Delhi Warehouse', location: 'Delhi, NCR' },
    { id: 'WH-003', name: 'Bangalore Warehouse', location: 'Bangalore, Karnataka' },
    { id: 'WH-004', name: 'Chennai Warehouse', location: 'Chennai, Tamil Nadu' }
  ];

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
    const variants = {
      'Pending': 'default',
      'Shipped': 'secondary',
      'Delivered': 'default'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your orders are being exported to Excel. Download will start shortly.",
    });
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

    toast({
      title: "Shipment Booked",
      description: `Order ${selectedOrder?.id} has been assigned to ${selectedWarehouse.name}`,
    });
    setShowShipModal(false);
    setSelectedOrder(null);
    setSelectedWarehouse(null);
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
      description: `${selectedOrders.length} orders have been assigned to ${selectedWarehouse.name}`,
    });
    setShowBulkShipModal(false);
    setSelectedOrders([]);
    setSelectedWarehouse(null);
  };

  const handleCancelOrder = (order: any) => {
    setSelectedOrder(order);
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = () => {
    toast({
      title: "Order Cancelled",
      description: `Order ${selectedOrder?.id} has been cancelled successfully.`,
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
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const applyFilters = () => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!orderTypes.all) {
      filtered = filtered.filter(order => {
        if (orderTypes.prepaid && order.invoice === 'Prepaid') return true;
        if (orderTypes.cod && order.invoice === 'COD') return true;
        return false;
      });
    }

    setFilteredOrders(filtered);
    setShowFilter(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setOrderTypes({ prepaid: false, cod: false, all: true });
    setFilteredOrders(orders);
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(warehouseSearch.toLowerCase())
  );

  const hasSelectedOrders = selectedOrders.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
          Orders Management
        </h1>
        <div className="flex items-center space-x-3">
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Customer Name" />
                <Input placeholder="Product Name" />
                <Input placeholder="Order Amount" />
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button>Add Order</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your Excel file here or click to browse
                  </p>
                  <Button variant="outline">Choose File</Button>
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample
                  </Button>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
                    <Button>Import</Button>
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

      {/* Filter Panel */}
      {showFilter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          {dateFrom ? format(dateFrom, 'PPP') : 'Select date'}
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          {dateTo ? format(dateTo, 'PPP') : 'Select date'}
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
                </>
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
              <Button onClick={applyFilters}>Apply Filters</Button>
              <Button variant="outline" onClick={resetFilters}>Reset</Button>
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
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Single Orders Table */}
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
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedOrders(filteredOrders.map(order => order.id));
                    } else {
                      setSelectedOrders([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(hasSelectedOrders ? filteredOrders.filter(order => selectedOrders.includes(order.id)) : filteredOrders).map((order) => (
              <TableRow 
                key={order.id}
                className="relative"
                onMouseEnter={() => setHoveredOrder(order.id)}
                onMouseLeave={() => setHoveredOrder(null)}
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
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <Badge variant={order.invoice === 'Prepaid' ? 'default' : 'secondary'}>
                    {order.invoice}
                  </Badge>
                </TableCell>
                <TableCell>{order.type}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleShip(order)}
                    >
                      <Ship className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCancelOrder(order)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>

                {/* Order Hover Popup */}
                {hoveredOrder === order.id && (
                  <div className="absolute left-full top-0 ml-2 z-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-purple-200/30 dark:border-purple-800/30 p-4 animate-fade-in">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-purple-600 dark:text-purple-400">{order.id}</div>
                        <Badge variant={order.invoice === 'Prepaid' ? 'default' : 'secondary'}>
                          {order.invoice}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Product:</span>
                          <span className="ml-2 font-medium">{order.product}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Customer:</span>
                          <span className="ml-2 font-medium">{order.customer}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="ml-2">{order.date}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2">{order.type}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="ml-2">{getStatusBadge(order.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Ship Modal */}
      <Dialog open={showShipModal} onOpenChange={setShowShipModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Warehouse for {selectedOrder?.id}</DialogTitle>
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
              {filteredWarehouses.map((warehouse) => (
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
                      <div className="font-medium">{warehouse.name}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.location}</div>
                      <div className="text-xs text-muted-foreground">{warehouse.id}</div>
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
              {filteredWarehouses.map((warehouse) => (
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
                      <div className="font-medium">{warehouse.name}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.location}</div>
                      <div className="text-xs text-muted-foreground">{warehouse.id}</div>
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
            <p>Are you sure you want to cancel order <strong>{selectedOrder?.id}</strong>?</p>
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
    </div>
  );
};

export default OrdersPage;
