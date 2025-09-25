import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Truck, 
  Calendar,
  Phone,
  Mail,
  Download,
  ArrowLeft,
  Copy,
  CheckCircle,
  Clock,
  Warehouse,
  ExternalLink,
  MessageCircle,
  Tag,
  Ruler,
  Weight,
  Box,
  Share2,
  Link,
  AlertCircle,
  LifeBuoy,
  Bell,
  Edit
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OnboardingLayout from './OnboardingLayout';
import API_CONFIG from '@/config/api';

// Mock order data - in real app this would come from props or API
const mockOrder = {
  orderId: 'ORD-2024-001234',
  orderType: 'Standard',
  parcelType: 'COD',
  status: 'In Transit',
  trackingId: 'TRK789123456',
  publicTrackingUrl: 'https://track.shipfast.com/TRK789123456',
  whatsappChatUrl: 'https://wa.me/919876543210?text=Hello, I need help with order ORD-2024-001234',
  createdAt: '2024-01-15T10:30:00Z',
  estimatedDelivery: '2024-01-18T18:00:00Z',
  isDelayed: true, // Flag to indicate if shipment is delayed
  tags: ['Express', 'Fragile', 'Gift'],
  courierPartner: {
    name: 'FedEx',
    logo: '/placeholder.svg'
  },
  pickupWarehouse: {
    name: 'Delhi Hub Warehouse',
    address: '123 Industrial Area, Sector 15',
    city: 'New Delhi',
    pin: '110020',
    contact: '011-1234567'
  },
  customer: {
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@example.com',
    address: '123 Main Street, Downtown Area',
    landmark: 'Near City Mall',
    pin: '110001',
    city: 'Delhi',
    state: 'Delhi'
  },
  dimensions: {
    weight: 1.5,
    length: 25,
    width: 15,
    height: 10,
    volumetricWeight: 0.94
  },
  products: [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      quantity: 1,
      price: 2999,
      totalPrice: 2999,
      taxRate: 18,
      hsnCode: '85183000',
      image: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Phone Case',
      quantity: 2,
      price: 299,
      totalPrice: 598,
      taxRate: 18,
      hsnCode: '39269099',
      image: '/placeholder.svg'
    }
  ],
  charges: {
    productTotal: 3597,
    freight: 75,
    shipping: 50,
    cod: 25,
    tax: 647.46,
    discount: 100,
    orderTotal: 3572,
    totalCharges: 150, // freight + shipping + cod
    collectableAmount: 4219.46
  },
  tracking: [
    {
      status: 'Order Placed',
      timestamp: '2024-01-15T10:30:00Z',
      location: 'Delhi Hub',
      description: 'Order has been placed successfully',
      isCompleted: true
    },
    {
      status: 'Picked Up',
      timestamp: '2024-01-15T16:45:00Z',
      location: 'Delhi Hub',
      description: 'Package picked up from seller',
      isCompleted: true
    },
    {
      status: 'In Transit',
      timestamp: '2024-01-16T08:20:00Z',
      location: 'Mumbai Hub',
      description: 'Package is in transit to destination',
      isCompleted: false,
      isActive: true
    },
    {
      status: 'Out for Delivery',
      timestamp: null,
      location: 'Local Hub',
      description: 'Package will be out for delivery',
      isCompleted: false,
      isActive: false
    },
    {
      status: 'Delivered',
      timestamp: null,
      location: 'Customer Address',
      description: 'Package delivered successfully',
      isCompleted: false,
      isActive: false
    }
  ],
  notifications: [
    {
      type: 'whatsapp',
      event: 'Order Placed',
      timestamp: '2024-01-15T10:35:00Z',
      status: 'sent',
      message: 'Your order ORD-2024-001234 has been placed successfully!'
    },
    {
      type: 'whatsapp',
      event: 'Picked Up',
      timestamp: '2024-01-15T16:50:00Z',
      status: 'delivered',
      message: 'Great news! Your package has been picked up and is on its way.'
    },
    {
      type: 'whatsapp',
      event: 'In Transit',
      timestamp: '2024-01-16T08:25:00Z',
      status: 'delivered',
      message: 'Your package is now in transit to Mumbai Hub.'
    }
  ]
};

