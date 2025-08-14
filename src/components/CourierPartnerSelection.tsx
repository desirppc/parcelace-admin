
import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Package, 
  Weight, 
  Calendar, 
  Clock, 
  Info,
  Check,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface RateData {
  freightCharges: number;
  parcelAceProfitAmount: number;
  insuranceCharges: number;
  codCharges: number;
  earlyCodCharges: number;
  gstAmount: number;
  grossAmount: number;
  totalPayable: number;
  id: string;
  name: string;
}

interface ShipRate {
  estimated_pickup: string;
  estimated_delivery: string;
  rate: RateData[];
  name: string;
  courier_partner_id: number;
  mode: string;
  weight: number;
  destination: string;
  origin: string;
  rating: number | null;
  payment_type: string;
  chargeType: string;
  baseRate: number | null;
}

interface RateAPIResponse {
  status: boolean;
  message: string;
  data: {
    warehouseId: string;
    rtoId: string;
    shiprates: ShipRate[];
    order: any;
    warehouse: {
      id: number;
      user_id: number;
      warehouse_name: string;
      warehouse_code: string;
      first_name: string;
      last_name: string;
      address: string;
      pincode: string;
      city: string;
      state: string;
      is_default: number;
      mobile_number: string;
      whatsapp_number: string;
      alternative_mobile_number: string | null;
      deleted_at: string | null;
      created_at: string;
      updated_at: string;
    };
    rto: any;
  };
  error: any;
}

