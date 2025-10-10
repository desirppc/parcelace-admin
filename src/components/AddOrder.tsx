import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Calendar, Phone, Mail, Save, Plus, Minus } from 'lucide-react';
import { getApiUrl, getAuthHeaders } from '@/config/api';
import API_CONFIG from '@/config/api';
import pincodeMapping from '@/data/pincode-city-state.json';
import { clearCacheByPrefix, CacheGroups } from '@/utils/cache';

interface ProductItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  productTotal: number;
  sku: string;
  taxRate: number;
  hsnCode: string;
}

const AddOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    orderType: 'prepaid',
    parcelType: 'parcel'
  });

  const [shippingDetails, setShippingDetails] = useState({
    customerPhone: '',
    customerName: '',
    address: '',
    landmark: '',
    customerEmail: '',
    pincode: '',
    city: '',
    state: ''
  });

  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: '1',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      productTotal: 0,
      sku: '',
      taxRate: 0,
      hsnCode: ''
    }
  ]);

  const [weightDimensions, setWeightDimensions] = useState({
    weight: 0,
    length: 0,
    width: 0,
    height: 0
  });

  const [payment, setPayment] = useState({
    shippingCharges: 0,
    totalTax: 0,
    productTotal: 0,
    orderTotal: 0,
    discount: 0,
    codCharges: 0,
    collectableAmount: 0
  });

  // Calculate product total when quantity or unit price changes
  const updateProductTotal = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedProducts[index].productTotal = updatedProducts[index].quantity * updatedProducts[index].unitPrice;
    }
    
    setProducts(updatedProducts);
  };

  // Calculate order total and collectable amount
  useEffect(() => {
    const productsTotal = products.reduce((sum, product) => sum + product.productTotal, 0);
    const orderTotal = productsTotal + payment.shippingCharges + payment.totalTax - payment.discount;
    const collectableAmount = orderDetails.orderType === 'cod' ? orderTotal + payment.codCharges : orderTotal;
    
    setPayment(prev => ({ 
      ...prev, 
      productTotal: productsTotal,
      orderTotal: orderTotal,
      collectableAmount: collectableAmount
    }));
  }, [products, payment.shippingCharges, payment.totalTax, payment.discount, payment.codCharges, orderDetails.orderType]);

  // Generate order ID if not provided
  const generateOrderId = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.floor(Math.random() * 1000);
    return `PPD${timestamp}${random}`;
  };

  // Handle pincode change and auto-fill city/state
  const handlePincodeChange = (pincode: string) => {
    setShippingDetails(prev => ({ ...prev, pincode }));
    
    if (pincode.length === 6) {
      const pincodeData = pincodeMapping[pincode as keyof typeof pincodeMapping];
      if (pincodeData) {
        setShippingDetails(prev => ({
          ...prev,
          city: pincodeData.city,
          state: pincodeData.state
        }));
      }
    }
  };

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: (products.length + 1).toString(),
      productName: '',
      quantity: 1,
      unitPrice: 0,
      productTotal: 0,
      sku: '',
      taxRate: 0,
      hsnCode: ''
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleSave = async () => {
    try {
      let authToken = sessionStorage.getItem('auth_token');
      if (!authToken) authToken = localStorage.getItem('auth_token');
      
      // Generate order ID if not provided
      const finalOrderId = orderDetails.orderId || generateOrderId();
      
      // Base order data
      const orderData: any = {
        order_type: orderDetails.orderType,
        parcel_type: orderDetails.parcelType,
        store_customer_id: null,
        store_customer_address_id: null,
        order_id: finalOrderId,
        shipping_charges: payment.shippingCharges,
        tax_amount: payment.totalTax,
        discount: payment.discount,
        order_total: payment.orderTotal,
        weight: weightDimensions.weight,
        length: weightDimensions.length,
        width: weightDimensions.width,
        height: weightDimensions.height,
        customer_phone: shippingDetails.customerPhone,
        customer_first_name: shippingDetails.customerName,
        address: shippingDetails.address,
        landmark: shippingDetails.landmark,
        customer_email: shippingDetails.customerEmail,
        pin_code: parseInt(shippingDetails.pincode) || 0,
        city: shippingDetails.city,
        state: shippingDetails.state,
        products: products.map(product => ({
          name: product.productName,
          total_price: product.productTotal,
          quantity: product.quantity,
          sku: product.sku,
          price: product.unitPrice,
          tax_rate: product.taxRate,
          hsn_code: product.hsnCode
        }))
      };

      // Add COD-specific fields only for COD orders
      if (orderDetails.orderType === 'cod') {
        orderData.COD_charges = payment.codCharges;
        orderData.collectable_amount = payment.collectableAmount;
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ORDERS), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(authToken),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (response.ok && data.status) {
        toast({
          title: "Success",
          description: "Order created successfully!",
        });
        // Invalidate orders cache so Orders page fetches fresh data
        clearCacheByPrefix(CacheGroups.orders);
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: data?.error?.message || data?.message || 'Failed to create order.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please try again.",
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    // Navigate back to orders page
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Add New Order
          </h1>
          <p className="text-muted-foreground mt-2">Create a new shipping order with all the required details</p>
        </div>

        {/* Order Details */}
        <Card className="shadow-lg border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">1️⃣ Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Order ID (Optional)</label>
                <Input
                  placeholder="Enter order ID or leave blank for auto-generation"
                  value={orderDetails.orderId}
                  onChange={(e) => setOrderDetails({...orderDetails, orderId: e.target.value})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated: {generateOrderId()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Order Type <span className="text-red-500">*</span></label>
                <select
                  value={orderDetails.orderType}
                  onChange={(e) => setOrderDetails({...orderDetails, orderType: e.target.value})}
                  className="w-full h-10 px-3 py-2 bg-background border border-purple-200/50 dark:border-purple-800/50 rounded-md focus:border-purple-400 dark:focus:border-purple-600 focus:ring-2 focus:ring-purple-400/20 outline-none"
                >
                  <option value="prepaid">Prepaid</option>
                  <option value="cod">COD</option>
                  <option value="reverse">Reverse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Parcel Type <span className="text-red-500">*</span></label>
                <select
                  value={orderDetails.parcelType}
                  onChange={(e) => setOrderDetails({...orderDetails, parcelType: e.target.value})}
                  className="w-full h-10 px-3 py-2 bg-background border border-purple-200/50 dark:border-purple-800/50 rounded-md focus:border-purple-400 dark:focus:border-purple-600 focus:ring-2 focus:ring-purple-400/20 outline-none"
                >
                  <option value="parcel">Parcel</option>
                  <option value="document">Document</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Details */}
        <Card className="shadow-lg border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">2️⃣ Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Customer Phone <span className="text-red-500">*</span></label>
              <Input
                type="tel"
                placeholder="Enter customer phone number"
                value={shippingDetails.customerPhone}
                onChange={(e) => setShippingDetails({...shippingDetails, customerPhone: e.target.value})}
                className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
              />
              <p className="text-xs text-red-500 mt-1">
                Search customer address by mobile number and select and create new address.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Customer Name <span className="text-red-500">*</span></label>
                <Input
                  placeholder="Enter customer name"
                  value={shippingDetails.customerName}
                  onChange={(e) => setShippingDetails({...shippingDetails, customerName: e.target.value})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Customer Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="Enter customer email"
                  value={shippingDetails.customerEmail}
                  onChange={(e) => setShippingDetails({...shippingDetails, customerEmail: e.target.value})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address <span className="text-red-500">*</span></label>
              <Input
                placeholder="Enter complete address"
                value={shippingDetails.address}
                onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Landmark (Optional)</label>
                <Input
                  placeholder="Enter landmark"
                  value={shippingDetails.landmark}
                  onChange={(e) => setShippingDetails({...shippingDetails, landmark: e.target.value})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pincode <span className="text-red-500">*</span></label>
                <Input
                  placeholder="Enter pincode"
                  value={shippingDetails.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City <span className="text-red-500">*</span></label>
                <Input
                  placeholder="Enter city"
                  value={shippingDetails.city}
                  onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State <span className="text-red-500">*</span></label>
              <Input
                placeholder="Enter state"
                value={shippingDetails.state}
                onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="shadow-lg border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">3️⃣ Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="border border-purple-200/30 dark:border-purple-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground">Product {index + 1}</h4>
                  {products.length > 1 && (
                    <Button
                      onClick={() => removeProduct(product.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Product Name <span className="text-red-500">*</span></label>
                    <Input
                      placeholder="Enter product name"
                      value={product.productName}
                      onChange={(e) => updateProductTotal(index, 'productName', e.target.value)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Quantity <span className="text-red-500">*</span></label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={product.quantity}
                      onChange={(e) => updateProductTotal(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Unit Price (₹) <span className="text-red-500">*</span></label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={product.unitPrice}
                      onChange={(e) => updateProductTotal(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">SKU (Optional)</label>
                    <Input
                      placeholder="Enter SKU"
                      value={product.sku}
                      onChange={(e) => updateProductTotal(index, 'sku', e.target.value)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tax Rate (%)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={product.taxRate}
                      onChange={(e) => updateProductTotal(index, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">HSN Code</label>
                    <Input
                      placeholder="Enter HSN code"
                      value={product.hsnCode}
                      onChange={(e) => updateProductTotal(index, 'hsnCode', e.target.value)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Product Total:</span>
                    <span className="text-lg font-bold text-purple-700 dark:text-purple-300">₹{product.productTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              onClick={addProduct}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>

        {/* Weight & Dimensions */}
        <Card className="shadow-lg border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">4️⃣ Weight & Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weight (gm) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={weightDimensions.weight}
                  onChange={(e) => setWeightDimensions({...weightDimensions, weight: parseFloat(e.target.value) || 0})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Length (cm) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={weightDimensions.length}
                  onChange={(e) => setWeightDimensions({...weightDimensions, length: parseFloat(e.target.value) || 0})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Width (cm) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={weightDimensions.width}
                  onChange={(e) => setWeightDimensions({...weightDimensions, width: parseFloat(e.target.value) || 0})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Height (cm) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={weightDimensions.height}
                  onChange={(e) => setWeightDimensions({...weightDimensions, height: parseFloat(e.target.value) || 0})}
                  className="border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="shadow-lg border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">5️⃣ Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderDetails.orderType === 'cod' ? (
              // COD Payment Section
              <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Shipping Charges (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={payment.shippingCharges}
                    onChange={(e) => setPayment({...payment, shippingCharges: parseFloat(e.target.value) || 0})}
                    className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total Tax (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={payment.totalTax}
                    onChange={(e) => setPayment({...payment, totalTax: parseFloat(e.target.value) || 0})}
                    className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Discount (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={payment.discount}
                    onChange={(e) => setPayment({...payment, discount: parseFloat(e.target.value) || 0})}
                    className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">COD Charges (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={payment.codCharges}
                    onChange={(e) => setPayment({...payment, codCharges: parseFloat(e.target.value) || 0})}
                    className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Collectable Amount (₹)</label>
                  <Input
                    type="number"
                    value={payment.collectableAmount}
                    onChange={(e) => setPayment({...payment, collectableAmount: parseFloat(e.target.value) || 0})}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 font-semibold text-blue-700 dark:text-blue-400"
                  />
                </div>
              </div>
            ) : (
              // Prepaid/Reverse Payment Section
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Shipping Charges (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={payment.shippingCharges}
                    onChange={(e) => setPayment({...payment, shippingCharges: parseFloat(e.target.value) || 0})}
                    className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total Tax (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={payment.totalTax}
                    onChange={(e) => setPayment({...payment, totalTax: parseFloat(e.target.value) || 0})}
                    className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Discount (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={payment.discount}
                    onChange={(e) => setPayment({...payment, discount: parseFloat(e.target.value) || 0})}
                    className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Product Total (₹)</label>
                  <Input
                    type="number"
                    value={payment.productTotal}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-800 border-purple-200/50 dark:border-purple-800/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order Total (₹)</label>
                  <Input
                    type="number"
                    value={payment.orderTotal}
                    readOnly
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 font-semibold text-green-700 dark:text-green-400"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Save Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddOrder; 