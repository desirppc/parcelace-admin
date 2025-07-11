
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
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [orderTypes, setOrderTypes] = useState({
    prepaid: false,
    cod: false,
    all: true
  });
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const { toast } = useToast();

  const warehouses = [
    { id: 'WH-001', name: 'Mumbai Warehouse', location: 'Mumbai, Maharashtra' },
    { id: 'WH-002', name: 'Delhi Warehouse', location: 'Delhi, NCR' },
    { id: 'WH-003', name: 'Bangalore Warehouse', location: 'Bangalore, Karnataka' },
    { id: 'WH-004', name: 'Chennai Warehouse', location: 'Chennai, Tamil Nadu' }
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

  const handleWarehouseSelect = (warehouse: any) => {
    toast({
      title: "Shipment Booked",
      description: `Order ${selectedOrder?.id} has been assigned to ${warehouse.name}`,
    });
    setShowShipModal(false);
    setSelectedOrder(null);
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
    setDateFrom(undefined);
    setDateTo(undefined);
    setOrderTypes({ prepaid: false, cod: false, all: true });
    setFilteredOrders(orders);
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(warehouseSearch.toLowerCase())
  );

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
                <label className="text-sm font-medium mb-2 block">Date From</label>
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
                <label className="text-sm font-medium mb-2 block">Date To</label>
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

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
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
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
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
                        <Button size="sm" variant="outline">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="shipped">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Shipped orders will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Pending orders will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                  onClick={() => handleWarehouseSelect(warehouse)}
                >
                  <div className="font-medium">{warehouse.name}</div>
                  <div className="text-sm text-muted-foreground">{warehouse.location}</div>
                  <div className="text-xs text-muted-foreground">{warehouse.id}</div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