interface OrderSummary {
  orderId: number;
  warehouseId: number;
  rtoId: number;
  parcelType: string;
  pickupLocation: string;
  deliveryLocation: string;
  orderType: string;
  weight: number;
  volumetricWeight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

interface CourierPartnerSelectionProps {
  orderSummary?: OrderSummary;
  onCourierSelect?: (courier: ShipRate | null, rate: RateData | null) => void;
}

const CourierPartnerSelection: React.FC<CourierPartnerSelectionProps> = ({ 
  orderSummary,
  onCourierSelect 
}) => {
  // Debug logging to see what's being received
  console.log('=== DEBUG: CourierPartnerSelection ===');
  console.log('Received orderSummary prop:', orderSummary);
  console.log('orderSummary.orderId:', orderSummary?.orderId);
  console.log('orderSummary.warehouseId:', orderSummary?.warehouseId);
  console.log('orderSummary.rtoId:', orderSummary?.rtoId);
  console.log('orderSummary.parcelType:', orderSummary?.parcelType);
  
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<RateData | null>(null);
  const [selectedCourierData, setSelectedCourierData] = useState<ShipRate | null>(null);
  const [shipRates, setShipRates] = useState<ShipRate[]>([]);
  const [warehouseData, setWarehouseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Default order summary if not provided
  const defaultOrderSummary: OrderSummary = {
    orderId: 1,
    warehouseId: 60,
    rtoId: 60,
    parcelType: 'parcel',
    pickupLocation: "Mumbai, Maharashtra - 400001",
    deliveryLocation: "Delhi, Delhi - 110001", 
    orderType: "prepaid",
    weight: 2.5,
    volumetricWeight: 3.2,
    dimensions: { length: 30, width: 25, height: 15 }
  };

  const currentOrderSummary = orderSummary || defaultOrderSummary;

  // Get warehouse location from API response if available
  const getWarehouseLocation = () => {
    if (warehouseData) {
      return `${warehouseData.warehouse_name}, ${warehouseData.city}`;
    }
    return orderSummary?.pickupLocation || currentOrderSummary.pickupLocation;
  };

  // Fetch rates from API - only when component mounts or orderSummary changes meaningfully
  useEffect(() => {
    // Only fetch if we have a valid orderSummary with real data
    if (!orderSummary || !orderSummary.orderId) {
      return;
    }

    const fetchRates = async () => {
      setLoading(true);
      setError(null);

      try {
        const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (!authToken) {
          setError('Authentication token not found');
          return;
        }

        const requestBody = {
          order_id: orderSummary.orderId,
          warehouse_id: orderSummary.warehouseId,
          rto_id: orderSummary.rtoId,
          parcel_type: orderSummary.parcelType
        };

        console.log('=== DEBUG: API Request ===');
        console.log('orderSummary prop:', orderSummary);
        console.log('orderSummary.orderId:', orderSummary.orderId);
        console.log('orderSummary.warehouseId:', orderSummary.warehouseId);
        console.log('orderSummary.rtoId:', orderSummary.rtoId);
        console.log('orderSummary.parcelType:', orderSummary.parcelType);
        console.log('Final request body:', requestBody);
        console.log('=== END DEBUG ===');
        
        console.log('Fetching rates with payload:', requestBody);
        console.log('API URL:', `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/courier-partner-rates`);

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/courier-partner-rates`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          console.log('Response status:', response.status);
          console.log('Response headers:', response.headers);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const data: RateAPIResponse = await response.json();
          console.log('API Response:', data);

          if (data.status && data.data?.shiprates) {
            setShipRates(data.data.shiprates);
            setWarehouseData(data.data.warehouse);
            console.log('Rates fetched successfully:', data.data.shiprates);
            console.log('Warehouse data:', data.data.warehouse);
          } else {
            const errorMsg = data?.message || 'Failed to fetch rates';
            console.error('API returned error:', errorMsg);
            setError(errorMsg);
            toast({
              title: 'Error',
              description: errorMsg,
              variant: 'destructive',
            });
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            console.error('Request timeout after 30 seconds');
            setError('Request timeout - server is taking too long to respond');
            toast({
              title: 'Timeout Error',
              description: 'The server is taking too long to respond. Please try again later.',
              variant: 'destructive',
            });
          } else {
            console.error('Error fetching rates:', fetchError);
            setError(`Network error: ${fetchError.message}`);
            toast({
              title: 'Network Error',
              description: `Failed to fetch courier rates: ${fetchError.message}`,
              variant: 'destructive',
            });
          }
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('Outer error:', error);
        setError('Failed to fetch rates');
        toast({
          title: 'Error',
          description: 'Failed to fetch courier rates',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchRates();
  }, [orderSummary?.orderId, orderSummary?.warehouseId, orderSummary?.rtoId]); // Only depend on key values that matter

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date' || dateString === 'null' || dateString === 'undefined') {
      return 'TBD';
    }
    
    // Handle DD-MM-YYYY format (convert to YYYY-MM-DD for JavaScript Date)
    let formattedDateString = dateString;
    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      // Format is DD-MM-YYYY, convert to YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length === 3) {
        formattedDateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    
    const date = new Date(formattedDateString);
    if (isNaN(date.getTime())) {
      return 'TBD';
    }
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateTransitDays = (pickupDate: string, deliveryDate: string) => {
    if (!pickupDate || !deliveryDate || pickupDate === 'Invalid Date' || deliveryDate === 'Invalid Date') {
      return 'TBD';
    }
    
    // Handle DD-MM-YYYY format (convert to YYYY-MM-DD for JavaScript Date)
    const formatDateForJS = (dateString: string) => {
      if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      return dateString;
    };
    
    const pickup = new Date(formatDateForJS(pickupDate));
    const delivery = new Date(formatDateForJS(deliveryDate));
    
    if (isNaN(pickup.getTime()) || isNaN(delivery.getTime())) {
      return 'TBD';
    }
    
    const diffTime = delivery.getTime() - pickup.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 'TBD';
  };

  const handleCourierSelect = (courier: ShipRate | null, rate: RateData | null) => {
    if (courier && rate) {
      setSelectedCourier(`${courier.courier_partner_id}-${rate.id}`);
      setSelectedRate(rate);
      setSelectedCourierData(courier);
      
      if (onCourierSelect) {
        onCourierSelect(courier, rate);
      }
    } else {
      // Handle back button or modal close
      setSelectedCourier(null);
      setSelectedRate(null);
      setSelectedCourierData(null);
      
      if (onCourierSelect) {
        onCourierSelect(null, null);
      }
    }
  };

  const handleBooking = async () => {
    if (!selectedCourierData || !selectedRate) {
      toast({
        title: 'Error',
        description: 'Please select a courier partner first',
        variant: 'destructive',
      });
      return;
    }

    setBookingLoading(true);

    try {
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      let userId = 30; // Default fallback
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          userId = parsedUserData.id || parsedUserData.user_id || 30;
        } catch (e) {
          console.warn('Failed to parse user data, using default userId');
        }
      }

      // Determine collectable amount based on order's payment mode, not courier's payment type
      const orderPaymentMode = orderSummary?.orderType?.toLowerCase() || currentOrderSummary.orderType?.toLowerCase();
      const isPrepaid = orderPaymentMode === 'prepaid';
      const collectableAmount = isPrepaid ? 0 : selectedRate.totalPayable;

      // DEBUG: Add validation check
      if (isPrepaid && collectableAmount !== 0) {
        console.error('Validation Error: Prepaid order should have collectable_amount = 0');
        console.error('Order payment mode:', orderPaymentMode);
        console.error('Courier payment type:', selectedCourierData.payment_type);
        console.error('Collectable amount:', collectableAmount);
        console.error('Selected rate:', selectedRate);
        throw new Error('Incase Prepaid, Collectable Amount Should be Zero');
      }

      const bookingPayload = {
        warehouse_id: orderSummary.warehouseId,
        rto_id: orderSummary.rtoId,
        order_id: orderSummary.orderId,
        courier_partner_id: selectedCourierData.courier_partner_id,
        rate_name: selectedRate.name,
        user_id: userId,
        auto_pickup: true,
        collectable_amount: collectableAmount,
        shippingRateData: {
          freightCharges: selectedRate.freightCharges.toString(),
          parcelAceProfitAmount: selectedRate.parcelAceProfitAmount.toString(),
          insuranceCharges: selectedRate.insuranceCharges.toString(),
          codCharges: selectedRate.codCharges.toString(),
          earlyCodCharges: selectedRate.earlyCodCharges.toString(),
          gstAmount: selectedRate.gstAmount.toString(),
          grossAmount: selectedRate.grossAmount.toString(),
          totalPayable: selectedRate.totalPayable.toString(),
          id: selectedRate.id,
          name: selectedRate.name
        }
      };

      console.log('=== DEBUG: Create Shipment ===');
      console.log('orderSummary prop:', orderSummary);
      console.log('orderSummary.orderId:', orderSummary.orderId);
      console.log('orderSummary.warehouseId:', orderSummary.warehouseId);
      console.log('orderSummary.rtoId:', orderSummary.rtoId);
      console.log('Final booking payload:', bookingPayload);
      console.log('=== END DEBUG ===');

      console.log('=== DEBUG: Booking Request ===');
      console.log('Order payment mode:', orderPaymentMode);
      console.log('Courier payment type:', selectedCourierData.payment_type);
      console.log('Is prepaid:', isPrepaid);
      console.log('Collectable amount:', collectableAmount);
      console.log('Selected courier data:', selectedCourierData);
      console.log('Selected rate:', selectedRate);
      console.log('Order summary:', orderSummary);
      console.log('Booking payload:', bookingPayload);
      console.log('=== COMPLETE REQUEST BODY ===');
      console.log('Environment Variables:');
      console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('  NODE_ENV:', import.meta.env.NODE_ENV);
      console.log('  MODE:', import.meta.env.MODE);
      console.log('API URL:', `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/create`);
      console.log('Auth Token:', authToken ? `${authToken.substring(0, 20)}...` : 'NOT FOUND');
      console.log('User ID:', userId);
      console.log('Request Headers:', {
        'Authorization': `Bearer ${authToken ? '***' : 'NOT FOUND'}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });
      console.log('Request Body (JSON):', JSON.stringify(bookingPayload, null, 2));
      console.log('Request Body (Raw):', bookingPayload);
      console.log('=== END DEBUG ===');

      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/create`;
      const requestHeaders = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      console.log('=== FETCH REQUEST DEBUG ===');
      console.log('Fetch URL:', apiUrl);
      console.log('Fetch Method:', 'POST');
      console.log('Fetch Headers:', requestHeaders);
      console.log('Fetch Body Stringified:', JSON.stringify(bookingPayload));
      console.log('=== END FETCH REQUEST DEBUG ===');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(bookingPayload)
      });

      console.log('Booking response status:', response.status);
      console.log('Booking response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Booking API Error Response:', errorText);
        console.error('Error Response Headers:', Object.fromEntries(response.headers.entries()));
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Booking API Response Status:', response.status);
      console.log('Booking API Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Booking API Response Data:', data);
      console.log('Booking API Response Data (JSON):', JSON.stringify(data, null, 2));
      console.log('=== END API RESPONSE DEBUG ===');

      if (data.status) {
        toast({
          title: 'Booking Successful!',
          description: data.message || 'Shipment has been booked successfully',
          variant: 'default',
        });

        // Close the modal by calling onCourierSelect with null values
        if (onCourierSelect) {
          onCourierSelect(null, null);
        }

        // Redirect to shipment page after a short delay
        setTimeout(() => {
          window.location.href = '/shipments';
        }, 2000);
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to book shipment',
        variant: 'destructive',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const getCourierLogo = (courierName: string) => {
    const logos: { [key: string]: string } = {
      'Delhivery': '🚚',
      'Blue Dart': '📦',
      'DTDC': '🚛',
      'Ecom Express': '⚡',
      'Xbee': '📦',
      'Xpressbees': '📦',
      'Air Xpressbees': '✈️'
    };
    return logos[courierName] || '📦';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/30 dark:border-blue-800/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Location</p>
                  <p className="font-medium text-sm">{orderSummary?.pickupLocation || currentOrderSummary.pickupLocation}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Location</p>
                  <p className="font-medium text-sm">{orderSummary?.deliveryLocation || currentOrderSummary.deliveryLocation}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Type</p>
                  <p className="font-medium text-sm">{orderSummary?.orderType || currentOrderSummary.orderType}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Weight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium text-sm">{orderSummary?.weight || currentOrderSummary.weight} gm</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Weight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volumetric Weight</p>
                  <p className="font-medium text-sm">{orderSummary?.volumetricWeight || currentOrderSummary.volumetricWeight} gm</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dimensions (L×W×H)</p>
                  <p className="font-medium text-sm">
                    {orderSummary?.dimensions?.length || currentOrderSummary.dimensions.length}×{orderSummary?.dimensions?.width || currentOrderSummary.dimensions.width}×{orderSummary?.dimensions?.height || currentOrderSummary.dimensions.height} cm
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
          <p className="mt-4 text-muted-foreground">Fetching courier rates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/30 dark:border-blue-800/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Location</p>
                  <p className="font-medium text-sm">{getWarehouseLocation()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Location</p>
                  <p className="font-medium text-sm">{orderSummary?.deliveryLocation || currentOrderSummary.deliveryLocation}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Type</p>
                  <p className="font-medium text-sm">{orderSummary?.orderType || currentOrderSummary.orderType}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Weight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium text-sm">{orderSummary?.weight || currentOrderSummary.weight} gm</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Weight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volumetric Weight</p>
                  <p className="font-medium text-sm">{orderSummary?.volumetricWeight || currentOrderSummary.volumetricWeight} gm</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dimensions (L×W×H)</p>
                  <p className="font-medium text-sm">
                    {orderSummary?.dimensions?.length || currentOrderSummary.dimensions.length}×{orderSummary?.dimensions?.width || currentOrderSummary.dimensions.width}×{orderSummary?.dimensions?.height || currentOrderSummary.dimensions.height} cm
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-red-200/30 dark:border-red-800/30">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Rates</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary Section */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/30 dark:border-blue-800/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Order Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pickup Location</p>
                <p className="font-medium text-sm">{getWarehouseLocation()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Location</p>
                <p className="font-medium text-sm">{orderSummary?.deliveryLocation || currentOrderSummary.deliveryLocation}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Type</p>
                <p className="font-medium text-sm">{orderSummary?.orderType || currentOrderSummary.orderType}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Weight className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-medium text-sm">{orderSummary?.weight || currentOrderSummary.weight} gm</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Weight className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volumetric Weight</p>
                <p className="font-medium text-sm">{orderSummary?.volumetricWeight || currentOrderSummary.volumetricWeight} gm</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dimensions (L×W×H)</p>
                <p className="font-medium text-sm">
                  {orderSummary?.dimensions?.length || currentOrderSummary.dimensions.length}×{orderSummary?.dimensions?.width || currentOrderSummary.dimensions.width}×{orderSummary?.dimensions?.height || currentOrderSummary.dimensions.height} cm
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courier Partners Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
          <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Select Courier Partner</span>
        </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              // Trigger a fresh API call
              const fetchRates = async () => {
                try {
                  const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
                  if (!authToken) {
                    setError('Authentication token not found');
                    return;
                  }

                  const requestBody = {
                    order_id: orderSummary.orderId,
                    warehouse_id: orderSummary.warehouseId,
                    rto_id: orderSummary.rtoId,
                    parcel_type: orderSummary.parcelType
                  };

                  const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/shipments/courier-partner-rates`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${authToken}`,
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                  });

                  if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                  }

                  const data: RateAPIResponse = await response.json();
                  if (data.status && data.data?.shiprates) {
                    setShipRates(data.data.shiprates);
                    setError(null);
                  } else {
                    setError(data?.message || 'Failed to fetch rates');
                  }
                } catch (error: any) {
                  setError(`Failed to refresh rates: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              };
              fetchRates();
            }}
            disabled={loading}
            className="text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Rates
              </>
            )}
          </Button>
        </div>

        {shipRates.length === 0 ? (
          <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/30 dark:border-gray-800/30">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-gray-500 text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Rates Available</h2>
                <p className="text-gray-600">No courier rates found for this route and package details.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
        <div className="grid gap-4">
            {shipRates.map((courier) => (
              courier.rate.map((rate) => (
            <Card
                  key={`${courier.courier_partner_id}-${rate.id}`}
                  className={`transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] ${
                    selectedCourier === `${courier.courier_partner_id}-${rate.id}`
                      ? 'border-2 border-purple-500 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 shadow-lg shadow-purple-500/30'
                      : 'border border-gray-200 dark:border-gray-700 hover:border-2 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-100/80 hover:to-blue-100/80 dark:hover:from-purple-900/40 dark:hover:to-blue-900/40'
                  }`}
                  onClick={() => handleCourierSelect(courier, rate)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                          {getCourierLogo(courier.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{courier.name}</h3>
                          <p className="text-sm text-muted-foreground">{rate.name}</p>
                          {courier.rating && (
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                      i < Math.floor(courier.rating!)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({courier.rating})
                        </span>
                      </div>
                          )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Pickup</span>
                      </div>
                      <p className="font-medium text-sm">
                            {formatDate(courier.estimated_pickup)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Delivery</span>
                      </div>
                      <p className="font-medium text-sm">
                            {formatDate(courier.estimated_delivery)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Transit</span>
                      </div>
                      <p className="font-medium text-sm">
                            {(() => {
                              const transitDays = calculateTransitDays(courier.estimated_pickup, courier.estimated_delivery);
                              return typeof transitDays === 'number' 
                                ? `${transitDays} ${transitDays === 1 ? 'Day' : 'Days'}`
                                : transitDays;
                            })()}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                        <span>Total Charges</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </TooltipTrigger>
                            <TooltipContent className="w-64">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                      <span>Freight Charges:</span>
                                      <span>₹{rate.freightCharges}</span>
                                </div>
                                <div className="flex justify-between">
                                      <span>ParcelAce Profit:</span>
                                      <span>₹{rate.parcelAceProfitAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                      <span>Insurance:</span>
                                      <span>₹{rate.insuranceCharges}</span>
                                </div>
                                  <div className="flex justify-between">
                                    <span>COD Charges:</span>
                                      <span>₹{rate.codCharges}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Early COD:</span>
                                      <span>₹{rate.earlyCodCharges}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>GST Amount:</span>
                                      <span>₹{rate.gstAmount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Gross Amount:</span>
                                      <span>₹{rate.grossAmount}</span>
                                  </div>
                                <hr className="border-gray-200 dark:border-gray-700" />
                                <div className="flex justify-between font-semibold">
                                      <span>Total Payable:</span>
                                      <span>₹{rate.totalPayable}</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                            ₹{rate.totalPayable}
                      </p>
                    </div>

                    <Button
                          variant={selectedCourier === `${courier.courier_partner_id}-${rate.id}` ? "default" : "outline"}
                      className={`px-6 ${
                            selectedCourier === `${courier.courier_partner_id}-${rate.id}`
                              ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'border-2 border-purple-300 dark:border-purple-600 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md'
                      } transition-all duration-300`}
                    >
                          {selectedCourier === `${courier.courier_partner_id}-${rate.id}` ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        {courier.payment_type === 'prepaid' ? 'Prepaid' : 'COD'}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        {courier.mode === 'S' ? 'Surface' : 'Air'}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        {courier.weight}g
                    </span>
                </div>
              </CardContent>
            </Card>
              ))
          ))}
        </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedCourier && (
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="px-6 border-2 border-purple-300 dark:border-purple-600 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all duration-300"
            onClick={() => {
              // Close modal by calling onCourierSelect with null values
              if (onCourierSelect) {
                onCourierSelect(null, null);
              }
            }}
          >
            Back
          </Button>
          <Button 
            className="px-8 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            onClick={handleBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              'Proceed to Booking'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourierPartnerSelection;
