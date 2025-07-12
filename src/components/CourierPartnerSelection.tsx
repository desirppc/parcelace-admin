
import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Package, 
  Weight, 
  Calendar, 
  Clock, 
  Info,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface CourierPartner {
  id: string;
  name: string;
  logo: string;
  pickupDate: string;
  deliveryDate: string;
  transitDays: number;
  totalCharges: number;
  chargesBreakdown: {
    baseRate: number;
    fuelSurcharge: number;
    gst: number;
    codCharges?: number;
    otherCharges?: number;
  };
  rating: number;
  features: string[];
}

interface OrderSummary {
  pickupLocation: string;
  deliveryLocation: string;
  orderType: 'Prepaid' | 'COD';
  weight: number;
  volumetricWeight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

const CourierPartnerSelection = () => {
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);

  const orderSummary: OrderSummary = {
    pickupLocation: "Mumbai, Maharashtra - 400001",
    deliveryLocation: "Delhi, Delhi - 110001", 
    orderType: "COD",
    weight: 2.5,
    volumetricWeight: 3.2,
    dimensions: { length: 30, width: 25, height: 15 }
  };

  const courierPartners: CourierPartner[] = [
    {
      id: "delhivery",
      name: "Delhivery",
      logo: "🚚",
      pickupDate: "2025-01-13",
      deliveryDate: "2025-01-15",
      transitDays: 2,
      totalCharges: 145.50,
      chargesBreakdown: {
        baseRate: 120,
        fuelSurcharge: 12,
        gst: 13.50,
        codCharges: 0
      },
      rating: 4.5,
      features: ["Real-time Tracking", "SMS Updates", "Express Delivery"]
    },
    {
      id: "bluedart",
      name: "Blue Dart",
      logo: "📦",
      pickupDate: "2025-01-13",
      deliveryDate: "2025-01-14",
      transitDays: 1,
      totalCharges: 189.75,
      chargesBreakdown: {
        baseRate: 155,
        fuelSurcharge: 15.50,
        gst: 19.25,
        codCharges: 0
      },
      rating: 4.8,
      features: ["Same Day Delivery", "Premium Service", "Insurance Included"]
    },
    {
      id: "dtdc",
      name: "DTDC",
      logo: "🚛",
      pickupDate: "2025-01-13", 
      deliveryDate: "2025-01-16",
      transitDays: 3,
      totalCharges: 98.25,
      chargesBreakdown: {
        baseRate: 80,
        fuelSurcharge: 8,
        gst: 10.25,
        codCharges: 0
      },
      rating: 4.2,
      features: ["Economic Option", "Wide Network", "COD Available"]
    },
    {
      id: "ecom",
      name: "Ecom Express",
      logo: "⚡",
      pickupDate: "2025-01-13",
      deliveryDate: "2025-01-15", 
      transitDays: 2,
      totalCharges: 132.80,
      chargesBreakdown: {
        baseRate: 110,
        fuelSurcharge: 11,
        gst: 11.80,
        codCharges: 0
      },
      rating: 4.3,
      features: ["E-commerce Specialist", "Easy Returns", "Bulk Discounts"]
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCourierSelect = (courierId: string) => {
    setSelectedCourier(courierId);
  };

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
                <p className="font-medium text-sm">{orderSummary.pickupLocation}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Location</p>
                <p className="font-medium text-sm">{orderSummary.deliveryLocation}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Type</p>
                <p className="font-medium text-sm">{orderSummary.orderType}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Weight className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-medium text-sm">{orderSummary.weight} kg</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Weight className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volumetric Weight</p>
                <p className="font-medium text-sm">{orderSummary.volumetricWeight} kg</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dimensions (L×W×H)</p>
                <p className="font-medium text-sm">
                  {orderSummary.dimensions.length}×{orderSummary.dimensions.width}×{orderSummary.dimensions.height} cm
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courier Partners Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Select Courier Partner</span>
        </h2>

        <div className="grid gap-4">
          {courierPartners.map((courier) => (
            <Card
              key={courier.id}
              className={`transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-purple-500/20 ${
                selectedCourier === courier.id
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/30 dark:to-blue-900/30'
                  : 'hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-blue-50/30 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20'
              }`}
              onClick={() => handleCourierSelect(courier.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                      {courier.logo}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{courier.name}</h3>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.floor(courier.rating)
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
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Pickup</span>
                      </div>
                      <p className="font-medium text-sm">
                        {formatDate(courier.pickupDate)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Delivery</span>
                      </div>
                      <p className="font-medium text-sm">
                        {formatDate(courier.deliveryDate)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Transit</span>
                      </div>
                      <p className="font-medium text-sm">
                        {courier.transitDays} {courier.transitDays === 1 ? 'Day' : 'Days'}
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
                                  <span>Base Rate:</span>
                                  <span>₹{courier.chargesBreakdown.baseRate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Fuel Surcharge:</span>
                                  <span>₹{courier.chargesBreakdown.fuelSurcharge}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>GST (18%):</span>
                                  <span>₹{courier.chargesBreakdown.gst}</span>
                                </div>
                                {courier.chargesBreakdown.codCharges && (
                                  <div className="flex justify-between">
                                    <span>COD Charges:</span>
                                    <span>₹{courier.chargesBreakdown.codCharges}</span>
                                  </div>
                                )}
                                <hr className="border-gray-200 dark:border-gray-700" />
                                <div className="flex justify-between font-semibold">
                                  <span>Total:</span>
                                  <span>₹{courier.totalCharges}</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                        ₹{courier.totalCharges}
                      </p>
                    </div>

                    <Button
                      variant={selectedCourier === courier.id ? "default" : "outline"}
                      className={`px-6 ${
                        selectedCourier === courier.id
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
                          : 'border-purple-200 dark:border-purple-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 hover:border-purple-300 dark:hover:border-purple-600'
                      } transition-all duration-300`}
                    >
                      {selectedCourier === courier.id ? (
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
                  {courier.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {selectedCourier && (
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="px-6 border-purple-200 dark:border-purple-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
          >
            Back
          </Button>
          <Button className="px-8 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            Proceed to Booking
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourierPartnerSelection;
