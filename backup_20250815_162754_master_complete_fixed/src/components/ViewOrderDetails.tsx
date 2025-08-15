import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, CreditCard, MapPin, Calendar, Weight, Ruler, Edit, X, Copy, Save, Plus, Trash2, Ship, Search, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/orderService';
import CourierPartnerSelection from './CourierPartnerSelection';

// Initial empty state
const initialOrderData = {
  "status": true,
  "message": "Order data",
  "data": {
    "order_details": {
      "order_id": "",
      "order_date": "",
      "order_type": "",
      "parcel_type": "parcel",
      "weight": "0.00",
      "height": "0.00",
      "width": "0.00",
      "length": "0.00",
      "volumetric_weight": "0.00"
    },
    "customer_details": {
      "first_name": "",
      "last_name": "",
      "email": "",
      "address1": "",
      "address2": "",
      "city": "",
      "zipcode": "",
      "phone": ""
    },
    "product_details": [],
    "payment_details": {
      "shipping_tax": null,
      "total_tax": null,
      "product_total": 0,
      "total": "0.00",
      "cod_charges": "0.00",
      "collectable_amount": "0.00",
      "discount": "0.00"
    },
    "warehouse_details": null
  },
  "error": null
};

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState(initialOrderData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  
  // Warehouse selection state
  const [showShipModal, setShowShipModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  
  // Courier selection state
  const [showCourierSelection, setShowCourierSelection] = useState(false);
  
  // Cancel order state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  
  const { data } = orderData;
  const { order_details, customer_details, product_details, payment_details } = data;

  // Fetch order data from API
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (!authToken) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const apiUrl = `${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order/${orderId}`;
        console.log('Fetching order data from:', apiUrl);
        console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
        console.log('Order ID from URL params:', orderId);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.status && data.data) {
          setOrderData(data);
        } else {
          setError(data?.message || 'Failed to fetch order data');
          toast({
            title: 'Error',
            description: data?.message || 'Failed to fetch order data',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
        setError('Network error occurred');
        toast({
          title: 'Network Error',
          description: 'Failed to fetch order data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, toast]);

  // Auto-calculate volumetric weight when dimensions change or when data is loaded
  useEffect(() => {
    const length = parseFloat(order_details.length) || 0;
    const width = parseFloat(order_details.width) || 0;
    const height = parseFloat(order_details.height) || 0;
    
    if (length > 0 && width > 0 && height > 0) {
      const calculatedVolumetricWeight = (length * width * height / 4000).toFixed(2);
      const apiVolumetricWeight = parseFloat(order_details.volumetric_weight) || 0;
      
      // If there's a significant discrepancy (>1% difference), use calculated value
      if (Math.abs(parseFloat(calculatedVolumetricWeight) - apiVolumetricWeight) > 0.01) {
        updateOrderDetails('volumetric_weight', calculatedVolumetricWeight);
      }
    }
  }, [order_details.length, order_details.width, order_details.height, order_details.volumetric_weight]);

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      setWarehousesLoading(true);
      try {
        let authToken = sessionStorage.getItem('auth_token');
        if (!authToken) authToken = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/warehouse`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        let warehousesData = [];
        if (data && data.status && data.data && Array.isArray(data.data.warehouses_data)) {
          warehousesData = data.data.warehouses_data;
        } else if (data && Array.isArray(data)) {
          warehousesData = data;
        } else if (data && Array.isArray(data.data)) {
          warehousesData = data.data;
        } else if (data && data.data && Array.isArray(data.data.warehouses)) {
          warehousesData = data.data.warehouses;
        } else if (data && data.warehouses && Array.isArray(data.warehouses)) {
          warehousesData = data.warehouses;
        }
        setWarehouses(warehousesData);
      } catch (error) {
        setWarehouses([]);
      } finally {
        setWarehousesLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  const formatCurrency = (amount: string | number) => {
    return `₹${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const calculateVolumetricWeight = () => {
    // Volumetric weight formula: L × B × H ÷ 4000 (standard courier industry formula)
    // This gives weight in kg when dimensions are in cm
    const length = parseFloat(order_details.length) || 0;
    const width = parseFloat(order_details.width) || 0;
    const height = parseFloat(order_details.height) || 0;
    
    if (length > 0 && width > 0 && height > 0) {
      return (length * width * height / 4000).toFixed(2);
    }
    return '0.00';
  };

  const getOrderTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'prepaid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cod':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reverse':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleBack = () => {
    // Redirect to appropriate order type page based on order type
    const orderType = order_details.order_type?.toLowerCase();
    
    if (orderType === 'prepaid') {
      navigate('/dashboard/orders/prepaid');
    } else if (orderType === 'reverse') {
      navigate('/dashboard/orders/reverse');
    } else {
      // For COD and other types, go to main orders page
      navigate('/dashboard/orders');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsDuplicateMode(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsDuplicateMode(false);
  };

  const handleDuplicate = () => {
    setIsEditing(true);
    setIsDuplicateMode(true);
  };

  const handleDuplicateOrder = async () => {
    try {
      // Get auth token
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
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
        order_type: order_details.order_type || "prepaid",
        parcel_type: order_details.parcel_type || "parcel",
        store_customer_id: null,
        store_customer_address_id: null,
        order_id: null,
        shipping_charges: parseFloat(payment_details.shipping_tax) || 0,
        COD_charges: parseFloat(payment_details.cod_charges) || 0,
        tax_amount: parseFloat(payment_details.total_tax) || 0,
        discount: parseFloat(payment_details.discount) || 0,
        order_total: parseFloat(payment_details.total) || 0,
        collectable_amount: parseFloat(payment_details.collectable_amount) || 0,
        weight: parseFloat(order_details.weight) * 1000, // Convert to grams
        length: parseFloat(order_details.length) || 0,
        width: parseFloat(order_details.width) || 0,
        height: parseFloat(order_details.height) || 0,
        customer_phone: customer_details.phone || "",
        customer_first_name: `${customer_details.first_name} ${customer_details.last_name}`.trim() || "",
        address: `${customer_details.address1} ${customer_details.address2}`.trim() || "",
        landmark: "",
        customer_email: customer_details.email || "",
        pin_code: parseInt(customer_details.zipcode) || 0,
        city: customer_details.city || "",
        state: "",
        products: product_details.map(product => ({
          name: product.name || "",
          total_price: parseFloat(product.total_price) || 0,
          quantity: parseInt(product.quantity) || 1,
          sku: product.sku || "",
          price: parseFloat(product.price) || 0,
          tax_rate: parseFloat(product.tax_rate) || 0,
          hsn_code: product.hsn_code || ""
        }))
      };

      // Call the add new order API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order`, {
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
        const orderType = order_details.order_type?.toLowerCase() || 'prepaid';
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

  const handleCancelOrder = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderId) return;
    
    console.log('Cancelling order with ID from URL:', orderId);
    console.log('Order details from API:', order_details);
    
    try {
      setCancellingOrder(true);
      const result = await orderService.cancelOrder(orderId);
      
      if (result.success) {
        toast({
          title: "Order Cancelled",
          description: result.message || `Order ${order_details.order_id || orderId} has been cancelled successfully.`,
        });
        
        // Update the order status in local state
        setOrderData(prev => ({
          ...prev,
          data: {
            ...prev.data,
            order_details: {
              ...prev.data.order_details,
              status: 'cancelled'
            }
          }
        }));
        
        setShowCancelConfirm(false);
        
        // Redirect back to orders page after a short delay
        setTimeout(() => {
          handleBack();
        }, 1500);
      } else {
        toast({
          title: "Failed to Cancel Order",
          description: result.message || "An error occurred while cancelling the order.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while cancelling the order.",
        variant: "destructive"
      });
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleSave = async () => {
    try {
      // Ensure volumetric weight is correctly calculated before saving
      const calculatedVolumetricWeight = calculateVolumetricWeight();
      if (calculatedVolumetricWeight !== order_details.volumetric_weight) {
        updateOrderDetails('volumetric_weight', calculatedVolumetricWeight);
      }
      
      // Get auth token
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please login again to save changes.",
          variant: 'destructive',
        });
        return;
      }

      // Prepare order data - using the exact structure you specified
      const orderData = {
        order_type: order_details.order_type || "prepaid",
        parcel_type: order_details.parcel_type || "parcel",
        store_customer_id: null,
        store_customer_address_id: null,
        order_id: isDuplicateMode ? order_details.order_id : null, // Can be nullable - using existing order ID for duplicate
        shipping_charges: 21,
        COD_charges: 0,
        tax_amount: 12,
        discount: 12,
        order_total: 300,
        collectable_amount: 0,
        weight: parseFloat(order_details.weight) * 1000, // Convert to grams
        length: parseFloat(order_details.length) || 0,
        width: parseFloat(order_details.width) || 0,
        height: parseFloat(order_details.height) || 0,
        customer_phone: customer_details.phone || "",
        customer_first_name: `${customer_details.first_name} ${customer_details.last_name}`.trim() || "",
        address: `${customer_details.address1} ${customer_details.address2}`.trim() || "",
        landmark: "landmark33",
        customer_email: customer_details.email || "",
        pin_code: parseInt(customer_details.zipcode) || 0,
        city: customer_details.city || "",
        state: "jaipur",
        products: product_details.map(product => ({
          name: product.name || "product one11",
          total_price: 92.0,
          quantity: 4,
          sku: "",
          price: 23.0,
          tax_rate: 23.0,
          hsn_code: 23.0
        }))
      };

      let response;
      let endpoint;
      let method;

      if (isDuplicateMode) {
        // Duplicate mode - call the add new order API
        endpoint = 'api/order';
        method = 'POST';
      } else {
        // Edit mode - call the edit order API
        endpoint = `api/order/edit/${orderId}`;
        method = 'POST';
      }

      // Call the appropriate API
      response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}${endpoint}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (response.ok && data.status) {
        if (isDuplicateMode) {
          toast({
            title: "Success",
            description: "Order duplicated successfully!",
          });
          
          // Redirect to the appropriate orders page based on order type
          const orderType = order_details.order_type?.toLowerCase() || 'prepaid';
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
            title: "Success",
            description: "Order updated successfully!",
          });
          setIsEditing(false);
        }
      } else {
        toast({
          title: "Error",
          description: data?.error?.message || data?.message || `Failed to ${isDuplicateMode ? 'duplicate' : 'update'} order.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Network Error",
        description: `Failed to ${isDuplicateMode ? 'duplicate' : 'update'} order. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const updateOrderDetails = (field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        order_details: {
          ...prev.data.order_details,
          [field]: value
        }
      }
    }));
  };

  const updateCustomerDetails = (field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        customer_details: {
          ...prev.data.customer_details,
          [field]: value
        }
      }
    }));
  };

  const updateProductDetails = (index: number, field: string, value: string | number) => {
    setOrderData(prev => {
      const updatedProductDetails = prev.data.product_details.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      );
      
      // Recalculate product total for the updated product
      if (field === 'quantity' || field === 'price') {
        const updatedProduct = updatedProductDetails[index];
        const quantity = typeof updatedProduct.quantity === 'number' ? updatedProduct.quantity : parseInt(updatedProduct.quantity) || 0;
        const price = parseFloat(updatedProduct.price) || 0;
        updatedProductDetails[index] = {
          ...updatedProduct,
          total_price: (quantity * price).toFixed(2)
        };
      }
      
      // Calculate new product total
      const newProductTotal = updatedProductDetails.reduce((sum, product) => {
        const totalPrice = parseFloat(product.total_price) || 0;
        return sum + totalPrice;
      }, 0);
      
      return {
        ...prev,
        data: {
          ...prev.data,
          product_details: updatedProductDetails,
          payment_details: {
            ...prev.data.payment_details,
            product_total: newProductTotal
          }
        }
      };
    });
  };

  const addProduct = () => {
    const newProduct = {
      name: "",
      quantity: 1,
      price: "0.00",
      total_price: "0.00",
      sku: "",
      tax_rate: "",
      hsn_code: ""
    };
    
    setOrderData(prev => {
      const updatedProductDetails = [...prev.data.product_details, newProduct];
      
      // Calculate new product total
      const newProductTotal = updatedProductDetails.reduce((sum, product) => {
        const totalPrice = parseFloat(product.total_price) || 0;
        return sum + totalPrice;
      }, 0);
      
      return {
        ...prev,
        data: {
          ...prev.data,
          product_details: updatedProductDetails,
          payment_details: {
            ...prev.data.payment_details,
            product_total: newProductTotal
          }
        }
      };
    });
  };

  const removeProduct = (index: number) => {
    if (product_details.length > 1) {
      setOrderData(prev => {
        const updatedProductDetails = prev.data.product_details.filter((_, i) => i !== index);
        
        // Calculate new product total
        const newProductTotal = updatedProductDetails.reduce((sum, product) => {
          const totalPrice = parseFloat(product.total_price) || 0;
          return sum + totalPrice;
        }, 0);
        
        return {
          ...prev,
          data: {
            ...prev.data,
            product_details: updatedProductDetails,
            payment_details: {
              ...prev.data.payment_details,
              product_total: newProductTotal
            }
          }
        };
      });
    }
  };

  const updatePaymentDetails = (field: string, value: string) => {
    setOrderData(prev => {
      const updatedPaymentDetails = {
        ...prev.data.payment_details,
        [field]: value
      };
      
      // Recalculate order total when payment details change
      const productTotal = parseFloat(updatedPaymentDetails.product_total?.toString() || '0');
      const shippingTax = parseFloat(updatedPaymentDetails.shipping_tax?.toString() || '0');
      const codCharges = parseFloat(updatedPaymentDetails.cod_charges?.toString() || '0');
      const totalTax = parseFloat(updatedPaymentDetails.total_tax?.toString() || '0');
      const discount = parseFloat(updatedPaymentDetails.discount?.toString() || '0');
      
      const total = productTotal + shippingTax + codCharges + totalTax - discount;
      
      return {
        ...prev,
        data: {
          ...prev.data,
          payment_details: {
            ...updatedPaymentDetails,
            total: total.toFixed(2),
            collectable_amount: total.toFixed(2)
          }
        }
      };
    });
  };

  // Update order total when payment details change
  useEffect(() => {
    if (isEditing) {
      // The order total is now calculated automatically in updatePaymentDetails
      // and updateProductDetails functions, so we don't need to do anything here
    }
  }, [payment_details.product_total, payment_details.shipping_tax, payment_details.cod_charges, payment_details.total_tax, payment_details.discount, isEditing]);

  const handleShipOrder = () => {
    setShowShipModal(true);
  };

  const handleCourierSelect = (courier: any, rate: any) => {
    console.log('Selected courier:', courier);
    console.log('Selected rate:', rate);
    
    if (courier && rate) {
      toast({
        title: "Courier Selected",
        description: `${courier.name} - ${rate.name} selected for ₹${rate.totalPayable}`,
      });
    } else {
      // Close the modal when null values are passed (back button or after booking)
      setShowCourierSelection(false);
      setSelectedWarehouse(null); // Reset warehouse selection
    }
    
    // The booking process is now handled within the CourierPartnerSelection component
    // The modal will close automatically after successful booking
  };

  // Prepare order summary for courier selection
  const getOrderSummaryForCourier = () => {
    // Always use the most current data from the state
    const currentOrderData = orderData.data;
    const currentOrderDetails = currentOrderData.order_details;
    const currentCustomerDetails = currentOrderData.customer_details;
    
    // Use selected warehouse if available, otherwise fall back to order data
    const warehouseDetails = selectedWarehouse || currentOrderData.warehouse_details;
    const pickupLocation = warehouseDetails 
      ? `${warehouseDetails.warehouse_name || 'Unknown'}, ${warehouseDetails.city || 'Unknown'}, ${warehouseDetails.state || 'Unknown'}`
      : "Warehouse location to be determined";

    // Build comprehensive delivery location with customer name and address details
    const customerName = currentCustomerDetails.first_name || currentCustomerDetails.last_name || '';
    const deliveryAddress = [
      customerName,
      currentCustomerDetails.address1,
      currentCustomerDetails.address2,
      currentCustomerDetails.city,
      currentCustomerDetails.zipcode
    ].filter(Boolean).join(', ');



    return {
      orderId: parseInt(orderId) || parseInt(currentOrderDetails.order_id) || 1, // Use URL param first, then API data
      warehouseId: warehouseDetails?.id || 60, // Use selected warehouse ID
      rtoId: warehouseDetails?.id || 60, // Use same as warehouse for now
      parcelType: currentOrderDetails.parcel_type || 'parcel',
      pickupLocation: pickupLocation,
      deliveryLocation: deliveryAddress || `${currentCustomerDetails.city || 'Unknown'}, ${currentCustomerDetails.zipcode || 'Unknown'}`,
      orderType: currentOrderDetails.order_type || 'prepaid',
      weight: parseFloat(currentOrderDetails.weight) || 0,
      volumetricWeight: parseFloat(currentOrderDetails.volumetric_weight) || 0,
      dimensions: {
        length: parseFloat(currentOrderDetails.length) || 0,
        width: parseFloat(currentOrderDetails.width) || 0,
        height: parseFloat(currentOrderDetails.height) || 0
      }
    };
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

    // Close warehouse modal and open courier selection with selected warehouse
    setShowShipModal(false);
    setShowCourierSelection(true);
  };

  const filteredWarehouses = Array.isArray(warehouses)
    ? warehouses.filter(warehouse =>
        (warehouse.warehouse_name || '').toLowerCase().includes(warehouseSearch.toLowerCase()) ||
        (warehouse.city || '').toLowerCase().includes(warehouseSearch.toLowerCase()) ||
        (warehouse.state || '').toLowerCase().includes(warehouseSearch.toLowerCase())
      )
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 rounded-lg" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loading Order Details...</h1>
              <p className="text-gray-600 mt-1">Please wait while we fetch the order data</p>
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
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 rounded-lg" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Error Loading Order</h1>
              <p className="text-gray-600 mt-1">Order #{orderId}</p>
            </div>
          </div>
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Order</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={handleBack}>
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
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 rounded-lg" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900"></h1>
              <p className="text-gray-600 mt-1">Order #{order_details.order_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getOrderTypeColor(order_details.order_type || '')}>
              {(order_details.order_type || 'Unknown').charAt(0).toUpperCase() + (order_details.order_type || 'Unknown').slice(1).toLowerCase()}
            </Badge>
            {!isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleCancelOrder} variant="destructive" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
                <Button onClick={handleDuplicate} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  {isDuplicateMode ? 'Duplicate Order' : 'Save Changes'}
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-medium">{order_details.order_id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium">{order_details.order_date}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="order-type" className="text-sm text-gray-600">Order Type</Label>
                      {isEditing ? (
                        <Select value={order_details.order_type} onValueChange={(value) => updateOrderDetails('order_type', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prepaid">Prepaid</SelectItem>
                            <SelectItem value="cod">COD</SelectItem>
                            <SelectItem value="reverse">Reverse</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium mt-1">{(order_details.order_type || 'Unknown').charAt(0).toUpperCase() + (order_details.order_type || 'Unknown').slice(1).toLowerCase()}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="parcel-type" className="text-sm text-gray-600">Parcel Type</Label>
                      {isEditing ? (
                        <Select value={order_details.parcel_type} onValueChange={(value) => updateOrderDetails('parcel_type', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="parcel">Parcel</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium mt-1">{order_details.parcel_type}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Weight className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">Weight (gm)</Label>
                        {isEditing ? (
                          <Input
                            value={order_details.weight}
                            onChange={(e) => updateOrderDetails('weight', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium mt-1">{order_details.weight} gm</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Ruler className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">Dimensions (L×B×H) cm</Label>
                        {isEditing ? (
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            <Input
                              placeholder="L"
                              value={order_details.length}
                              onChange={(e) => updateOrderDetails('length', e.target.value)}
                            />
                            <Input
                              placeholder="B"
                              value={order_details.width}
                              onChange={(e) => updateOrderDetails('width', e.target.value)}
                            />
                            <Input
                              placeholder="H"
                              value={order_details.height}
                              onChange={(e) => updateOrderDetails('height', e.target.value)}
                            />
                          </div>
                        ) : (
                          <p className="font-medium mt-1">
                            {order_details.length} × {order_details.width} × {order_details.height} cm
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Package className="h-4 w-4 text-amber-600 mt-1" />
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">Volumetric Weight</Label>
                        <div className="mt-2">
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold text-amber-800 text-lg">{calculateVolumetricWeight()} kg</span>
                          </div>
                          <p className="text-xs text-amber-600 mt-1 font-medium">
                            ⚡ Auto-calculated: L×B×H÷4000 = {order_details.length} × {order_details.width} × {order_details.height} ÷ 4000 = {((parseFloat(order_details.length) * parseFloat(order_details.width) * parseFloat(order_details.height)) / 4000).toFixed(2)} kg
                          </p>
                          {/* Show warning if there's a discrepancy */}
                          {(() => {
                            const calculated = (parseFloat(order_details.length) * parseFloat(order_details.width) * parseFloat(order_details.height)) / 4000;
                            const apiValue = parseFloat(order_details.volumetric_weight);
                            if (Math.abs(calculated - apiValue) > 0.01) {
                              return (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-xs text-red-600 font-medium">
                                    ⚠️ API data discrepancy detected
                                  </p>
                                  <p className="text-xs text-red-500 mt-1">
                                    API value: {order_details.volumetric_weight} kg | Calculated: {calculated.toFixed(2)} kg
                                  </p>
                                  <p className="text-xs text-red-500">
                                    Using calculated value based on dimensions: {order_details.length} × {order_details.width} × {order_details.height} ÷ 4000
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Order ID</p>
                    <p className="text-lg font-bold text-blue-900">{order_details.order_id}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Order Type</p>
                    <p className="text-lg font-bold text-green-900">{(order_details.order_type || 'Unknown').charAt(0).toUpperCase() + (order_details.order_type || 'Unknown').slice(1).toLowerCase()}</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600 font-medium">Weight</p>
                                            <p className="text-lg font-bold text-amber-900">{order_details.weight} gm</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Vol. Weight</p>
                    <p className="text-lg font-bold text-purple-900">{calculateVolumetricWeight()} kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label className="text-sm text-gray-600">Phone Number</Label>
                          <Input
                            value={customer_details.phone}
                            onChange={(e) => updateCustomerDetails('phone', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">First Name</Label>
                          <Input
                            value={customer_details.first_name}
                            onChange={(e) => updateCustomerDetails('first_name', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Last Name</Label>
                          <Input
                            value={customer_details.last_name || ''}
                            onChange={(e) => updateCustomerDetails('last_name', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Email</Label>
                          <Input
                            value={customer_details.email || ''}
                            onChange={(e) => updateCustomerDetails('email', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-sm text-gray-600">First Name</Label>
                          <p className="font-medium mt-1">{customer_details.first_name}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Last Name</Label>
                          <p className="font-medium mt-1">{customer_details.last_name || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Phone Number</Label>
                          <p className="font-medium mt-1">{customer_details.phone}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-600">Email</Label>
                          <p className="font-medium mt-1">{customer_details.email || 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Address Line 1</Label>
                      {isEditing ? (
                        <Input
                          value={customer_details.address1}
                          onChange={(e) => updateCustomerDetails('address1', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-start gap-3 mt-1">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed">{customer_details.address1}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-600">Address Line 2</Label>
                      {isEditing ? (
                        <Input
                          value={customer_details.address2 || ''}
                          onChange={(e) => updateCustomerDetails('address2', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium mt-1">{customer_details.address2 || 'N/A'}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-gray-600">City</Label>
                        {isEditing ? (
                          <Input
                            value={customer_details.city}
                            onChange={(e) => updateCustomerDetails('city', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium mt-1">{customer_details.city}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-600">Zipcode</Label>
                        {isEditing ? (
                          <Input
                            value={customer_details.zipcode}
                            onChange={(e) => updateCustomerDetails('zipcode', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium mt-1">{customer_details.zipcode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                    Product Details
                  </CardTitle>
                  {isEditing && (
                    <Button onClick={addProduct} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product_details.map((product, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4 relative">
                      {isEditing && product_details.length > 1 && (
                        <Button
                          onClick={() => removeProduct(index)}
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm text-gray-600">Product Name</Label>
                            <Input
                              value={product.name}
                              onChange={(e) => updateProductDetails(index, 'name', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm text-gray-600">Quantity</Label>
                            <Input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => updateProductDetails(index, 'quantity', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm text-gray-600">Unit Price</Label>
                            <Input
                              value={product.price}
                              onChange={(e) => updateProductDetails(index, 'price', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm text-gray-600">SKU (Optional)</Label>
                            <Input
                              value={product.sku || ''}
                              onChange={(e) => updateProductDetails(index, 'sku', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm text-gray-600">Tax Rate (Optional)</Label>
                            <Input
                              value={product.tax_rate || ''}
                              onChange={(e) => updateProductDetails(index, 'tax_rate', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm text-gray-600">HSN Code (Optional)</Label>
                            <Input
                              value={product.hsn_code || ''}
                              onChange={(e) => updateProductDetails(index, 'hsn_code', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-600">
                              Quantity: {product.quantity} × {formatCurrency(product.price)}
                            </p>
                            {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}
                            {product.tax_rate && parseFloat(product.tax_rate) > 0 && (
                              <p className="text-sm text-gray-500">Tax Rate: {product.tax_rate}%</p>
                            )}
                            {product.hsn_code && <p className="text-sm text-gray-500">HSN Code: {product.hsn_code}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatCurrency(product.total_price)}</p>
                            {product.tax_rate && parseFloat(product.tax_rate) > 0 && (
                              <p className="text-xs text-gray-500">
                                Tax: {formatCurrency((parseFloat(product.price) * parseFloat(product.tax_rate) / 100) * product.quantity)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-6">
            <Card className="shadow-sm border-0 bg-white sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Shipping Charges */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping Charges (₹)</span>
                    {isEditing ? (
                      <Input
                        value={payment_details.shipping_tax || '0'}
                        onChange={(e) => updatePaymentDetails('shipping_tax', e.target.value)}
                        className="w-24 h-8 text-right"
                        placeholder="0"
                      />
                    ) : (
                      <span className="font-medium">{formatCurrency(payment_details.shipping_tax || 0)}</span>
                    )}
                  </div>

                  {/* Total Tax */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Tax (₹)</span>
                    {isEditing ? (
                      <Input
                        value={payment_details.total_tax || '0'}
                        onChange={(e) => updatePaymentDetails('total_tax', e.target.value)}
                        className="w-24 h-8 text-right"
                        placeholder="0"
                      />
                    ) : (
                      <span className="font-medium">{formatCurrency(payment_details.total_tax || 0)}</span>
                    )}
                  </div>

                  {/* Discount */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount (₹)</span>
                    {isEditing ? (
                      <Input
                        value={payment_details.discount || '0'}
                        onChange={(e) => updatePaymentDetails('discount', e.target.value)}
                        className="w-24 h-8 text-right"
                        placeholder="0"
                      />
                    ) : (
                      <span className="font-medium">{formatCurrency(payment_details.discount || 0)}</span>
                    )}
                  </div>

                  {/* Product Total */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Total (₹)</span>
                    <span className="font-medium">{formatCurrency(payment_details.product_total)}</span>
                  </div>

                  {/* Order Total */}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Order Total (₹)</span>
                    {isEditing ? (
                      <Input
                        value={payment_details.total}
                        onChange={(e) => {
                          updatePaymentDetails('total', e.target.value);
                          updatePaymentDetails('collectable_amount', e.target.value);
                        }}
                        className="w-32 h-8 text-right font-semibold text-blue-600"
                      />
                    ) : (
                      <span className="text-blue-600">{formatCurrency(payment_details.total)}</span>
                    )}
                  </div>

                  {/* COD Specific Fields - Only show for COD orders */}
                  {order_details.order_type === 'cod' && (
                    <>
                      {/* COD Charges */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">COD Charges (₹)</span>
                        {isEditing ? (
                          <Input
                            value={payment_details.cod_charges || '0'}
                            onChange={(e) => updatePaymentDetails('cod_charges', e.target.value)}
                            className="w-24 h-8 text-right"
                            placeholder="0"
                          />
                        ) : (
                          <span className="font-medium">{formatCurrency(payment_details.cod_charges || 0)}</span>
                        )}
                      </div>

                      {/* Collectable Amount */}
                      <div className="flex justify-between text-lg font-semibold text-orange-600 border-t pt-2">
                        <span>Collectable Amount (₹)</span>
                        {isEditing ? (
                          <Input
                            value={payment_details.collectable_amount}
                            onChange={(e) => updatePaymentDetails('collectable_amount', e.target.value)}
                            className="w-32 h-8 text-right font-semibold text-orange-600"
                          />
                        ) : (
                          <span>{formatCurrency(payment_details.collectable_amount)}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="pt-4 space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
                      onClick={handleShipOrder}
                    >
                      Ship Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Warehouse Selection Modal */}
      <Dialog open={showShipModal} onOpenChange={setShowShipModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Warehouse for Order {order_details.order_id}</DialogTitle>
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
              {warehousesLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading warehouses...</div>
              ) : filteredWarehouses.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No warehouses found.</div>
              ) : filteredWarehouses.map((warehouse) => (
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
                      <div className="font-medium">{warehouse.warehouse_name}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.city}, {warehouse.state}</div>
                      <div className="text-xs text-muted-foreground">{warehouse.pincode}</div>
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
                Cancel
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

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span>Cancel Order</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to cancel order <strong>{order_details.order_id}</strong>?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                Keep Order
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmCancelOrder}
                disabled={cancellingOrder}
              >
                {cancellingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Order'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Courier Partner Selection Modal */}
      <Dialog open={showCourierSelection} onOpenChange={setShowCourierSelection}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Courier Partner for Order {order_details.order_id}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CourierPartnerSelection
              orderSummary={getOrderSummaryForCourier()}
              onCourierSelect={handleCourierSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetails; 