const ViewOrderContent = () => {
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [amount, setAmount] = useState('500');
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(mockOrder.trackingId);
    toast({
      title: "Copied to clipboard ✅",
      description: "Tracking ID has been copied to clipboard",
    });
  };

  const handleGoBack = () => {
    console.log('Go back to orders list');
  };

  const handleDownloadInvoice = () => {
    console.log('Download invoice');
  };

  const handleTrackOrder = () => {
    window.open(mockOrder.publicTrackingUrl, '_blank');
  };

  const handleWhatsAppChat = () => {
    window.open(mockOrder.whatsappChatUrl, '_blank');
  };

  const handleRaiseTicket = () => {
    console.log('Raise support ticket for order:', mockOrder.orderId);
  };

  const handleShareEmail = () => {
    const subject = `Order Update - ${mockOrder.orderId}`;
    const body = `Track your order: ${mockOrder.publicTrackingUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleShareWhatsApp = () => {
    const message = `Track your order ${mockOrder.orderId}: ${mockOrder.publicTrackingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockOrder.publicTrackingUrl);
    toast({
      title: "Link copied ✅",
      description: "Tracking link has been copied to clipboard",
    });
    setShareDialogOpen(false);
  };

  const handleEditOrder = async () => {
    try {
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login again to edit this order.",
          variant: 'destructive',
        });
        return;
      }

      // Prepare order data for editing - using the exact structure you specified
      const orderData = {
        order_type: mockOrder.orderType.toLowerCase(),
        parcel_type: mockOrder.parcelType.toLowerCase(),
        store_customer_id: null,
        store_customer_address_id: null,
        order_id: null,
        shipping_charges: 100, // You can make these editable or get from actual data
        COD_charges: 0,
        tax_amount: 100,
        discount: 0,
        order_total: 300,
        collectable_amount: 300,
        weight: mockOrder.dimensions.weight * 1000, // Convert to grams
        length: mockOrder.dimensions.length,
        width: mockOrder.dimensions.width,
        height: mockOrder.dimensions.height,
        customer_phone: mockOrder.customer.phone,
        customer_first_name: mockOrder.customer.name,
        address: mockOrder.customer.address,
        landmark: mockOrder.customer.landmark,
        customer_email: mockOrder.customer.email,
        pin_code: parseInt(mockOrder.customer.pin),
        city: mockOrder.customer.city,
        state: mockOrder.customer.state,
        products: mockOrder.products.map(product => ({
          name: product.name,
          total_price: product.totalPrice,
          quantity: product.quantity,
          sku: "",
          price: product.price,
          tax_rate: product.taxRate,
          hsn_code: product.hsnCode
        }))
      };

      // Call the edit order API
      const response = await fetch(`${API_CONFIG.BASE_URL}api/order/edit/${mockOrder.orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: "Order updated successfully!",
        });
        // You can refresh the order data here or navigate to a different page
      } else {
        toast({
          title: "Error",
          description: data?.error?.message || data?.message || 'Failed to update order.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Network Error",
        description: "Failed to update order. Please try again.",
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateOrder = async () => {
    try {
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login again to duplicate this order.",
          variant: 'destructive',
        });
        return;
      }

      // Prepare order data for creating new order - using the exact structure you specified
      const orderData = {
        order_type: mockOrder.orderType.toLowerCase(),
        parcel_type: mockOrder.parcelType.toLowerCase(),
        store_customer_id: null,
        store_customer_address_id: null,
        order_id: mockOrder.orderId, // Can be nullable - using existing order ID
        shipping_charges: 21,
        COD_charges: 0,
        tax_amount: 12,
        discount: 12,
        order_total: 300,
        collectable_amount: 0,
        weight: mockOrder.dimensions.weight * 1000, // Convert to grams
        length: mockOrder.dimensions.length,
        width: mockOrder.dimensions.width,
        height: mockOrder.dimensions.height,
        customer_phone: mockOrder.customer.phone,
        customer_first_name: mockOrder.customer.name,
        address: mockOrder.customer.address,
        landmark: mockOrder.customer.landmark,
        customer_email: mockOrder.customer.email,
        pin_code: parseInt(mockOrder.customer.pin),
        city: mockOrder.customer.city,
        state: mockOrder.customer.state,
        products: mockOrder.products.map(product => ({
          name: product.name,
          total_price: 92.0,
          quantity: 4,
          sku: "",
          price: 23.0,
          tax_rate: 23.0,
          hsn_code: 23.0
        }))
      };

      // Call the add new order API
      const response = await fetch(`${API_CONFIG.BASE_URL}api/order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: "Order duplicated successfully!",
        });
        
        // Redirect to the appropriate orders page based on order type
        const orderType = mockOrder.orderType.toLowerCase();
        if (orderType === 'cod') {
          window.location.href = 'http://localhost:8080/dashboard/orders/prepaid';
        } else if (orderType === 'reverse') {
          window.location.href = 'http://localhost:8080/dashboard/orders/reverse';
        } else {
          // Default to prepaid
          window.location.href = 'http://localhost:8080/dashboard/orders/prepaid';
        }
      } else {
        toast({
          title: "Error",
          description: data?.error?.message || data?.message || 'Failed to duplicate order.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error duplicating order:', error);
      toast({
        title: "Network Error",
        description: "Failed to duplicate order. Please try again.",
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTrackingDotColor = (event: any) => {
    if (event.isCompleted) return 'bg-green-500';
    if (event.isActive) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getNotificationStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Order Title and Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
              <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{mockOrder.orderId}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(mockOrder.status)}>
                    {mockOrder.status}
                  </Badge>
                  {mockOrder.isDelayed && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      <Clock className="h-3 w-3 mr-1" />
                      Delayed
                    </Badge>
                  )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Created {new Date(mockOrder.createdAt).toLocaleDateString()}
                  </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share Order</DialogTitle>
                    <DialogDescription>
                      Share this order tracking information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button onClick={handleShareEmail} className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Share via Email
                    </Button>
                    <Button onClick={handleShareWhatsApp} className="w-full justify-start" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Share via WhatsApp
                    </Button>
                    <Button onClick={handleCopyLink} className="w-full justify-start" variant="outline">
                      <Link className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleWhatsAppChat}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
              <Button variant="outline" size="sm" onClick={handleRaiseTicket}>
                <LifeBuoy className="h-4 w-4 mr-1" />
                Raise Ticket
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadInvoice}>
                <Download className="h-4 w-4 mr-1" />
                Invoice
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditOrder}>
                <Edit className="h-4 w-4 mr-1" />
                Edit Order
              </Button>
              <Button variant="outline" size="sm" onClick={handleDuplicateOrder}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
            </div>
          </div>
          
          {/* Prominent Estimated Delivery with Track Order CTA */}
          <div className={`p-4 rounded-lg shadow-lg ${mockOrder.isDelayed ? 'bg-gradient-to-r from-red-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">
                    {mockOrder.isDelayed ? 'Delayed Delivery' : 'Estimated Delivery'}
                  </p>
                  <p className="text-lg font-bold">
                    {new Date(mockOrder.estimatedDelivery).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={mockOrder.courierPartner.logo} 
                    alt={mockOrder.courierPartner.name}
                    className="w-8 h-8 rounded object-contain bg-white/20 p-1"
                  />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Tracking ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-white/20 px-2 py-1 rounded">
                        {mockOrder.trackingId}
                      </code>
                      <Button variant="ghost" size="sm" onClick={handleCopyTracking} className="text-white hover:bg-white/20">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button onClick={handleTrackOrder} className="bg-white text-blue-600 hover:bg-gray-100">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Track Order
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* 1. Order Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Order Type</p>
                    <p className="font-medium text-sm">{mockOrder.orderType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Parcel Type</p>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 font-semibold">
                      {mockOrder.parcelType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Products</p>
                    <p className="font-medium text-sm">{mockOrder.products.length} items</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Total Amount</p>
                    <p className="font-medium text-sm">₹{mockOrder.charges.collectableAmount}</p>
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">TAGS</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {mockOrder.tags.map((tag, index) => (
                      <Badge key={index} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 font-semibold shadow-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Customer + Warehouse Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Information */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {/* Phone Number */}
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span>{mockOrder.customer.phone}</span>
                  </div>
                  
                  {/* First Name */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{mockOrder.customer.name.split(' ')[0] || 'N/A'}</span>
                  </div>
                  
                  {/* Last Name */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{mockOrder.customer.name.split(' ').slice(1).join(' ') || 'N/A'}</span>
                  </div>
                  
                  {/* Address Line 1 */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                    <span>{mockOrder.customer.address.split(',')[0] || mockOrder.customer.address}</span>
                  </div>
                  
                  {/* Address Line 2 */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {mockOrder.customer.address.split(',').slice(1).join(',').trim() || 
                       (mockOrder.customer.landmark ? `${mockOrder.customer.landmark}` : 'N/A')}
                    </span>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="truncate text-xs">{mockOrder.customer.email}</span>
                  </div>
                  
                  {/* Pincode */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{mockOrder.customer.pin}</span>
                  </div>
                  
                  {/* City */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{mockOrder.customer.city}</span>
                  </div>
                  
                  {/* State */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{mockOrder.customer.state}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Warehouse */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    Pickup Warehouse
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div>
                    <p className="font-medium text-sm">{mockOrder.pickupWarehouse.name}</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="text-xs leading-relaxed">
                      <p>{mockOrder.pickupWarehouse.address}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {mockOrder.pickupWarehouse.city} - {mockOrder.pickupWarehouse.pin}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span>{mockOrder.pickupWarehouse.contact}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3. Enhanced Tracking with Scroll */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Tracking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-3">
                    {mockOrder.tracking.map((event, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${getTrackingDotColor(event)}`} />
                          {index < mockOrder.tracking.length - 1 && (
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{event.status}</span>
                            {event.isActive && <CheckCircle className="h-3 w-3 text-blue-500" />}
                            {event.isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{event.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {event.timestamp && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" />
                                {new Date(event.timestamp).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Products with Images */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Products ({mockOrder.products.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {mockOrder.products.map((product, index) => (
                    <div key={product.id}>
                      <div className="flex gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                            <span>Qty: {product.quantity}</span>
                            <span>₹{product.price}</span>
                            <span>Tax: {product.taxRate}%</span>
                            <span>HSN: {product.hsnCode}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">₹{product.totalPrice}</p>
                        </div>
                      </div>
                      {index < mockOrder.products.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* 4. Package Dimensions with Highlighted Volumetric Weight */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Weight className="h-3 w-3" />
                    Weight
                  </span>
                  <span className="font-medium">{mockOrder.dimensions.weight} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Ruler className="h-3 w-3" />
                    Size
                  </span>
                  <span className="font-medium text-xs">
                    {mockOrder.dimensions.length}×{mockOrder.dimensions.width}×{mockOrder.dimensions.height} cm
                  </span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800">
                  <span className="flex items-center gap-1 text-orange-700 dark:text-orange-300 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    Vol. Weight
                  </span>
                  <span className="font-bold text-orange-700 dark:text-orange-300">{mockOrder.dimensions.volumetricWeight} kg</span>
                </div>
              </CardContent>
            </Card>

            {/* 5. Charges Section - Separate from Billing */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Charges
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Freight</span>
                  <span className="font-medium">₹{mockOrder.charges.freight}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">COD Charges</span>
                  <span className="font-medium">₹{mockOrder.charges.cod}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                  <span>Total Charges</span>
                  <span>₹{mockOrder.charges.totalCharges}</span>
                </div>
              </CardContent>
            </Card>

            {/* 6. Enhanced Billing Summary */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Product Total</span>
                  <span>₹{mockOrder.charges.productTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span>₹{mockOrder.charges.shipping}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span>₹{mockOrder.charges.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-400 text-xs">₹{mockOrder.charges.discount}</span>
                    <span className="text-green-600">-₹{mockOrder.charges.discount}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base p-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-md">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{mockOrder.charges.collectableAmount}</span>
                </div>
              </CardContent>
            </Card>

            {/* 7. Notification Journey with Scroll */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {mockOrder.notifications.map((notification, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex-shrink-0">
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{notification.event}</span>
                            <Badge className={`${getNotificationStatusColor(notification.status)} text-xs`}>
                              {notification.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewOrder = () => {
  return <ViewOrderContent />;
};

export default ViewOrder;
