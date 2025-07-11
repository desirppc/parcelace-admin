import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Truck, Package, CheckCircle, Clock, AlertCircle, XCircle, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

  const orderData = [
    {
      id: 'ORD-2024-001',
      customer: 'John Doe',
      phone: '+91 9876543210',
      amount: '₹2,450',
      status: 'Processing',
      date: '2024-01-15',
      items: 3,
      weight: '2.5 kg',
      destination: 'Mumbai, MH',
      paymentMode: 'COD',
      warehouse: 'Mumbai Warehouse'
    },
    {
      id: 'ORD-2024-002',
      customer: 'Jane Smith',
      phone: '+91 9876543211',
      amount: '₹1,890',
      status: 'Shipped',
      date: '2024-01-14',
      items: 2,
      weight: '1.8 kg',
      destination: 'Delhi, DL',
      paymentMode: 'Prepaid',
      warehouse: 'Delhi Warehouse'
    },
    {
      id: 'ORD-2024-003',
      customer: 'Mike Johnson',
      phone: '+91 9876543212',
      amount: '₹3,200',
      status: 'Delivered',
      date: '2024-01-13',
      items: 4,
      weight: '3.2 kg',
      destination: 'Bangalore, KA',
      paymentMode: 'COD',
      warehouse: 'Bangalore Warehouse'
    },
    {
      id: 'ORD-2024-004',
      customer: 'Sarah Wilson',
      phone: '+91 9876543213',
      amount: '₹1,650',
      status: 'Cancelled',
      date: '2024-01-12',
      items: 1,
      weight: '0.8 kg',
      destination: 'Chennai, TN',
      paymentMode: 'Prepaid',
      warehouse: 'Chennai Warehouse'
    },
    {
      id: 'ORD-2024-005',
      customer: 'David Brown',
      phone: '+91 9876543214',
      amount: '₹2,890',
      status: 'Processing',
      date: '2024-01-11',
      items: 3,
      weight: '2.1 kg',
      destination: 'Pune, MH',
      paymentMode: 'COD',
      warehouse: 'Mumbai Warehouse'
    },
    {
      id: 'ORD-2024-006',
      customer: 'Lisa Davis',
      phone: '+91 9876543215',
      amount: '₹4,200',
      status: 'Shipped',
      date: '2024-01-10',
      items: 5,
      weight: '4.1 kg',
      destination: 'Hyderabad, TS',
      paymentMode: 'Prepaid',
      warehouse: 'Hyderabad Warehouse'
    },
    {
      id: 'ORD-2024-007',
      customer: 'Chris Anderson',
      phone: '+91 9876543216',
      amount: '₹1,750',
      status: 'Processing',
      date: '2024-01-09',
      items: 2,
      weight: '1.5 kg',
      destination: 'Kolkata, WB',
      paymentMode: 'COD',
      warehouse: 'Kolkata Warehouse'
    },
    {
      id: 'ORD-2024-008',
      customer: 'Emma Taylor',
      phone: '+91 9876543217',
      amount: '₹3,450',
      status: 'Delivered',
      date: '2024-01-08',
      items: 4,
      weight: '3.0 kg',
      destination: 'Ahmedabad, GJ',
      paymentMode: 'Prepaid',
      warehouse: 'Ahmedabad Warehouse'
    },
    {
      id: 'ORD-2024-009',
      customer: 'Robert Miller',
      phone: '+91 9876543218',
      amount: '₹2,100',
      status: 'Processing',
      date: '2024-01-07',
      items: 2,
      weight: '1.9 kg',
      destination: 'Jaipur, RJ',
      paymentMode: 'COD',
      warehouse: 'Jaipur Warehouse'
    },
    {
      id: 'ORD-2024-010',
      customer: 'Olivia Garcia',
      phone: '+91 9876543219',
      amount: '₹2,850',
      status: 'Shipped',
      date: '2024-01-06',
      items: 3,
      weight: '2.7 kg',
      destination: 'Surat, GJ',
      paymentMode: 'Prepaid',
      warehouse: 'Surat Warehouse'
    },
    {
      id: 'ORD-2024-011',
      customer: 'William Rodriguez',
      phone: '+91 9876543220',
      amount: '₹1,950',
      status: 'Processing',
      date: '2024-01-05',
      items: 2,
      weight: '1.6 kg',
      destination: 'Lucknow, UP',
      paymentMode: 'COD',
      warehouse: 'Lucknow Warehouse'
    },
    {
      id: 'ORD-2024-012',
      customer: 'Sophia Martinez',
      phone: '+91 9876543221',
      amount: '₹3,650',
      status: 'Delivered',
      date: '2024-01-04',
      items: 4,
      weight: '3.4 kg',
      destination: 'Kanpur, UP',
      paymentMode: 'Prepaid',
      warehouse: 'Kanpur Warehouse'
    },
    {
      id: 'ORD-2024-013',
      customer: 'James Wilson',
      phone: '+91 9876543222',
      amount: '₹2,300',
      status: 'Processing',
      date: '2024-01-03',
      items: 3,
      weight: '2.2 kg',
      destination: 'Nagpur, MH',
      paymentMode: 'COD',
      warehouse: 'Nagpur Warehouse'
    },
    {
      id: 'ORD-2024-014',
      customer: 'Isabella Lopez',
      phone: '+91 9876543223',
      amount: '₹1,800',
      status: 'Shipped',
      date: '2024-01-02',
      items: 2,
      weight: '1.4 kg',
      destination: 'Indore, MP',
      paymentMode: 'Prepaid',
      warehouse: 'Indore Warehouse'
    },
    {
      id: 'ORD-2024-015',
      customer: 'Benjamin Lee',
      phone: '+91 9876543224',
      amount: '₹4,100',
      status: 'Delivered',
      date: '2024-01-01',
      items: 5,
      weight: '4.0 kg',
      destination: 'Thane, MH',
      paymentMode: 'COD',
      warehouse: 'Mumbai Warehouse'
    }
  ];

  // Filter data based on search term
  const filteredData = orderData.filter(order =>
    Object.values(order).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing': return <Clock className="w-4 h-4" />;
      case 'Shipped': return <Truck className="w-4 h-4" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Processing': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      'Shipped': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      'Delivered': 'bg-green-500/10 text-green-700 dark:text-green-400',
      'Cancelled': 'bg-red-500/10 text-red-700 dark:text-red-400'
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} flex items-center gap-1`}>
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSelection = prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedData.length) {
      setSelectedOrders([]);
      setShowBulkActions(false);
    } else {
      const allOrderIds = paginatedData.map(order => order.id);
      setSelectedOrders(allOrderIds);
      setShowBulkActions(true);
    }
  };

  const counters = [
    { label: 'Total Orders', value: '1,234', icon: Package, color: 'text-blue-600' },
    { label: 'Processing', value: '45', icon: Clock, color: 'text-yellow-600' },
    { label: 'Shipped', value: '89', icon: Truck, color: 'text-purple-600' },
    { label: 'Delivered', value: '1,100', icon: CheckCircle, color: 'text-green-600' }
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
              Prepaid Orders
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
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

              <Button className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 w-full sm:w-auto">
                <Package className="w-4 h-4 mr-2" />
                Add Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Items per page and bulk actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
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

              {/* Bulk Actions */}
              {showBulkActions && (
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Truck className="w-4 h-4 mr-1" />
                    Bulk Ship ({selectedOrders.length})
                  </Button>
                  <Button size="sm" variant="outline">
                    <XCircle className="w-4 h-4 mr-1" />
                    Bulk Cancel ({selectedOrders.length})
                  </Button>
                </div>
              )}
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
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((order) => (
                  <TableRow 
                    key={order.id}
                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 relative"
                    onMouseEnter={() => setHoveredOrder(order.id)}
                    onMouseLeave={() => setHoveredOrder(null)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.amount}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.destination}</TableCell>
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
                    {hoveredOrder === order.id && (
                      <div className="absolute left-full top-0 ml-2 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 rounded-lg shadow-xl p-4 w-80 animate-fade-in">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">{order.id}</h4>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Customer:</span>
                              <p className="font-medium text-foreground">{order.customer}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Amount:</span>
                              <p className="font-medium text-foreground">{order.amount}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Items:</span>
                              <p className="font-medium text-foreground">{order.items} items</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Weight:</span>
                              <p className="font-medium text-foreground">{order.weight}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Payment:</span>
                              <p className="font-medium text-foreground">{order.paymentMode}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Warehouse:</span>
                              <p className="font-medium text-foreground">{order.warehouse}</p>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground text-sm">Destination:</span>
                            <p className="font-medium text-foreground">{order.destination}</p>
                          </div>
                          
                          <div className="flex space-x-2 pt-2 border-t border-purple-200/30 dark:border-purple-800/30">
                            <Button size="sm" className="flex-1 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700">
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Truck className="w-3 h-3 mr-1" />
                              Track
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

export default OrdersPage;
