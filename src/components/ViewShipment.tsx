import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Ruler,
  Weight,
  Box,
  Share2,
  Link,
  AlertCircle,
  LifeBuoy,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { shipmentService } from '@/services/shipmentService';

const ViewShipment = () => {
  const { awb } = useParams<{ awb: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [regeneratingPickup, setRegeneratingPickup] = useState(false);
  const [downloadingLabel, setDownloadingLabel] = useState(false);

  // Helper function to calculate volumetric weight
  const calculateVolumetricWeight = (length: number, width: number, height: number) => {
    // Validate inputs and ensure they are positive numbers
    const l = Math.max(0, parseFloat(length.toString()) || 0);
    const w = Math.max(0, parseFloat(width.toString()) || 0);
    const h = Math.max(0, parseFloat(height.toString()) || 0);
    return (l * w * h) / 4000;
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0.00';
    }
    return `₹${amount.toFixed(2)}`;
  };

  // Load shipment data from API
  useEffect(() => {
    if (!awb) {
      setError('AWB is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchShipmentData = async () => {
      try {
        const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (!authToken) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        // Call the real-time shipments API
        const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/${awb}/view-web`;
        console.log('Fetching shipment data from:', apiUrl);
        console.log('AWB from URL params:', awb);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.status && data.data) {
          console.log('Shipment data received:', data);
          setShipmentData(data);
        } else {
          setError(data?.message || 'Failed to fetch shipment data');
          toast({
            title: 'Error',
            description: data?.message || 'Failed to fetch shipment data',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching shipment data:', error);
        setError('Network error occurred');
        toast({
          title: 'Network Error',
          description: 'Failed to fetch shipment data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentData();
  }, [awb, toast]);

  // Call tracking API once when page opens (using sessionStorage to prevent infinite loops)
  useEffect(() => {
    if (!awb) {
      return;
    }

    // Check if we've already called the tracking API for this AWB in this session
    const trackingApiKey = `tracking_api_called_${awb}`;
    const hasCalledTracking = sessionStorage.getItem(trackingApiKey);
    
    if (hasCalledTracking) {
      console.log('Tracking API already called for this AWB in this session, skipping...');
      return;
    }

    const callTrackingAPI = async () => {
      try {
        const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (!authToken) {
          console.warn('No auth token found for tracking API call');
          return;
        }

        // Mark as called immediately to prevent duplicate calls
        sessionStorage.setItem(trackingApiKey, 'true');
        
        const trackingUrl = `https://parcelace.in/api/shipment-tracking/${awb}`;
        console.log('Calling tracking API:', trackingUrl);
        
        const response = await fetch(trackingUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Tracking API response:', data);
        
        // Reload the page after successful API call (only once per session)
        if (response.ok) {
          // Use a flag to prevent reload loop - check if we're already reloading
          const reloadKey = `tracking_reload_${awb}`;
          if (!sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, 'true');
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error calling tracking API:', error);
        // Keep the flag set even on error to prevent retries
      }
    };

    callTrackingAPI();
  }, [awb]);

  // Use API data only - no mock data
  if (!shipmentData?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate('/dashboard/prepaid-shipments')}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Shipments
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shipment Not Found</h1>
              <p className="text-gray-600 mt-1">Shipment #{awb}</p>
            </div>
          </div>
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-gray-500 text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shipment Data Available</h2>
                <p className="text-gray-600 mb-6">Unable to load shipment information. Please try again later.</p>
                <Button variant="outline" onClick={() => navigate('/dashboard/prepaid-shipments')}>
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const shipment = {
    orderId: shipmentData.data.order_details?.awb || awb || '',
    orderType: shipmentData.data.order_details?.shipment_mod || '',
    parcelType: shipmentData.data.order_details?.parcel_type || '',
    status: shipmentData.data.order_details?.shipment_status || '',
    trackingId: shipmentData.data.order_details?.awb || awb || '',
    publicTrackingUrl: `http://localhost:8080/tracking/${shipmentData.data.order_details?.awb || awb || ''}`,
    createdAt: shipmentData.data.order_details?.sync_date || '',
    estimatedDelivery: shipmentData.data.order_details?.estimated_delivery_date || '',
    isDelayed: false,
    tags: [],
    courierPartner: {
      name: shipmentData.data.order_details?.delivery_partner || null,
      logo: null
    },
    pickupWarehouse: {
      name: shipmentData.data.warehouse_details?.warehouse_name || null,
      address: shipmentData.data.warehouse_details?.address || null,
      city: shipmentData.data.warehouse_details?.city || null,
      pin: shipmentData.data.warehouse_details?.pincode || null,
      contact: shipmentData.data.warehouse_details?.mobile_number || null,
      warehouseCode: shipmentData.data.warehouse_details?.warehouse_code || null,
      firstName: shipmentData.data.warehouse_details?.first_name || null,
      lastName: shipmentData.data.warehouse_details?.last_name || null,
      whatsappNumber: shipmentData.data.warehouse_details?.whatsapp_number || null,
      alternativeMobile: shipmentData.data.warehouse_details?.alternative_mobile_number || null
    },
    customer: {
      name: `${shipmentData.data.customer_details?.shipping_first_name || ''} ${shipmentData.data.customer_details?.shipping_last_name || ''}`.trim() || null,
      phone: shipmentData.data.customer_details?.shipping_phone || null,
      email: shipmentData.data.customer_details?.shipping_email || null,
      address: `${shipmentData.data.customer_details?.shipping_address1 || ''} ${shipmentData.data.customer_details?.shipping_address2 || ''}`.trim() || null,
      landmark: null, // Not available in API
      pin: shipmentData.data.customer_details?.shipping_zipcode || null,
      city: shipmentData.data.customer_details?.shipping_city || null,
      state: null, // Not available in API
      storeOrderId: shipmentData.data.customer_details?.store_order_id || null
    },
    dimensions: {
      weight: parseFloat(shipmentData.data.order_details?.weight || '0'),
      length: parseFloat(shipmentData.data.order_details?.length || '0'),
      width: parseFloat(shipmentData.data.order_details?.width || '0'),
      height: parseFloat(shipmentData.data.order_details?.height || '0'),
      volumetricWeight: calculateVolumetricWeight(
        parseFloat(shipmentData.data.order_details?.length || '0'),
        parseFloat(shipmentData.data.order_details?.width || '0'),
        parseFloat(shipmentData.data.order_details?.height || '0')
      )
    },
    products: shipmentData.data.product_details?.length > 0 ? shipmentData.data.product_details.map((product: any, index: number) => ({
      id: product.id || (index + 1).toString(),
      name: product.name || 'Product ' + (index + 1),
      quantity: product.quantity || 1,
      price: parseFloat(product.price) || 0,
      totalPrice: parseFloat(product.total_price) || 0,
      sku: product.sku || null,
      taxRate: parseFloat(product.tax_rate) || 0,
      totalTax: parseFloat(product.total_tax) || 0,
      hsnCode: product.hsn_code || null,
      storeOrderId: product.store_order_id || null,
      image: '/placeholder.svg'
    })) : [],
    charges: {
      productTotal: parseFloat(shipmentData.data.order_details?.total || '0'),
      freight: parseFloat(shipmentData.data.order_details?.freight || '0'),
      shipping: parseFloat(shipmentData.data.order_details?.shipping || '0'),
      cod: parseFloat(shipmentData.data.order_details?.cod_charges || '0'),
      tax: parseFloat(shipmentData.data.order_details?.total_tax || '0'),
      discount: parseFloat(shipmentData.data.order_details?.total_discount || '0'),
      orderTotal: parseFloat(shipmentData.data.order_details?.total || '0'),
      totalCharges: parseFloat(shipmentData.data.order_details?.freight || '0') + parseFloat(shipmentData.data.order_details?.cod_charges || '0'),
      collectableAmount: parseFloat(shipmentData.data.order_details?.collectable_amount || shipmentData.data.order_details?.total || '0')
    },
    tracking: shipmentData.data.trakings_details?.length > 0 ? shipmentData.data.trakings_details.map((tracking: any, index: number) => ({
      status: tracking.status || 'Status Update',
      timestamp: tracking.status_time || null,
      location: tracking.location || 'Unknown Location',
      description: tracking.instructions || 'Package status updated',
      isCompleted: index === 0,
      isActive: index === 0
    })) : [],
    notifications: []
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(shipment.trackingId);
    toast({
      title: "Copied to clipboard ✅",
      description: "Tracking ID has been copied to clipboard",
    });
  };

  const handleGoBack = () => {
    navigate('/dashboard/prepaid-shipments');
  };

  const handleDownloadInvoice = async () => {
    if (!awb) {
      toast({
        title: "Error",
        description: "AWB number is required to download invoice.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await shipmentService.downloadInvoice([awb]);
      if (result.success) {
        toast({
          title: "Success",
          description: "Invoice downloaded successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to download invoice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download invoice error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const handleRegeneratePickup = async () => {
    if (!awb) {
      toast({
        title: "Invalid AWB",
        description: "AWB number is required to regenerate pickup.",
        variant: "destructive",
      });
      return;
    }

    setRegeneratingPickup(true);
    
    try {
      const result = await shipmentService.regeneratePickup(awb);
      
      toast({
        title: result.success ? "Pickup Request" : "Pickup Request Failed",
        description: result.message || "Pickup request processed",
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Regenerate pickup error:', error);
      toast({
        title: "Pickup Request Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegeneratingPickup(false);
    }
  };

  const handleDownloadShippingLabel = async () => {
    if (!awb) {
      toast({
        title: "No AWB Selected",
        description: "AWB number is required to download shipping label.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingLabel(true);
    
    try {
      const result = await shipmentService.downloadShippingLabels([awb]);
      
      if (result.success) {
        toast({
          title: "Downloading Labels",
          description: "Shipping label download started",
        });
      } else {
        toast({
          title: "Download Failed",
          description: result.error || "Failed to download shipping labels. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download shipping label error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingLabel(false);
    }
  };

  const handleTrackOrder = () => {
    window.open(shipment.publicTrackingUrl, '_blank');
  };



  const handleRaiseTicket = () => {
    console.log('Raise support ticket for shipment:', shipment.orderId);
  };

  const handleShareEmail = () => {
    const subject = `Shipment Update - ${shipment.orderId}`;
    const body = `Track your shipment: ${shipment.publicTrackingUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };



  const handleCopyLink = () => {
    navigator.clipboard.writeText(shipment.publicTrackingUrl);
    toast({
      title: "Link copied ✅",
      description: "Tracking link has been copied to clipboard",
    });
    setShareDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrackingDotColor = (event: any) => {
    if (event.isCompleted) return 'bg-green-500';
    if (event.isActive) return 'bg-blue-500';
    return 'bg-gray-300';
  };



  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Shipments
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loading Shipment...</h1>
              <p className="text-gray-600 mt-1">Please wait while we fetch the shipment data</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Shipments
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Error Loading Shipment</h1>
              <p className="text-gray-600 mt-1">Shipment #{awb}</p>
            </div>
          </div>
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Shipment</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={handleGoBack}>
                    Go Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Shipment Title and Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shipment #{shipment.trackingId}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(shipment.status)}>
                  {shipment.status}
                </Badge>
                {shipment.isDelayed && (
                  <Badge className="bg-red-100 text-red-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Delayed
                  </Badge>
                )}
                <span className="text-sm text-gray-600">
                  {shipment.createdAt ? `Created ${new Date(shipment.createdAt).toLocaleDateString()}` : ''}
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
                    <DialogTitle>Share Shipment</DialogTitle>
                    <DialogDescription>
                      Share this shipment tracking information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button onClick={handleShareEmail} className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Share via Email
                    </Button>

                    <Button onClick={handleCopyLink} className="w-full justify-start" variant="outline">
                      <Link className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRegeneratePickup}
                disabled={regeneratingPickup}
              >
                {regeneratingPickup ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Regenerate Pickup
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadShippingLabel}
                disabled={downloadingLabel}
              >
                {downloadingLabel ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Download Label
              </Button>
              <Button variant="outline" size="sm" onClick={handleRaiseTicket}>
                <LifeBuoy className="h-4 w-4 mr-1" />
                Raise Ticket
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadInvoice}>
                <Download className="h-4 w-4 mr-1" />
                Invoice
              </Button>
            </div>
          </div>
          
          {/* Prominent Estimated Delivery with Track Order CTA */}
          <div className={`p-4 rounded-lg shadow-lg ${shipment.isDelayed ? 'bg-gradient-to-r from-red-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">
                    {shipment.isDelayed ? 'Delayed Delivery' : 'Estimated Delivery'}
                  </p>
                  <p className="text-lg font-bold">
                    {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    }) : 'Not available'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {shipment.courierPartner.name ? (
                  <div className="text-right">
                    <p className="text-sm font-medium opacity-90">{shipment.courierPartner.name}</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm font-medium opacity-90 text-gray-300">Not assigned</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-white/20 px-2 py-1 rounded">
                        {shipment.trackingId}
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
            {/* 1. Shipment Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Shipment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Order ID</p>
                    <p className="font-medium text-sm">{shipmentData?.data?.order_details?.order_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Shipment Mode</p>
                    <p className="font-medium text-sm">{shipmentData?.data?.order_details?.shipment_mod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Parcel Type</p>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-semibold">
                      {shipment.parcelType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Products</p>
                    <p className="font-medium text-sm">{shipment.products.length} items</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Estimated Pickup</p>
                    <p className="font-medium text-sm">{shipmentData?.data?.order_details?.estimated_pickup_date || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Estimated Delivery</p>
                    <p className="font-medium text-sm">{shipmentData?.data?.order_details?.estimated_delivery_date || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Shipment Date</p>
                    <p className="font-medium text-sm">{shipmentData?.data?.order_details?.shipment_date_time || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total Amount</p>
                    <p className="font-medium text-sm">₹{shipment.charges.collectableAmount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Courier Partner</p>
                    <p className="font-medium text-sm">{shipment.courierPartner.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">AWB Number</p>
                    <p className="font-medium text-sm font-mono">{shipment.trackingId || 'N/A'}</p>
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
                  {shipment.customer.name && (
                    <div>
                      <p className="font-medium text-sm">{shipment.customer.name}</p>
                    </div>
                  )}
                  {shipment.customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{shipment.customer.phone}</span>
                    </div>
                  )}
                  {shipment.customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="truncate text-xs">{shipment.customer.email}</span>
                    </div>
                  )}
                  {shipment.customer.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="text-xs leading-relaxed">
                        <p>{shipment.customer.address}</p>
                        {shipment.customer.city && shipment.customer.pin && (
                          <p className="text-gray-600">
                            {shipment.customer.city} - {shipment.customer.pin}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {!shipment.customer.name && !shipment.customer.phone && !shipment.customer.email && !shipment.customer.address && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No customer information available</p>
                    </div>
                  )}
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
                  {shipment.pickupWarehouse.name && (
                    <div>
                      <p className="font-medium text-sm">{shipment.pickupWarehouse.name}</p>
                    </div>
                  )}
                  {shipment.pickupWarehouse.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="text-xs leading-relaxed">
                        <p>{shipment.pickupWarehouse.address}</p>
                        {shipment.pickupWarehouse.city && shipment.pickupWarehouse.pin && (
                          <p className="text-gray-600">
                            {shipment.pickupWarehouse.city} - {shipment.pickupWarehouse.pin}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {shipment.pickupWarehouse.contact && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{shipment.pickupWarehouse.contact}</span>
                    </div>
                  )}
                  {!shipment.pickupWarehouse.name && !shipment.pickupWarehouse.address && !shipment.pickupWarehouse.contact && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No warehouse information available</p>
                    </div>
                  )}
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
                    {shipment.tracking.map((event, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${getTrackingDotColor(event)}`} />
                          {index < shipment.tracking.length - 1 && (
                            <div className="w-px h-6 bg-gray-200 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{event.status}</span>
                            {event.isActive && <CheckCircle className="h-3 w-3 text-blue-500" />}
                            {event.isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{event.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {event.timestamp && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" />
                                {(() => {
                                  // If timestamp is already a formatted string (e.g., "05 Jan 2026 02:11 PM"), display it as-is
                                  const timestampStr = String(event.timestamp);
                                  // Check if it already contains time (AM/PM or 24-hour format)
                                  if (timestampStr.includes('AM') || timestampStr.includes('PM') || timestampStr.match(/\d{1,2}:\d{2}/)) {
                                    return timestampStr;
                                  }
                                  // Otherwise, parse it and show date + time
                                  try {
                                    const date = new Date(event.timestamp);
                                    if (isNaN(date.getTime())) {
                                      return timestampStr;
                                    }
                                    // Format as date + time
                                    return date.toLocaleString('en-US', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    });
                                  } catch {
                                    return timestampStr;
                                  }
                                })()}
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
                <CardTitle className="text-sm">Products ({shipment.products.length})</CardTitle>
              </CardHeader>
                            <CardContent className="pt-0">
                {shipment.products.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {shipment.products.map((product, index) => (
                        <div key={product.id}>
                          <div className="flex gap-3">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{product.name}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1 text-xs text-gray-600">
                                <span>Qty: {product.quantity}</span>
                                <span>{formatCurrency(product.price)}</span>
                                <span>Tax: {product.taxRate}%</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1 text-xs text-gray-500">
                                {product.sku && <span>SKU: {product.sku}</span>}
                                {product.hsnCode && <span>HSN: {product.hsnCode}</span>}
                                {product.totalTax > 0 && <span>Tax: {formatCurrency(product.totalTax)}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">{formatCurrency(product.totalPrice)}</p>
                              {product.storeOrderId && (
                                <p className="text-xs text-gray-500">Order: {product.storeOrderId}</p>
                              )}
                            </div>
                          </div>
                          {index < shipment.products.length - 1 && <Separator className="mt-3" />}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No products available</p>
                  </div>
                )}
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
                  <span className="flex items-center gap-1 text-gray-600">
                    <Weight className="h-3 w-3" />
                    Weight
                  </span>
                  <span className="font-medium">{shipment.dimensions.weight} gm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Ruler className="h-3 w-3" />
                    Size
                  </span>
                  <span className="font-medium text-xs">
                    {shipment.dimensions.length}×{shipment.dimensions.width}×{shipment.dimensions.height} cm
                  </span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-orange-50 rounded-md border border-orange-200">
                  <span className="flex items-center gap-1 text-orange-700 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    Vol. Weight
                  </span>
                  <span className="font-bold text-orange-700">{shipment.dimensions.volumetricWeight.toFixed(2)} kg</span>
                </div>
                <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded-md">
                  <span className="font-medium">
                    Formula: L×B×H÷4000 = {shipment.dimensions.length}×{shipment.dimensions.width}×{shipment.dimensions.height}÷4000 = {shipment.dimensions.volumetricWeight.toFixed(2)} kg
                  </span>
                </div>
                {shipment.dimensions.weight > 0 && (
                  <div className="text-xs text-blue-500 text-center p-2 bg-blue-50 rounded-md border border-blue-200">
                    <span className="font-medium">
                      Weight Comparison: Actual: {shipment.dimensions.weight} gm | Volumetric: {(shipment.dimensions.volumetricWeight * 1000).toFixed(0)} gm
                    </span>
                  </div>
                )}
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
                  <span className="text-gray-600">Freight</span>
                  <span className="font-medium">₹{shipment.charges.freight}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">COD Charges</span>
                  <span className="font-medium">₹{shipment.charges.cod}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-medium bg-blue-50 p-2 rounded-md">
                  <span>Total Charges</span>
                  <span>₹{shipment.charges.totalCharges}</span>
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
                  <span className="text-gray-600">Product Total</span>
                  <span>₹{shipment.charges.productTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>₹{shipment.charges.shipping}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{shipment.charges.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-400 text-xs">₹{shipment.charges.discount}</span>
                    <span className="text-green-600">-₹{shipment.charges.discount}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-md">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{shipment.charges.collectableAmount}</span>
                </div>
              </CardContent>
            </Card>

            {/* 7. Notification Journey with Scroll - Hidden for now */}
            {/* <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {shipment.notifications.map((notification, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
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
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewShipment;
