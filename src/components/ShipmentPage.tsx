import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Ship,
  Eye,
  Copy,
  RotateCcw,
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Mock shipment data
const mockShipments = Array.from({ length: 40 }, (_, index) => {
  const statuses = ['In Transit', 'OFD', 'Delivered', 'RTO'];
  const couriers = ['BlueDart', 'Delhivery', 'DTDC', 'FedEx', 'Aramex'];
  const products = ['Wireless Headphones', 'Smartphone Case', 'Laptop Stand', 'USB Cable', 'Power Bank'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];
  
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const courier = couriers[Math.floor(Math.random() * couriers.length)];
  const product = products[Math.floor(Math.random() * products.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return {
    id: `SHP-${String(index + 1).padStart(3, '0')}`,
    trackingNumber: `${courier.substring(0, 2).toUpperCase()}${Math.random().toString().substring(2, 10)}`,
    courierPartner: courier,
    bookingDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString(),
    orderNumber: `ORD-${String(index + 1).padStart(3, '0')}`,
    productName: product,
    quantity: Math.floor(Math.random() * 5) + 1,
    dimensions: `${Math.floor(Math.random() * 20) + 10}x${Math.floor(Math.random() * 20) + 10}x${Math.floor(Math.random() * 20) + 10}`,
    weight: `${(Math.random() * 2 + 0.1).toFixed(1)} KG`,
    status: status,
    deliveryDate: status === 'Delivered' ? `${Math.floor(Math.random() * 30) + 1} June` : null,
    orderAmount: Math.floor(Math.random() * 5000) + 500,
    paymentType: Math.random() > 0.5 ? 'Prepaid' : 'COD',
    pickupWarehouse: `${city} Warehouse`,
    deliveryAddress: `${Math.floor(Math.random() * 999) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}, ${city}`
  };
});

const ShipmentPage = () => {
  const [shipments] = useState(mockShipments);
  const [filteredShipments, setFilteredShipments] = useState(mockShipments);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const getStatusBadge = (status, deliveryDate) => {
    const variants = {
      'In Transit': { variant: 'secondary', icon: Truck, color: 'text-blue-600' },
      'OFD': { variant: 'default', icon: Package, color: 'text-orange-600' },
      'Delivered': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'RTO': { variant: 'destructive', icon: AlertCircle, color: 'text-red-600' }
    };
    
    const config = variants[status] || variants['In Transit'];
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-2">
        <Badge variant={config.variant} className="flex items-center space-x-1">
          <IconComponent className="w-3 h-3" />
          <span>{status}</span>
        </Badge>
        {deliveryDate && (
          <span className="text-xs text-muted-foreground">{deliveryDate}</span>
        )}
      </div>
    );
  };

  const handleSelectShipment = (shipmentId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedShipments(prev => [...prev, shipmentId]);
    } else {
      setSelectedShipments(prev => prev.filter(id => id !== shipmentId));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedShipments(currentShipments.map(shipment => shipment.id));
    } else {
      setSelectedShipments([]);
    }
  };

  const handleBulkShippingLabel = () => {
    if (selectedShipments.length === 0) {
      toast({
        title: "No Shipments Selected",
        description: "Please select shipments to generate labels.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Bulk Shipping Labels Generated",
      description: `Generated shipping labels for ${selectedShipments.length} shipments.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Shipment data is being exported to Excel.",
    });
  };

  const handleAction = (action: string, shipmentId: string) => {
    toast({
      title: `${action} Action`,
      description: `${action} performed for shipment ${shipmentId}`,
    });
  };

  // Filter shipments based on active tab
  const getFilteredShipments = () => {
    let filtered = shipments;
    
    if (activeTab !== 'all') {
      const statusMap = {
        'in-transit': 'In Transit',
        'ofd': 'OFD',
        'delivered': 'Delivered',
        'rto': 'RTO'
      };
      filtered = filtered.filter(shipment => shipment.status === statusMap[activeTab]);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.courierPartner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const currentShipments = getFilteredShipments();
  const totalPages = Math.ceil(currentShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedShipments = currentShipments.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
          Shipment Tracking
        </h1>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleBulkShippingLabel}
            className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
          >
            <Ship className="w-4 h-4 mr-2" />
            Bulk Shipping Label
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking number, order ID, courier..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Shipment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="ofd">OFD</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="rto">RTO</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedShipments.length === paginatedShipments.length && paginatedShipments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Tracking Details</TableHead>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Dimensions | Weight</TableHead>
                  <TableHead>Status | Date of Delivery</TableHead>
                  <TableHead>Order Amount</TableHead>
                  <TableHead>Address Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedShipments.includes(shipment.id)}
                        onCheckedChange={(checked) => handleSelectShipment(shipment.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{shipment.trackingNumber}</div>
                        <div className="text-xs text-muted-foreground">{shipment.courierPartner}</div>
                        <div className="text-xs text-muted-foreground">{shipment.bookingDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{shipment.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">{shipment.productName}</div>
                        <div className="text-xs text-muted-foreground">Qty: {shipment.quantity}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{shipment.dimensions}</div>
                        <div className="text-xs text-muted-foreground">{shipment.weight}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(shipment.status, shipment.deliveryDate)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">₹{shipment.orderAmount}</div>
                        <Badge variant={shipment.paymentType === 'Prepaid' ? 'default' : 'secondary'} className="text-xs">
                          {shipment.paymentType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-xs">
                        <div className="text-xs font-medium">{shipment.pickupWarehouse}</div>
                        <div className="text-xs text-muted-foreground">{shipment.deliveryAddress}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction('Cancel', shipment.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction('Download Label', shipment.id)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction('View', shipment.id)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction('Duplicate', shipment.id)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction('Return', shipment.id)}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, currentShipments.length)} of {currentShipments.length} shipments
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShipmentPage;