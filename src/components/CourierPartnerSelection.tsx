
import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Package, Truck, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CourierPartner {
  id: string;
  name: string;
  logo: string;
  pickupDate: string;
  deliveryDate: string;
  transitDays: number;
  totalCharges: number;
  chargeBreakdown: {
    baseRate: number;
    fuelCharges: number;
    codCharges?: number;
    gst: number;
    otherSurcharges: number;
  };
}

const CourierPartnerSelection = () => {
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [hoveredCourier, setHoveredCourier] = useState<string | null>(null);

  // Mock order summary data
  const orderSummary = {
    pickupLocation: 'Mumbai, Maharashtra',
    deliveryLocation: 'Pune, Maharashtra',
    orderType: 'COD',
    weight: '2.5 kg',
    volumetricWeight: '3.0 kg'
  };

  // Mock courier partners data
  const courierPartners: CourierPartner[] = [
    {
      id: 'bluedart',
      name: 'BlueDart Express',
      logo: '🚀',
      pickupDate: '2024-01-16',
      deliveryDate: '2024-01-18',
      transitDays: 2,
      totalCharges: 145,
      chargeBreakdown: {
        baseRate: 100,
        fuelCharges: 15,
        codCharges: 20,
        gst: 8,
        otherSurcharges: 2
      }
    },
    {
      id: 'delhivery',
      name: 'Delhivery',
      logo: '📦',
      pickupDate: '2024-01-16',
      deliveryDate: '2024-01-19',
      transitDays: 3,
      totalCharges: 125,
      chargeBreakdown: {
        baseRate: 85,
        fuelCharges: 12,
        codCharges: 18,
        gst: 7,
        otherSurcharges: 3
      }
    },
    {
      id: 'ecom',
      name: 'Ecom Express',
      logo: '⚡',
      pickupDate: '2024-01-17',
      deliveryDate: '2024-01-19',
      transitDays: 2,
      totalCharges: 135,
      chargeBreakdown: {
        baseRate: 95,
        fuelCharges: 14,
        codCharges: 16,
        gst: 7,
        otherSurcharges: 3
      }
    },
    {
      id: 'xpressbees',
      name: 'Xpressbees',
      logo: '🐝',
      pickupDate: '2024-01-16',
      deliveryDate: '2024-01-20',
      transitDays: 4,
      totalCharges: 110,
      chargeBreakdown: {
        baseRate: 75,
        fuelCharges: 10,
        codCharges: 15,
        gst: 6,
        otherSurcharges: 4
      }
    }
  ];

  const handleCourierSelect = (courierId: string) => {
    setSelectedCourier(courierId);
  };

  const handleConfirmSelection = () => {
    if (selectedCourier) {
      const selected = courierPartners.find(c => c.id === selectedCourier);
      console.log('Selected courier:', selected);
      // Handle confirmation logic here
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary Card */}
      <Card className="bg-gradient-to-r from-pink-50/50 to-blue-50/50 dark:from-pink-900/20 dark:to-blue-900/20 border-pink-200/30 dark:border-pink-800/30">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-500" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pickup Location</p>
                <p className="font-medium text-foreground">{orderSummary.pickupLocation}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Delivery Location</p>
                <p className="font-medium text-foreground">{orderSummary.deliveryLocation}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Order Type</p>
                <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">{orderSummary.orderType}</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-medium text-foreground">{orderSummary.weight}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Volumetric Weight</p>
                <p className="font-medium text-foreground">{orderSummary.volumetricWeight}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courier Partners Section */}
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            Select Courier Partner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {courierPartners.map((courier) => (
              <div
                key={courier.id}
                className={`
                  relative p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${selectedCourier === courier.id 
                    ? 'bg-gradient-to-r from-pink-500/10 to-blue-600/10 border-primary shadow-md' 
                    : 'bg-card hover:bg-gradient-to-r hover:from-pink-500/5 hover:to-blue-600/5 hover:border-primary/20 hover:shadow-sm'
                  }
                `}
                onClick={() => handleCourierSelect(courier.id)}
                onMouseEnter={() => setHoveredCourier(courier.id)}
                onMouseLeave={() => setHoveredCourier(null)}
              >
                {/* Selection indicator */}
                <div className="absolute top-3 right-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedCourier === courier.id 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground'
                  }`}>
                    {selectedCourier === courier.id && (
                      <div className="w-full h-full rounded-full bg-primary-foreground scale-50"></div>
                    )}
                  </div>
                </div>

                {/* Courier Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl shadow-md">
                    {courier.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{courier.name}</h3>
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
                      {courier.transitDays} Days Transit
                    </Badge>
                  </div>
                </div>

                {/* Dates and Transit */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup Date</p>
                      <p className="text-sm font-medium text-foreground">{courier.pickupDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery Date</p>
                      <p className="text-sm font-medium text-foreground">{courier.deliveryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Total Charges with Tooltip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-foreground">₹{courier.totalCharges}</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="w-64">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Charge Breakdown</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Base Rate:</span>
                              <span>₹{courier.chargeBreakdown.baseRate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fuel Charges:</span>
                              <span>₹{courier.chargeBreakdown.fuelCharges}</span>
                            </div>
                            {courier.chargeBreakdown.codCharges && (
                              <div className="flex justify-between">
                                <span>COD Charges:</span>
                                <span>₹{courier.chargeBreakdown.codCharges}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>GST:</span>
                              <span>₹{courier.chargeBreakdown.gst}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Other Surcharges:</span>
                              <span>₹{courier.chargeBreakdown.otherSurcharges}</span>
                            </div>
                            <div className="border-t pt-1 flex justify-between font-semibold">
                              <span>Total:</span>
                              <span>₹{courier.totalCharges}</span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {selectedCourier === courier.id && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-blue-600 text-white">
                      Selected
                    </Badge>
                  )}
                </div>

                {/* Hover popup for additional details */}
                {hoveredCourier === courier.id && (
                  <div className="absolute left-full top-0 ml-2 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-purple-200/30 dark:border-purple-800/30 rounded-lg shadow-xl p-4 w-64 animate-fade-in">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{courier.name}</h4>
                        <div className="text-2xl">{courier.logo}</div>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span className="text-muted-foreground">Transit Time: {courier.transitDays} days</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3 text-green-500" />
                          <span className="text-muted-foreground">Pickup: {courier.pickupDate}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          <span className="text-muted-foreground">Delivery: {courier.deliveryDate}</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="text-lg font-bold text-center text-foreground">₹{courier.totalCharges}</div>
                        <div className="text-xs text-center text-muted-foreground">Total Charges</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Confirm Selection Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedCourier}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white px-6 py-2"
            >
              Confirm Selection
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourierPartnerSelection;
