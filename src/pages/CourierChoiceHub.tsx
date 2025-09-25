import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { RefreshCw, Check, Package, Clock, TrendingUp, Loader2, AlertCircle, Upload, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  CourierPartnerRate, 
  ShippingRateData
} from "@/types/bulkShipping";
import { shipmentService, createBulkShipments, BulkBookingPayload } from "@/services/shipmentService";
import API_CONFIG, { getApiUrl } from "@/config/api";

interface CourierChoiceHubProps {
  selectedOrders?: string[];
  warehouseId?: string;
  rtoId?: string;
}

const CourierChoiceHub: React.FC<CourierChoiceHubProps> = ({ 
  selectedOrders: propSelectedOrders,
  warehouseId: propWarehouseId,
  rtoId: propRtoId
}) => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from location state if passed via navigation
  const locationState = location.state as {
    selectedOrders?: string[];
    warehouseId?: string;
    rtoId?: string;
  } | null;
  const passedSelectedOrders = locationState?.selectedOrders;
  const passedWarehouseId = locationState?.warehouseId;
  const passedRtoId = locationState?.rtoId;
  
  // State for bulk shipping process - use props or location state, fallback to defaults
  const [selectedOrders, setSelectedOrders] = useState<string[]>(
    propSelectedOrders || passedSelectedOrders || []
  );
  const [warehouseId, setWarehouseId] = useState<string>(
    propWarehouseId || passedWarehouseId || "17"
  );
  const [rtoId, setRtoId] = useState<string>(
    propRtoId || passedRtoId || "17"
  );

  // Update selectedOrders when navigation state changes
  useEffect(() => {
    if (passedSelectedOrders && passedSelectedOrders.length > 0) {
      setSelectedOrders(passedSelectedOrders);
    }
  }, [passedSelectedOrders]);
  const [selectedCouriers, setSelectedCouriers] = useState<Record<string, { courierId: number; rateData: ShippingRateData }>>({});
  
  // New state for bulk selection
  const [bulkSelectedOrderIds, setBulkSelectedOrderIds] = useState<string[]>([]);
  const [bulkSelectedCourier, setBulkSelectedCourier] = useState<string>("");
  const [isApplyingBulkAction, setIsApplyingBulkAction] = useState(false);
  
  // State for real API data
  const [orders, setOrders] = useState<any[]>([]);
  const [courierRates, setCourierRates] = useState<Record<string, CourierPartnerRate[]>>({});

  const [bulkBookingUuid, setBulkBookingUuid] = useState<string>("");
  const [isCreatingBulkRequest, setIsCreatingBulkRequest] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Debug events to surface request/response details in UI (dev only)
  const [debugEvents, setDebugEvents] = useState<
    { step: string; method: string; url: string; request?: any; response?: any }[]
  >([]);

  const pushDebugEvent = (event: { step: string; method: string; url: string; request?: any; response?: any }) => {
    if (process.env.NODE_ENV === 'development') {
      setDebugEvents(prev => [{ ...event }, ...prev].slice(0, 10));
    }
  };

  // Create order objects from the selected order IDs
  const createOrderObjects = (orderIds: string[]) => {
    return orderIds.map(id => ({
      id,
      status: "Pending",
      courier: "Not Assigned",
      pickup: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      }),
      delivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      }),
      price: "₹0"
    }));
  };

  // Use real orders data - no mock data fallback
  const displayOrders = orders.length > 0 ? orders : createOrderObjects(selectedOrders);

  // Get courier options from real rates only
  const getCourierOptions = () => {
    // Only return couriers if we have real rates
    if (Object.keys(courierRates).length > 0) {
      const uniqueCouriers = new Map<string, { id: string; name: string; price: string }>();
      
      Object.values(courierRates).forEach(orderRates => {
        orderRates.forEach(rate => {
          if (rate.rate && rate.rate.length > 0) {
            const rateData = rate.rate[0];
            uniqueCouriers.set(rate.courier_partner_id.toString(), {
              id: rate.courier_partner_id.toString(),
              name: rate.name,
              price: `₹${rateData.totalPayable || 0}`
            });
          }
        });
      });
      
      if (uniqueCouriers.size > 0) {
        return Array.from(uniqueCouriers.values());
      }
    }
    
    // No mock data fallback - return empty array
    return [];
  };

  const courierOptions = getCourierOptions();

  // Initialize with real data only - no mock data
  useEffect(() => {
    // Only initialize couriers if we have real courier options from API
    if (courierOptions && courierOptions.length > 0 && displayOrders && displayOrders.length > 0) {
      const initialCouriers: Record<string, { courierId: number; rateData: ShippingRateData }> = {};
      
      displayOrders.forEach((order, index) => {
        const courierIndex = index % courierOptions.length;
        const courier = courierOptions[courierIndex];
        
        if (courier && courier.id) {
          initialCouriers[order.id] = {
            courierId: parseInt(courier.id),
            rateData: {
              freightCharges: parseInt(courier.price.replace('₹', '')),
              parcelAceProfitAmount: 0,
              insuranceCharges: 0,
              codCharges: 0,
              earlyCodCharges: 0,
              gstAmount: 0,
              grossAmount: parseInt(courier.price.replace('₹', '')),
              totalPayable: parseInt(courier.price.replace('₹', '')),
              id: courier.id,
              name: courier.name
            }
          };
        }
      });
      
      setSelectedCouriers(initialCouriers);
    }
  }, [courierOptions, displayOrders]); // Depend on both courierOptions and displayOrders

  // Refresh courier options when rates change
  useEffect(() => {
    // This will trigger a re-render when courierRates changes
    // The getCourierOptions function will be called again with updated rates
  }, [courierRates]);



  // Warehouse options (fallback)
  const warehouseOptions = [
    { id: "17", name: "KarteekEcomDelivery", address: "Sumer nagar ajmer road madanganj kishangarh, Jaipur, Rajasthan" },
    { id: "18", name: "Warehouse 2", address: "Address 2" },
  ];



  const handleCourierSelection = (orderId: string, courierRate: CourierPartnerRate, rateData: ShippingRateData) => {
    setSelectedCouriers(prev => ({
      ...prev,
      [orderId]: {
        courierId: courierRate.courier_partner_id,
        rateData: rateData
      }
    }));
  };

  const getTotalAmount = () => {
    return Object.values(selectedCouriers).reduce((total, selection) => {
      return total + selection.rateData.totalPayable;
    }, 0);
  };

  const getAverageRate = () => {
    const total = getTotalAmount();
    return total > 0 ? Math.round(total / Object.keys(selectedCouriers).length) : 0;
  };

  // Handle bulk order selection
  const handleBulkOrderSelection = (orderId: string, checked: boolean) => {
    if (!orderId) return;
    
    if (checked) {
      setBulkSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setBulkSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  // Handle select all orders
  const handleSelectAllOrders = (checked: boolean) => {
    if (checked && displayOrders && displayOrders.length > 0) {
      setBulkSelectedOrderIds(displayOrders.map(order => order.id));
    } else {
      setBulkSelectedOrderIds([]);
    }
  };

  // Create bulk booking request then fetch rates (two explicit calls for clear debugging)
  const handleGetCourierRates = async (explicitOrderIds?: string[]) => {
    const orderIdsToUse = explicitOrderIds && explicitOrderIds.length > 0 ? explicitOrderIds : bulkSelectedOrderIds;
    if (orderIdsToUse.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select at least one order to get courier rates",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingBulkRequest(true);

    try {
      // Step 1: Create bulk booking request
      const createPayload = {
        warehouse_id: warehouseId,
        rto_id: rtoId,
        order_ids: orderIdsToUse
      };
      const createUrl = getApiUrl(API_CONFIG.ENDPOINTS.BULK_BOOKING_REQUEST);
      pushDebugEvent({ step: 'Step 1 - Request', method: 'POST', url: createUrl, request: createPayload });

      const bulkReqResult = await shipmentService.createBulkBookingRequest(
        warehouseId,
        rtoId,
        orderIdsToUse
      );

      pushDebugEvent({ step: 'Step 1 - Response', method: 'POST', url: createUrl, response: bulkReqResult });

      if (!bulkReqResult.success || !bulkReqResult.data?.uuId) {
        throw new Error(bulkReqResult.message || 'Failed to create bulk booking request');
      }

      const uuId = bulkReqResult.data.uuId;
      setBulkBookingUuid(uuId);

      // Step 2: Fetch rates using UUID
      const ratesPayload = { uuId };
      const ratesUrl = getApiUrl(API_CONFIG.ENDPOINTS.GET_BULK_BOOKING_RATES);
      pushDebugEvent({ step: 'Step 2 - Request', method: 'POST', url: ratesUrl, request: ratesPayload });

      const ratesResult = await shipmentService.getBulkBookingRates(uuId);
      pushDebugEvent({ step: 'Step 2 - Response', method: 'POST', url: ratesUrl, response: ratesResult });

      if (!ratesResult.success) {
        throw new Error(ratesResult.message || 'Failed to fetch courier rates');
      }

      // Adapt to API shape: data.orderData.orders[*].courier_partner_rates
      const apiPayload = ratesResult.data;
      const orderData = apiPayload?.orderData || apiPayload;

      const processedRates: Record<string, CourierPartnerRate[]> = {};

      const ordersArray: any[] = Array.isArray(orderData?.orders) ? orderData.orders : [];
      ordersArray.forEach((orderItem: any) => {
        const orderId = (orderItem?.id ?? orderItem?.order_id)?.toString();
        if (!orderId) return;

        const rawRates = Array.isArray(orderItem?.courier_partner_rates) ? orderItem.courier_partner_rates : [];
        // Filter out empty array placeholders and map to our type
        const mappedRates: CourierPartnerRate[] = rawRates
          .filter((r: any) => r && typeof r === 'object' && !Array.isArray(r))
          .map((r: any) => {
            const rateArray = Array.isArray(r.rate) ? r.rate : [];
            const mappedRateArray = rateArray.map((rr: any) => ({
              freightCharges: rr?.freightCharges ?? 0,
              parcelAceProfitAmount: rr?.parcelAceProfitAmount ?? 0,
              insuranceCharges: rr?.insuranceCharges ?? 0,
              codCharges: rr?.codCharges ?? 0,
              earlyCodCharges: rr?.earlyCodCharges ?? 0,
              gstAmount: rr?.gstAmount ?? 0,
              grossAmount: rr?.grossAmount ?? 0,
              totalPayable: rr?.totalPayable ?? 0,
              id: (rr?.id ?? '').toString(),
              name: rr?.name ?? r?.name ?? ''
            }));

            const mapped: CourierPartnerRate = {
              estimated_pickup: r?.estimated_pickup ?? '',
              estimated_delivery: r?.estimated_delivery ?? '',
              rate: mappedRateArray,
              name: r?.name ?? '',
              courier_partner_id: r?.courier_partner_id ?? 0,
              mode: r?.mode ?? '',
              weight: r?.weight ?? 0,
              destination: r?.destination ?? '',
              origin: r?.origin ?? '',
              rating: r?.rating ?? null,
              payment_type: r?.payment_type ?? '',
              chargeType: r?.chargeType ?? '',
              baseRate: r?.baseRate ?? null
            };
            return mapped;
          });

        processedRates[orderId] = mappedRates;
      });

      setCourierRates(processedRates);

      toast({
        title: "Courier Rates Retrieved Successfully",
        description: `Successfully created booking and fetched rates for ${Object.keys(processedRates).length} orders`,
      });

    } catch (error) {
      console.error("❌ Error getting courier rates:", error);
      toast({
        title: "Error Getting Courier Rates",
        description: error instanceof Error ? error.message : "Failed to get courier rates",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBulkRequest(false);
    }
  };

  // Auto-select incoming order IDs and trigger API calls once on mount/navigation
  useEffect(() => {
    if (!autoTriggered && selectedOrders && selectedOrders.length > 0) {
      setBulkSelectedOrderIds(selectedOrders);
      setAutoTriggered(true);
      // Trigger immediately with explicit IDs to avoid state race
      handleGetCourierRates(selectedOrders);
    }
  }, [selectedOrders, autoTriggered]);

  // Apply bulk courier selection to all selected orders
  const handleApplyBulkCourier = async () => {
    if (bulkSelectedOrderIds.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select at least one order to apply bulk courier",
        variant: "destructive"
      });
      return;
    }

    // Allow two modes:
    // 1) bulkSelectedCourier chosen → apply to all selected
    // 2) no bulk courier → use each row's existing selection; require all selected have one
    const canUseExistingSelections = bulkSelectedOrderIds.every(id => !!selectedCouriers[id]);
    if (!bulkSelectedCourier && !canUseExistingSelections) {
      toast({
        title: "Courier Not Selected",
        description: "Select a bulk courier above or choose a courier for each selected order.",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingBulkAction(true);

    try {
      // If bulk courier selected, apply it; otherwise use existing row selections
      let newSelectedCouriers = { ...selectedCouriers };
      if (bulkSelectedCourier) {
        const currentCourierOptions = courierOptions || [];
        const bulkCourier = currentCourierOptions.find(c => c.id === bulkSelectedCourier);
        if (!bulkCourier) {
          throw new Error("Invalid courier selection");
        }

        const rateData: ShippingRateData = {
          freightCharges: parseInt(bulkCourier.price.replace('₹', '')),
          parcelAceProfitAmount: 0,
          insuranceCharges: 0,
          codCharges: 0,
          earlyCodCharges: 0,
          gstAmount: 0,
          grossAmount: parseInt(bulkCourier.price.replace('₹', '')),
          totalPayable: parseInt(bulkCourier.price.replace('₹', '')),
          id: bulkCourier.id,
          name: bulkCourier.name
        };

        bulkSelectedOrderIds.forEach(orderId => {
          newSelectedCouriers[orderId] = {
            courierId: parseInt(bulkCourier.id),
            rateData: rateData
          };
        });

        setSelectedCouriers(newSelectedCouriers);
      }

      // Build payload for bulk shipment creation
      const payload: BulkBookingPayload = {
        warehouse_id: warehouseId,
        rto_id: rtoId,
        order_ids: {}
      };

      bulkSelectedOrderIds.forEach(orderId => {
        const selection = newSelectedCouriers[orderId];
        payload.order_ids[orderId] = {
          rates: {
            order_id: parseInt(orderId),
            courier_partner_id: selection.courierId,
            shippingRateData: selection.rateData
          }
        };
      });

      // Debug panel logging
      const createUrl = getApiUrl(API_CONFIG.ENDPOINTS.BULK_BOOKING_CREATE);
      pushDebugEvent({ step: 'Create Shipments - Request', method: 'POST', url: createUrl, request: payload });

      const createResult = await createBulkShipments({ ...payload, auto_pickup: 1 });
      pushDebugEvent({ step: 'Create Shipments - Response', method: 'POST', url: createUrl, response: createResult });

      if (!createResult.success) {
        throw new Error(createResult.message || 'Bulk shipment creation failed (after retries)');
      }

      toast({
        title: "Shipments Queued",
        description: createResult.message || `Queued ${bulkSelectedOrderIds.length} shipment(s)`,
      });

      // Clear bulk selection
      setBulkSelectedOrderIds([]);
      setBulkSelectedCourier("");

    } catch (error) {
      console.error("❌ Error applying bulk courier:", error);
      toast({
        title: "Shipment Queue Error",
        description: error instanceof Error ? error.message : "Failed to queue shipments. Retried a few times.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingBulkAction(false);
    }
  };

  // Handle individual courier selection
  const handleIndividualCourierSelection = (orderId: string, courierId: string) => {
    if (!orderId || !courierId) return;
    // First try to find real rate data from the API
    const realRates = courierRates[orderId];
    let selectedRateData: ShippingRateData | null = null;

    if (realRates && realRates.length > 0) {
      // Find the selected courier from real rates
      const selectedCourierRate = realRates.find(rate => 
        rate.courier_partner_id.toString() === courierId
      );
      
      if (selectedCourierRate && selectedCourierRate.rate && selectedCourierRate.rate.length > 0) {
        const rate = selectedCourierRate.rate[0];
        selectedRateData = {
          freightCharges: rate.freightCharges || 0,
          parcelAceProfitAmount: rate.parcelAceProfitAmount || 0,
          insuranceCharges: rate.insuranceCharges || 0,
          codCharges: rate.codCharges || 0,
          earlyCodCharges: rate.earlyCodCharges || 0,
          gstAmount: rate.gstAmount || 0,
          grossAmount: rate.grossAmount || 0,
          totalPayable: rate.totalPayable || 0,
          id: selectedCourierRate.courier_partner_id.toString(),
          name: selectedCourierRate.name
        };
      }
    }

    // Fallbacks if real rates not available or mapping failed
    if (!selectedRateData) {
      const currentCourierOptions = courierOptions || [];
      const selectedCourier = currentCourierOptions.find(c => c.id === courierId);
      if (selectedCourier) {
        selectedRateData = {
          freightCharges: parseInt(selectedCourier.price.replace('₹', '')),
          parcelAceProfitAmount: 0,
          insuranceCharges: 0,
          codCharges: 0,
          earlyCodCharges: 0,
          gstAmount: 0,
          grossAmount: parseInt(selectedCourier.price.replace('₹', '')),
          totalPayable: parseInt(selectedCourier.price.replace('₹', '')),
          id: selectedCourier.id,
          name: selectedCourier.name
        };
      } else {
        // Minimal guard to always allow selection change
        selectedRateData = {
          freightCharges: 0,
          parcelAceProfitAmount: 0,
          insuranceCharges: 0,
          codCharges: 0,
          earlyCodCharges: 0,
          gstAmount: 0,
          grossAmount: 0,
          totalPayable: 0,
          id: courierId,
          name: 'Selected Courier'
        };
      }
    }

    // Update the selected couriers
    setSelectedCouriers(prev => {
      const next = { ...prev };
      next[orderId] = {
        courierId: parseInt(selectedRateData!.id),
        rateData: selectedRateData!
      };
      return next;
    });

    // Remove from bulk selection if it was there
    setBulkSelectedOrderIds(prev => prev.filter(id => id !== orderId));

    // Debug
    pushDebugEvent({
      step: 'Row courier changed',
      method: 'LOCAL',
      url: `order:${orderId}`,
      request: { courierId },
      response: { totalPayable: selectedRateData.totalPayable }
    });
  };

  // Get courier usage statistics
  const getCourierUsageStats = () => {
    const usage: Record<string, number> = {};
    Object.values(selectedCouriers).forEach(selection => {
      const courierName = selection.rateData.name;
      usage[courierName] = (usage[courierName] || 0) + 1;
    });
    
    return Object.entries(usage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get courier name for display
  const getCourierDisplayName = (orderId: string) => {
    const selection = selectedCouriers[orderId];
    if (selection) {
      return `${selection.rateData.name} - ₹${selection.rateData.totalPayable}`;
    }
    return "Select Courier";
  };

  // Check if order has courier assigned
  const hasCourierAssigned = (orderId: string) => {
    return selectedCouriers.hasOwnProperty(orderId);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Courier Choice Hub</h1>
          <p className="text-gray-600 mt-2">Select preferred courier partners for efficient shipment management</p>
          
          {selectedOrders.length === 0 ? (
            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-amber-800">
              ⚠️ <strong>No Orders Selected:</strong> Please go back to the Orders page, select orders using checkboxes, and click "Bulk Ship" to get courier rates.
              </p>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-blue-800">
                💡 <strong>Bulk Selection Tip:</strong> Use the checkboxes to select multiple orders, then click "Get Courier Rates" to automatically create booking and fetch rates, and finally "Apply Bulk Action" to assign the same courier to all selected orders at once.
              </p>
            </div>
          )}
        </div>

        {/* Debug Information - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-yellow-800">🔍 Debug Information</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs"
                    onClick={() => {
                      const debugData = {
                        ordersFromNavigation: selectedOrders.length,
                        displayOrders: displayOrders?.length || 0,
                        warehouseId: warehouseId,
                        rtoId: rtoId,
                        bulkSelected: bulkSelectedOrderIds.length,
                        bulkBookingUuid: bulkBookingUuid || 'None',
                        ratesRetrieved: Object.keys(courierRates).length,
                        courierOptions: courierOptions?.length || 0,
                        selectedOrderIds: selectedOrders,
                        recentApiCalls: debugEvents.slice(0, 4)
                      };
                      navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
                      toast({
                        title: "Copied!",
                        description: "All debug information copied to clipboard",
                        variant: "default",
                      });
                    }}
                  >
                    📋 Copy All Debug
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span><strong>Orders from Navigation:</strong> {selectedOrders.length} IDs</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOrders.length.toString());
                          toast({
                            title: "Copied!",
                            description: "Orders count copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span><strong>Display Orders:</strong> {displayOrders?.length || 0} objects</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText((displayOrders?.length || 0).toString());
                          toast({
                            title: "Copied!",
                            description: "Display orders count copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span><strong>Warehouse ID:</strong> {warehouseId}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText(warehouseId);
                          toast({
                            title: "Copied!",
                            description: "Warehouse ID copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span><strong>RTO ID:</strong> {rtoId}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText(rtoId);
                          toast({
                            title: "Copied!",
                            description: "RTO ID copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span><strong>Bulk Selected:</strong> {bulkSelectedOrderIds.length} orders</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText(bulkSelectedOrderIds.length.toString());
                          toast({
                            title: "Copied!",
                            description: "Bulk selected count copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span><strong>Bulk Booking UUID:</strong> {bulkBookingUuid || 'None'}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText(bulkBookingUuid || 'None');
                          toast({
                            title: "Copied!",
                            description: "Bulk booking UUID copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋 Copy UUID
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span><strong>Rates Retrieved:</strong> {Object.keys(courierRates).length} orders</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText(Object.keys(courierRates).length.toString());
                          toast({
                            title: "Copied!",
                            description: "Rates retrieved count copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span><strong>Courier Options:</strong> {courierOptions?.length || 0} available</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText((courierOptions?.length || 0).toString());
                          toast({
                            title: "Copied!",
                            description: "Courier options count copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋
                      </Button>
                    </div>
                  </div>
                </div>
                {selectedOrders.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span><strong>Order IDs from Orders page:</strong> {selectedOrders.join(', ')}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOrders.join(', '));
                          toast({
                            title: "Copied!",
                            description: "Order IDs copied to clipboard",
                            variant: "default",
                          });
                        }}
                      >
                        📋 Copy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Recent API debug events */}
                {debugEvents.length > 0 && (
                  <div className="mt-3 p-2 bg-white border border-yellow-200 rounded">
                    <div className="font-medium text-yellow-800 mb-1">Recent API Calls</div>
                    <div className="space-y-2">
                      {debugEvents.slice(0, 4).map((e, idx) => (
                        <div key={idx} className="text-[11px] leading-relaxed border border-gray-200 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span><strong>{e.step}</strong> — {e.method} {e.url}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-[10px]"
                                onClick={() => {
                                  const fullData = {
                                    step: e.step,
                                    method: e.method,
                                    url: e.url,
                                    request: e.request,
                                    response: e.response
                                  };
                                  navigator.clipboard.writeText(JSON.stringify(fullData, null, 2));
                                  toast({
                                    title: "Copied!",
                                    description: "Full API call data copied to clipboard",
                                    variant: "default",
                                  });
                                }}
                              >
                                📋 Copy All
                              </Button>
                              {e.request && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-[10px]"
                                  onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(e.request, null, 2));
                                    toast({
                                      title: "Copied!",
                                      description: "Request data copied to clipboard",
                                      variant: "default",
                                    });
                                  }}
                                >
                                  📋 Copy Req
                                </Button>
                              )}
                              {e.response && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-[10px]"
                                  onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(e.response, null, 2));
                                    toast({
                                      title: "Copied!",
                                      description: "Response data copied to clipboard",
                                      variant: "default",
                                    });
                                  }}
                                >
                                  📋 Copy Res
                                </Button>
                              )}
                            </div>
                          </div>
                          {e.request && (
                            <div className="truncate bg-gray-50 p-1 rounded">
                              <span className="font-medium">req:</span> {JSON.stringify(e.request)}
                            </div>
                          )}
                          {e.response && (
                            <div className="truncate bg-gray-50 p-1 rounded">
                              <span className="font-medium">res:</span> {JSON.stringify(e.response)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{displayOrders?.length || 0}</p>
                  <p className="text-xs text-gray-500">Ready for shipment</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rates Retrieved</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(courierRates).length}</p>
                  <p className="text-xs text-gray-500">Orders with rates</p>
                </div>
                <Truck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Rate</p>
                  <p className="text-2xl font-bold text-gray-900">₹{getAverageRate() || 77}</p>
                  <p className="text-xs text-gray-500">Per shipment</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₹{getTotalAmount() || 618}</p>
                  <p className="text-xs text-gray-500">Estimated cost</p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Selection Summary */}
        {bulkSelectedOrderIds.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Row 1: Selection Info */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {bulkSelectedOrderIds.length} order(s) selected for bulk action
                      {displayOrders && displayOrders.length > 0 && (
                        <span className="text-xs text-blue-600 ml-2">
                          (from {displayOrders.length} available orders)
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-700">Selected courier:</span>
                    <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                      {bulkSelectedCourier ? courierOptions.find(c => c.id === bulkSelectedCourier)?.name : 'Not selected'}
                    </Badge>
                  </div>
                </div>

                {/* Row 2: Process Status */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${bulkSelectedOrderIds.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">Orders Selected</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${bulkBookingUuid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">Rates Retrieved</span>
                    {bulkBookingUuid && (
                      <Badge variant="outline" className="text-xs">
                        UUID: {bulkBookingUuid.substring(0, 8)}...
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${Object.keys(courierRates).length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">Ready for Assignment</span>
                    {isCreatingBulkRequest && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Upload Shipment Table */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Bulk Upload Shipment</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Bulk Action Controls */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-4">
                {/* Row 1: Selection Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={displayOrders && displayOrders.length > 0 && bulkSelectedOrderIds.length === displayOrders.length}
                      onCheckedChange={handleSelectAllOrders}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({bulkSelectedOrderIds.length}/{displayOrders?.length || 0})
                    </span>
                  </div>
                  
                  {/* Courier Selection - Always Visible */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Bulk courier for selected orders:</span>
                    
                    {/* Fallback display if Select doesn't work */}
                                                              {(() => {
                       const currentCourierOptions = courierOptions || [];
                       return currentCourierOptions && currentCourierOptions.length > 0 ? (
                         <Select value={bulkSelectedCourier} onValueChange={setBulkSelectedCourier}>
                           <SelectTrigger className="w-48">
                             <SelectValue placeholder="Select Courier Partner" />
                           </SelectTrigger>
                           <SelectContent>
                             {currentCourierOptions.map((courier) => (
                               <SelectItem key={courier.id} value={courier.id}>
                                 {courier.name} - {courier.price}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       ) : (
                         <div className="w-48 p-2 border border-amber-300 bg-amber-50 text-amber-700 text-sm rounded">
                           <div className="text-xs">
                             <div className="font-medium">No courier rates available</div>
                             <div className="text-amber-600">Click "Get Courier Rates" to automatically create booking and fetch rates</div>
                           </div>
                         </div>
                       );
                     })()}
                    
                    {/* Debug info */}
                    <span className="text-xs text-gray-500">
                      ({courierOptions?.length || 0} options)
                    </span>
                    {/* Test button to verify selection */}
                    {bulkSelectedCourier && courierOptions && courierOptions.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        ✓ {courierOptions.find(c => c.id === bulkSelectedCourier)?.name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Row 2: Action Buttons - Only when orders are selected */}
                {bulkSelectedOrderIds.length > 0 && (
                  <div className="flex items-center space-x-2">
                                          {/* Get Courier Rates - Single button that handles both booking and rates */}
                      <Button
                        onClick={() => handleGetCourierRates()}
                        disabled={isCreatingBulkRequest}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isCreatingBulkRequest ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Getting Rates...
                          </>
                        ) : (
                          'Get Courier Rates'
                        )}
                      </Button>

                    {/* Step 2: Apply Bulk Courier (only after rates are fetched) */}
                    {bulkBookingUuid && (
                      <Button
                        onClick={handleApplyBulkCourier}
                        disabled={(() => {
                          if (isApplyingBulkAction) return true;
                          if (bulkSelectedCourier) return false;
                          // enable if every selected order already has an assigned courier
                          return !bulkSelectedOrderIds.every(id => !!selectedCouriers[id]);
                        })()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isApplyingBulkAction ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply Bulk Action'
                        )}
                      </Button>
                    )}

                    {/* Refresh Rates Button */}
                    {bulkBookingUuid && (
                      <Button
                        onClick={() => {
                          // Re-fetch rates if needed
                          handleGetCourierRates();
                        }}
                        disabled={isCreatingBulkRequest}
                        variant="outline"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {isCreatingBulkRequest ? (
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
                    )}
                    
                    <Button
                      onClick={() => {
                        setBulkSelectedOrderIds([]);
                        setBulkSelectedCourier("");
                        setBulkBookingUuid("");
                        setCourierRates({});
                      }}
                      variant="outline"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
                
                {/* Row 3: Instructions */}
                {bulkSelectedOrderIds.length === 0 && (
                  <div className="text-sm text-gray-600 italic">
                    💡 Select orders using checkboxes above, then click "Get Courier Rates" to automatically create booking and fetch rates, and finally "Apply Bulk Action" to assign the selected courier.
                  </div>
                )}
                
                {/* Row 4: No Orders Selected Message */}
                {selectedOrders.length === 0 && (
                  <div className="text-sm text-amber-600 italic bg-amber-50 p-3 rounded-lg border border-amber-200">
                    ⚠️ <strong>No Orders Available:</strong> Please go back to the Orders page, select orders using checkboxes, and click "Bulk Ship" to get courier rates.
                  </div>
                )}
                
                {/* Row 4: Process Instructions */}
                {bulkSelectedOrderIds.length > 0 && (
                  <div className="text-sm text-gray-600 italic">
                    💡 <strong>Step 1:</strong> Click "Get Courier Rates" to automatically create booking and fetch courier rates. 
                    <strong>Step 2:</strong> Select your preferred courier and click "Apply Bulk Action" to assign it to all selected orders.
                  </div>
                )}
                
                {/* Row 5: No Courier Options Message */}
                {bulkSelectedOrderIds.length > 0 && (!courierOptions || courierOptions.length === 0) && (
                  <div className="text-sm text-blue-600 italic bg-blue-50 p-3 rounded-lg border border-blue-200">
                    ℹ️ <strong>Ready for Step 1:</strong> You have selected {bulkSelectedOrderIds.length} order(s). Click "Get Courier Rates" to automatically create booking and fetch rates.
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 w-12">
                      <div className="flex flex-col items-center space-y-1">
                        <Checkbox
                          checked={displayOrders && displayOrders.length > 0 && bulkSelectedOrderIds.length === displayOrders.length}
                          onCheckedChange={handleSelectAllOrders}
                        />
                        {bulkSelectedOrderIds.length > 0 && (
                          <span className="text-xs text-blue-600 font-medium">
                            {bulkSelectedOrderIds.length}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">Order Number</TableHead>
                    <TableHead className="font-semibold text-gray-700">Courier Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Pickup Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Delivery Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOrders && displayOrders.length > 0 ? (
                    displayOrders.map((order) => {
                      const orderRates = courierRates[order.id] || [];
                      const hasOptions = orderRates.length > 0;
                      const selectedPrice = selectedCouriers[order.id]?.rateData.totalPayable;
                      return (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={bulkSelectedOrderIds.includes(order.id)}
                            onCheckedChange={(checked) => handleBulkOrderSelection(order.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <Select 
                            key={`${order.id}-${orderRates.length}-${selectedCouriers[order.id]?.courierId || 'none'}`}
                            value={hasCourierAssigned(order.id) ? selectedCouriers[order.id]?.courierId.toString() : undefined}
                            onValueChange={(value) => {
                              console.log('Row select change →', order.id, value);
                              handleIndividualCourierSelection(order.id, String(value));
                            }}
                            onOpenChange={(open) => open && pushDebugEvent({ step: 'Open row select', method: 'LOCAL', url: `order:${order.id}`, request: { options: orderRates.length } })}
                          >
                            <SelectTrigger className="w-56">
                              <SelectValue placeholder="Select Courier">
                                {hasCourierAssigned(order.id) 
                                  ? `${selectedCouriers[order.id]?.rateData.name} - ₹${selectedCouriers[order.id]?.rateData.totalPayable}`
                                  : hasOptions ? "Select Courier" : "No couriers available"
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {hasOptions ? (
                                orderRates
                                  .filter(r => r && r.name && r.courier_partner_id)
                                  .map((rate) => (
                                    <SelectItem key={rate.courier_partner_id} value={rate.courier_partner_id.toString()}>
                                      {rate.name} - ₹{rate.rate && rate.rate.length > 0 ? rate.rate[0].totalPayable || 0 : 0}
                                    </SelectItem>
                                  ))
                              ) : (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                  No courier rates available yet
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          {hasCourierAssigned(order.id) && (
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-xs">
                                ✓ {selectedCouriers[order.id]?.rateData.name} Assigned
                              </Badge>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">{order.pickup}</TableCell>
                        <TableCell className="text-gray-600">{order.delivery}</TableCell>
                        <TableCell className="font-semibold text-gray-900">{selectedPrice ? `₹${selectedPrice}` : '—'}</TableCell>
                      </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="space-y-2">
                          <div className="text-lg font-medium">No orders available</div>
                          <div className="text-sm text-gray-400">
                            Please go back to the Orders page, select orders using checkboxes, and click "Bulk Ship" to get courier rates.
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>




      </div>
    </div>
  );
};

export default CourierChoiceHub;

