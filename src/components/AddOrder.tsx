import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import OnboardingLayout from './OnboardingLayout';
import pincodeMapping from '@/data/pincode-city-state.json';

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
    let prefix = 'PPD'; // Default for prepaid
    if (orderDetails.orderType === 'cod') {
      prefix = 'COD';
    } else if (orderDetails.orderType === 'reverse') {
      prefix = 'RVP';
    }
    return `${prefix}${timestamp}`;
  };

  // Auto-populate city and state from pincode
  const handlePincodeChange = (pincode: string) => {
    setShippingDetails({...shippingDetails, pincode: pincode});
    
    // Auto-populate city and state if pincode is found in mapping
    if (pincode && pincode.length === 6) {
      const pincodeData = pincodeMapping[pincode as keyof typeof pincodeMapping];
      if (pincodeData) {
        setShippingDetails(prev => ({
          ...prev,
          pincode: pincode,
          city: pincodeData.city,
          state: pincodeData.state
        }));
      }
    }
  };

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
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
          description: "Order created successfully!",
        });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
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

        {/* Product Details */}
        <Card className="shadow-lg border-purple-200/30 dark:border-purple-800/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-foreground">3️⃣ Product Details</CardTitle>
            <Button
              onClick={addProduct}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
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
                      value={product.unitPrice}
                      onChange={(e) => updateProductTotal(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Product Total (₹)</label>
                    <Input
                      type="number"
                      value={product.productTotal}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-800 border-purple-200/50 dark:border-purple-800/50"
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
                    <label className="block text-sm font-medium text-foreground mb-2">Tax Rate % (Optional)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={product.taxRate}
                      onChange={(e) => updateProductTotal(index, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">HSN Code (Optional)</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="HSN Code"
                        value={product.hsnCode}
                        onChange={(e) => updateProductTotal(index, 'hsnCode', e.target.value)}
                        className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                      />
                      {products.length > 1 && (
                        <Button
                          onClick={() => removeProduct(product.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weight & Dimensions */}
        <Card className="shadow-lg border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">4️⃣ Weight & Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weight (grams) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter weight"
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
                  placeholder="Length"
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
                  placeholder="Width"
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
                  placeholder="Height"
                  value={weightDimensions.height}
                  onChange={(e) => setWeightDimensions({...weightDimensions, height: parseFloat(e.target.value) || 0})}
                  className="border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card className="shadow-lg border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">5️⃣ Payment Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderDetails.orderType === 'prepaid' ? (
              // Prepaid Payment Section
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
            ) : orderDetails.orderType === 'cod' ? (
              // COD Payment Section
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-4">
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
              </div>
            ) : (
              // Reverse Payment Section (same as Prepaid for now)
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