
import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Truck, Package, CheckCircle, Clock, AlertCircle, XCircle, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ShipmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredShipment, setHoveredShipment] = useState<string | null>(null);

  const shipmentData = [
    {
      id: 'SHP-2024-001',
      awb: 'AWB123456789',
      orderId: 'ORD-2024-001',
      customer: 'John Doe',
      phone: '+91 9876543210',
      status: 'In Transit',
      courier: 'BlueDart',
      origin: 'Mumbai, MH',
      destination: 'Pune, MH',
      shipDate: '2024-01-15',
      expectedDelivery: '2024-01-17',
      weight: '2.5 kg',
      amount: '₹2,450',
      warehouse: 'Mumbai Warehouse'
    },
    {
      id: 'SHP-2024-002',
      awb: 'AWB123456790',
      orderId: 'ORD-2024-002',
      customer: 'Jane Smith',
      phone: '+91 9876543211',
      status: 'Delivered',
      courier: 'Delhivery',
      origin: 'Delhi, DL',
      destination: 'Gurgaon, HR',
      shipDate: '2024-01-14',
      expectedDelivery: '2024-01-16',
      weight: '1.8 kg',
      amount: '₹1,890',
      warehouse: 'Delhi Warehouse'
    },
    {
      id: 'SHP-2024-003',
      awb: 'AWB123456791',
      orderId: 'ORD-2024-003',
      customer: 'Mike Johnson',
      phone: '+91 9876543212',
      status: 'Delivered',
      courier: 'Ecom Express',
      origin: 'Bangalore, KA',
      destination: 'Mysore, KA',
      shipDate: '2024-01-13',
      expectedDelivery: '2024-01-15',
      weight: '3.2 kg',
      amount: '₹3,200',
      warehouse: 'Bangalore Warehouse'
    },
    {
      id: 'SHP-2024-004',
      awb: 'AWB123456792',
      orderId: 'ORD-2024-004',
      customer: 'Sarah Wilson',
      phone: '+91 9876543213',
      status: 'RTO',
      courier: 'Xpressbees',
      origin: 'Chennai, TN',
      destination: 'Coimbatore, TN',
      shipDate: '2024-01-12',
      expectedDelivery: '2024-01-14',
      weight: '0.8 kg',
      amount: '₹1,650',
      warehouse: 'Chennai Warehouse'
    },
    {
      id: 'SHP-2024-005',
      awb: 'AWB123456793',
      orderId: 'ORD-2024-005',
      customer: 'David Brown',
      phone: '+91 9876543214',
      status: 'In Transit',
      courier: 'BlueDart',
      origin: 'Mumbai, MH',
      destination: 'Nagpur, MH',
      shipDate: '2024-01-11',
      expectedDelivery: '2024-01-13',
      weight: '2.1 kg',
      amount: '₹2,890',
      warehouse: 'Mumbai Warehouse'
    },
    {
      id: 'SHP-2024-006',
      awb: 'AWB123456794',
      orderId: 'ORD-2024-006',
      customer: 'Lisa Davis',
      phone: '+91 9876543215',
      status: 'Out for Delivery',
      courier: 'Delhivery',
      origin: 'Hyderabad, TS',
      destination: 'Warangal, TS',
      shipDate: '2024-01-10',
      expectedDelivery: '2024-01-12',
      weight: '4.1 kg',
      amount: '₹4,200',
      warehouse: 'Hyderabad Warehouse'
    },
    {
      id: 'SHP-2024-007',
      awb: 'AWB123456795',
      orderId: 'ORD-2024-007',
      customer: 'Chris Anderson',
      phone: '+91 9876543216',
      status: 'In Transit',
      courier: 'Ecom Express',
      origin: 'Kolkata, WB',
      destination: 'Durgapur, WB',
      shipDate: '2024-01-09',
      expectedDelivery: '2024-01-11',
      weight: '1.5 kg',
      amount: '₹1,750',
      warehouse: 'Kolkata Warehouse'
    },
    {
      id: 'SHP-2024-008',
      awb: 'AWB123456796',
      orderId: 'ORD-2024-008',
      customer: 'Emma Taylor',
      phone: '+91 9876543217',
      status: 'Delivered',
      courier: 'Xpressbees',
      origin: 'Ahmedabad, GJ',
      destination: 'Vadodara, GJ',
      shipDate: '2024-01-08',
      expectedDelivery: '2024-01-10',
      weight: '3.0 kg',
      amount: '₹3,450',
      warehouse: 'Ahmedabad Warehouse'
    },
    {
      id: 'SHP-2024-009',
      awb: 'AWB123456797',
      orderId: 'ORD-2024-009',
      customer: 'Robert Miller',
      phone: '+91 9876543218',
      status: 'Picked Up',
      courier: 'BlueDart',
      origin: 'Jaipur, RJ',
      destination: 'Udaipur, RJ',
      shipDate: '2024-01-07',
      expectedDelivery: '2024-01-09',
      weight: '1.9 kg',
      amount: '₹2,100',
      warehouse: 'Jaipur Warehouse'
    },
    {
      id: 'SHP-2024-010',
      awb: 'AWB123456798',
      orderId: 'ORD-2024-010',
      customer: 'Olivia Garcia',
      phone: '+91 9876543219',
      status: 'In Transit',
      courier: 'Delhivery',
      origin: 'Surat, GJ',
      destination: 'Rajkot, GJ',
      shipDate: '2024-01-06',
      expectedDelivery: '2024-01-08',
      weight: '2.7 kg',
      amount: '₹2,850',
      warehouse: 'Surat Warehouse'
    },
    {
      id: 'SHP-2024-011',
      awb: 'AWB123456799',
      orderId: 'ORD-2024-011',
      customer: 'William Rodriguez',
      phone: '+91 9876543220',
      status: 'Out for Delivery',
      courier: 'Ecom Express',
      origin: 'Lucknow, UP',
      destination: 'Kanpur, UP',
      shipDate: '2024-01-05',
      expectedDelivery: '2024-01-07',
      weight: '1.6 kg',
      amount: '₹1,950',
      warehouse: 'Lucknow Warehouse'
    },
    {
      id: 'SHP-2024-012',
      awb: 'AWB123456800',
      orderId: 'ORD-2024-012',
      customer: 'Sophia Martinez',
      phone: '+91 9876543221',
      status: 'Delivered',
      courier: 'Xpressbees',
      origin: 'Kanpur, UP',
      destination: 'Allahabad, UP',
      shipDate: '2024-01-04',
      expectedDelivery: '2024-01-06',
      weight: '3.4 kg',
      amount: '₹3,650',
      warehouse: 'Kanpur Warehouse'
    },
    {
      id: 'SHP-2024-013',
      awb: 'AWB123456801',
      orderId: 'ORD-2024-013',
      customer: 'James Wilson',
      phone: '+91 9876543222',
      status: 'Picked Up',
      courier: 'BlueDart',
      origin: 'Nagpur, MH',
      destination: 'Aurangabad, MH',
      shipDate: '2024-01-03',
      expectedDelivery: '2024-01-05',
      weight: '2.2 kg',
      amount: '₹2,300',
      warehouse: 'Nagpur Warehouse'
    },
    {
      id: 'SHP-2024-014',
      awb: 'AWB123456802',
      orderId: 'ORD-2024-014',
      customer: 'Isabella Lopez',
      phone: '+91 9876543223',
      status: 'In Transit',
      courier: 'Delhivery',
      origin: 'Indore, MP',
      destination: 'Bhopal, MP',
      shipDate: '2024-01-02',
      expectedDelivery: '2024-01-04',
      weight: '1.4 kg',
      amount: '₹1,800',
      warehouse: 'Indore Warehouse'
    },
    {
      id: 'SHP-2024-015',
      awb: 'AWB123456803',
      orderId: 'ORD-2024-015',
      customer: 'Benjamin Lee',
      phone: '+91 9876543224',
      status: 'Delivered',
      courier: 'Ecom Express',
      origin: 'Thane, MH',
      destination: 'Kalyan, MH',
      shipDate: '2024-01-01',
      expectedDelivery: '2024-01-03',
      weight: '4.0 kg',
      amount: '₹4,100',
      warehouse: 'Mumbai Warehouse'
    }
  ];

  // Filter data based on search term
  const filteredData = shipmentData.filter(shipment =>
    Object.values(shipment).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Picked Up': return <Package className="w-4 h-4" />;
      case 'In Transit': return <Truck className="w-4 h-4" />;
      case 'Out for Delivery': return <Clock className="w-4 h-4" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'RTO': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Picked Up': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      'In Transit': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      'Out for Delivery': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      'Delivered': 'bg-green-500/10 text-green-700 dark:text-green-400',
      'RTO': 'bg-red-500/10 text-red-700 dark:text-red-400'
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} flex items-center gap-1`}>
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const counters = [
    { label: 'Total Shipments', value: '1,234', icon: Package, color: 'text-blue-600' },
    { label: 'In Transit', value: '156', icon: Truck, color: 'text-purple-600' },
    { label: 'Out for Delivery', value: '23', icon: Clock, color: 'text-yellow-600' },
    { label: 'Delivered', value: '1,055', icon: CheckCircle, color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Counter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {counters.map((counter, index) => {
          const IconComponent = counter.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{counter.label}</p>
                    <p className="text-2xl font-bold text-foreground">{counter.value}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
              Shipments
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Items per page selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-input bg-background rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>AWB Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((shipment) => (
                  <TableRow 
                    key={shipment.id}
                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 relative"
                    onMouseEnter={() => setHoveredShipment(shipment.id)}
                    onMouseLeave={() => setHoveredShipment(null)}
                  >
                    <TableCell className="font-mono text-sm">{shipment.id}</TableCell>
                    <TableCell className="font-mono text-sm">{shipment.awb}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{shipment.customer}</div>
                        <div className="text-sm text-muted-foreground">{shipment.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell>{shipment.courier}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{shipment.origin}</div>
                        <div className="text-muted-foreground">↓</div>
                        <div>{shipment.destination}</div>
                      </div>
                    </TableCell>
                    <TableCell>{shipment.expectedDelivery}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* Hover popup */}
                    {hoveredShipment === shipment.id && (
                      <div className="absolute left-full top-0 ml-2 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 rounded-lg shadow-xl p-4 w-80 animate-fade-in">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{shipment.id}</h4>
                            {getStatusBadge(shipment.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Order ID:</span>
                              <p className="font-medium text-foreground font-mono">{shipment.orderId}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">AWB:</span>
                              <p className="font-medium text-foreground font-mono">{shipment.awb}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Customer:</span>
                              <p className="font-medium text-foreground">{shipment.customer}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <p className="font-medium text-foreground">{shipment.amount}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Weight:</span>
                              <p className="font-medium text-foreground">{shipment.weight}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Courier:</span>
                              <p className="font-medium text-foreground">{shipment.courier}</p>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground text-sm">Route:</span>
                            <p className="font-medium text-foreground">{shipment.origin} → {shipment.destination}</p>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground text-sm">Expected Delivery:</span>
                            <p className="font-medium text-foreground">{shipment.expectedDelivery}</p>
                          </div>
                          
                          <div className="flex space-x-2 pt-2 border-t border-purple-200/30 dark:border-purple-800/30">
                            <Button size="sm" className="flex-1 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700">
                              <Eye className="w-3 h-3 mr-1" />
                              Track
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Package className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentPage;
