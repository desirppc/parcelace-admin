import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  DollarSign,
  Users,
  BarChart3,
  Download,
  Eye,
  Clock,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import OnboardingLayout from '@/components/OnboardingLayout';

const DailyReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState('overview');

  const dailyMetrics = {
    totalOrders: 156,
    totalShipments: 142,
    totalRevenue: 284750,
    activeUsers: 89,
    orderGrowth: 12.5,
    shipmentGrowth: 8.3,
    revenueGrowth: 15.2,
    userGrowth: 5.8
  };

  const orderStatusBreakdown = [
    { status: 'Pending', count: 45, percentage: 28.8, color: 'bg-blue-500' },
    { status: 'Processing', count: 32, percentage: 20.5, color: 'bg-yellow-500' },
    { status: 'Shipped', count: 58, percentage: 37.2, color: 'bg-green-500' },
    { status: 'Delivered', count: 18, percentage: 11.5, color: 'bg-purple-500' },
    { status: 'Cancelled', count: 3, percentage: 1.9, color: 'bg-red-500' }
  ];

  const shipmentStatusBreakdown = [
    { status: 'Pickup Pending', count: 23, percentage: 16.2, color: 'bg-orange-500' },
    { status: 'In Transit', count: 67, percentage: 47.2, color: 'bg-blue-500' },
    { status: 'Out for Delivery', count: 28, percentage: 19.7, color: 'bg-yellow-500' },
    { status: 'Delivered', count: 18, percentage: 12.7, color: 'bg-green-500' },
    { status: 'NDR', count: 4, percentage: 2.8, color: 'bg-red-500' },
    { status: 'RTO', count: 2, percentage: 1.4, color: 'bg-gray-500' }
  ];

  const topPerformingCities = [
    { city: 'Mumbai', orders: 28, shipments: 25, revenue: 45600 },
    { city: 'Delhi', orders: 24, shipments: 22, revenue: 38900 },
    { city: 'Bangalore', orders: 22, shipments: 20, revenue: 35200 },
    { city: 'Chennai', orders: 19, shipments: 17, revenue: 29800 },
    { city: 'Hyderabad', orders: 18, shipments: 16, revenue: 27500 }
  ];

  const courierPerformance = [
    { courier: 'DTDC Express', shipments: 45, successRate: 94.2, avgDelivery: '2.3 days' },
    { courier: 'Blue Dart', shipments: 38, successRate: 96.8, avgDelivery: '1.8 days' },
    { courier: 'FedEx', shipments: 32, successRate: 92.1, avgDelivery: '2.1 days' },
    { courier: 'Aramex', shipments: 27, successRate: 89.7, avgDelivery: '2.5 days' }
  ];

  const recentOrders = [
    { id: 'ORD001', customer: 'Rahul Sharma', amount: 1250, status: 'Pending', time: '2 hours ago' },
    { id: 'ORD002', customer: 'Priya Patel', amount: 890, status: 'Processing', time: '4 hours ago' },
    { id: 'ORD003', customer: 'Amit Kumar', amount: 2100, status: 'Shipped', time: '6 hours ago' },
    { id: 'ORD004', customer: 'Neha Singh', amount: 750, status: 'Delivered', time: '8 hours ago' },
    { id: 'ORD005', customer: 'Vikram Mehta', amount: 1650, status: 'In Transit', time: '10 hours ago' }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Pending': 'bg-blue-100 text-blue-800 border-blue-200',
      'Processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Shipped': 'bg-green-100 text-green-800 border-green-200',
      'Delivered': 'bg-purple-100 text-purple-800 border-purple-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'In Transit': 'bg-blue-100 text-blue-800 border-blue-200',
      'Out for Delivery': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'NDR': 'bg-red-100 text-red-800 border-red-200',
      'RTO': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return <Badge className={variants[status] || 'bg-gray-100 text-gray-800 border-gray-200'}>{status}</Badge>;
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting daily report...');
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) setSelectedDate(date);
  };

  return (
    <OnboardingLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive overview of daily operations and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus />
              </PopoverContent>
            </Popover>
            <Button onClick={handleExport} className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{dailyMetrics.totalOrders}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{dailyMetrics.orderGrowth}% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Shipments</CardTitle>
              <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{dailyMetrics.totalShipments}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{dailyMetrics.shipmentGrowth}% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">₹{dailyMetrics.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{dailyMetrics.revenueGrowth}% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Users</CardTitle>
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{dailyMetrics.activeUsers}</div>
              <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{dailyMetrics.userGrowth}% from yesterday
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={reportType} onValueChange={setReportType} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Order Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderStatusBreakdown.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium">{item.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.count}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipment Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shipmentStatusBreakdown.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium">{item.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.count}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Top Performing Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Shipments</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformingCities.map((city) => (
                      <TableRow key={city.city}>
                        <TableCell className="font-medium">{city.city}</TableCell>
                        <TableCell>{city.orders}</TableCell>
                        <TableCell>{city.shipments}</TableCell>
                        <TableCell>₹{city.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>₹{order.amount}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {order.time}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Courier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Courier Partner</TableHead>
                      <TableHead>Shipments</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Avg Delivery Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courierPerformance.map((courier) => (
                      <TableRow key={courier.courier}>
                        <TableCell className="font-medium">{courier.courier}</TableCell>
                        <TableCell>{courier.shipments}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {courier.successRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>{courier.avgDelivery}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Order Fulfillment Rate</span>
                      <span className="text-lg font-bold text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Order Value</span>
                      <span className="text-lg font-bold text-blue-600">₹1,825</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-lg font-bold text-purple-600">4.6/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Week-over-Week Growth</span>
                      <span className="text-lg font-bold text-green-600">+8.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Month-over-Month Growth</span>
                      <span className="text-lg font-bold text-blue-600">+12.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Year-over-Year Growth</span>
                      <span className="text-lg font-bold text-purple-600">+28.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Analytics Dashboard</p>
                  <p className="text-sm">Detailed charts and analytics will be displayed here</p>
                  <p className="text-xs mt-2">Coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OnboardingLayout>
  );
};

export default DailyReport;


