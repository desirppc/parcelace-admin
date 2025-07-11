
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileText,
  Eye,
  Copy,
  RotateCcw,
  X,
  Package,
  Truck,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Generate 40 dummy shipment records
const generateShipmentData = () => {
  const courierPartners = ['BlueDart', 'DTDC', 'Delhivery', 'Ecom Express', 'Xpressbees'];
  const statuses = ['In Transit', 'Out for Delivery', 'Delivered', 'RTO'];
  const products = ['Wireless Headphones', 'Smartphone Case', 'Laptop Stand', 'USB Cable', 'Bluetooth Speaker'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];
  
  return Array.from({ length: 40 }, (_, i) => {
    const orderId = `ORD-${String(i + 1).padStart(3, '0')}`;
    const trackingId = `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const courier = courierPartners[Math.floor(Math.random() * courierPartners.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const amount = Math.floor(Math.random() * 5000) + 500;
    const weight = (Math.random() * 2 + 0.1).toFixed(1);
    const dimensions = `${Math.floor(Math.random() * 20 + 10)}x${Math.floor(Math.random() * 20 + 10)}x${Math.floor(Math.random() * 20 + 10)}`;
    
    return {
      id: orderId,
      trackingNumber: trackingId,
      courierPartner: courier,
      bookingDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      orderNumber: orderId,
      productName: product,
      quantity: Math.floor(Math.random() * 3) + 1,
      dimensions,
      weight: `${weight} KG`,
      status,
      deliveryDate: status === 'Delivered' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toLocaleDateString() : '-',
      orderAmount: `₹${amount}`,
      paymentType: Math.random() > 0.5 ? 'Prepaid' : 'COD',
      pickupWarehouse: `${city} Warehouse`,
      deliveryAddress: `${city}, ${Math.random() > 0.5 ? 'Maharashtra' : 'Karnataka'}`
    };
  });
};

const ShipmentPage = () => {
  const [shipments] = useState(generateShipmentData());
  const [filteredShipments, setFilteredShipments] = useState(shipments);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const variants = {
      'In Transit': 'default',
      'Out for Delivery': 'secondary',
      'Delivered': 'default',
      'RTO': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
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
      setSelectedShipments(paginatedShipments.map(shipment => shipment.id));
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
      title: "Shipping Labels Generated",
      description: `Generated labels for ${selectedShipments.length} shipments`,
    });
  };

  const handleAction = (action: string, shipmentId: string) => {
    toast({
      title: `${action} Action`,
      description: `${action} performed for shipment ${shipmentId}`,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = shipments.filter(shipment =>
      shipment.trackingNumber.toLowerCase().includes(value.toLowerCase()) ||
      shipment.orderNumber.toLowerCase().includes(value.toLowerCase()) ||
      shipment.productName.toLowerCase().includes(value.toLowerCase()) ||
      shipment.courierPartner.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredShipments(filtered);
    setCurrentPage(1);
  };

  const filterByStatus = (status: string) => {
    if (status === 'all') {
      setFilteredShipments(shipments);
    } else if (status === 'ofd') {
      setFilteredShipments(shipments.filter(s => s.status === 'Out for Delivery'));
    } else {
      setFilteredShipments(shipments.filter(s => s.status.toLowerCase().replace(' ', '-') === status));
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
          Shipment Tracking
        </h1>
        <div className="flex items-center space-x-3">
          {selectedShipments.length > 0 && (
            <Button 
              onClick={handleBulkShippingLabel}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Bulk Shipping Label ({selectedShipments.length})
            </Button>
          )}
          
          <Button variant="outline" onClick={() => handleAction('Export', 'all')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by tracking number, order, or product..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Filter options will be implemented here</p>
          </CardContent>
        </Card>
      )}

      {/* Shipment Tabs */}
      <Tabs defaultValue="all" onValueChange={filterByStatus}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="ofd">OFD</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="rto">RTO</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
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
                  <TableHead>Status | Date of Delivery</TableHead>
                  <TableHead>Dimensions (CM) | Weight (KG)</TableHead>
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
                        <div className="font-medium">{shipment.trackingNumber}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Truck className="w-3 h-3 mr-1" />
                          {shipment.courierPartner}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {shipment.bookingDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{shipment.orderNumber}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          {shipment.productName}
                        </div>
                        <div className="text-xs text-muted-foreground">Qty: {shipment.quantity}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(shipment.status)}
                        <div className="text-xs text-muted-foreground">
                          {shipment.deliveryDate !== '-' ? shipment.deliveryDate : 'Pending'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{shipment.dimensions}</div>
                        <div className="text-sm font-medium">{shipment.weight}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{shipment.orderAmount}</div>
                        <Badge variant={shipment.paymentType === 'Prepaid' ? 'default' : 'secondary'} className="text-xs">
                          {shipment.paymentType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {shipment.pickupWarehouse}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          To: {shipment.deliveryAddress}
                        </div>
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredShipments.length)} of {filteredShipments.length} results
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
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
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

        <TabsContent value="in-transit">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">In Transit shipments will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ofd">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Out for Delivery shipments will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Delivered shipments will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rto">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">RTO shipments will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShipmentPage;
