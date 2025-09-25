import { shipmentService } from '@/services/shipmentService';

/**
 * Test utility for bulk booking functionality
 * This file demonstrates how to use the bulk booking APIs
 */

export const testBulkBookingFlow = async () => {
  console.log('🧪 Testing Bulk Booking Flow...');
  
  try {
    // Test data
    const warehouseId = "17";
    const rtoId = "17";
    const orderIds = ["5890", "5891"];
    
    console.log('📦 Test Parameters:', { warehouseId, rtoId, orderIds });
    
    // Step 1: Create bulk booking request
    console.log('\n🔵 Step 1: Creating bulk booking request...');
    const bulkRequestResult = await shipmentService.createBulkBookingRequest(
      warehouseId,
      rtoId,
      orderIds
    );
    
    if (!bulkRequestResult.success) {
      throw new Error(`Failed to create bulk booking request: ${bulkRequestResult.message}`);
    }
    
    const uuid = bulkRequestResult.data?.uuId;
    console.log('✅ Bulk booking request created successfully');
    console.log('📋 UUID:', uuid);
    
    // Step 2: Get courier rates
    console.log('\n🔵 Step 2: Fetching courier rates...');
    const ratesResult = await shipmentService.getBulkBookingRates(uuid!);
    
    if (!ratesResult.success) {
      throw new Error(`Failed to fetch courier rates: ${ratesResult.message}`);
    }
    
    console.log('✅ Courier rates fetched successfully');
    console.log('📊 Rates data:', ratesResult.data);
    
    // Step 3: Process the rates data
    console.log('\n🔵 Step 3: Processing rates data...');
    if (ratesResult.data && ratesResult.data.orders) {
      console.log('📋 Orders with rates:', ratesResult.data.orders.length);
      
      ratesResult.data.orders.forEach((orderData: any, index: number) => {
        console.log(`\n📦 Order ${index + 1}:`, {
          orderId: orderData.order_id,
          courierCount: orderData.courier_rates?.length || 0
        });
        
        if (orderData.courier_rates) {
          orderData.courier_rates.forEach((courierRate: any, courierIndex: number) => {
            console.log(`  🚚 Courier ${courierIndex + 1}:`, {
              name: courierRate.name,
              id: courierRate.courier_partner_id,
              estimatedPickup: courierRate.estimated_pickup,
              estimatedDelivery: courierRate.estimated_delivery,
              totalPayable: courierRate.rate?.[0]?.totalPayable || 'N/A'
            });
          });
        }
      });
    }
    
    console.log('\n🎉 Bulk booking flow test completed successfully!');
    return {
      success: true,
      uuid,
      ratesData: ratesResult.data
    };
    
  } catch (error) {
    console.error('❌ Bulk booking flow test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Test the new combined function that handles both booking and rates in one call
 */
export const testCombinedBulkBookingAndRates = async () => {
  console.log('🧪 Testing Combined Bulk Booking and Rates...');
  
  try {
    const warehouseId = "17";
    const rtoId = "17";
    const orderIds = ["5890", "5891"];
    
    console.log('📦 Test Parameters:', { warehouseId, rtoId, orderIds });
    
    // Single API call that handles both operations
    console.log('\n🚀 Single API call: Creating bulk booking and fetching rates...');
    const result = await shipmentService.createBulkBookingAndGetRates(
      warehouseId,
      rtoId,
      orderIds
    );
    
    if (!result.success) {
      throw new Error(`Failed to create bulk booking and get rates: ${result.message}`);
    }
    
    const { uuId, rates } = result.data!;
    console.log('✅ Combined operation completed successfully');
    console.log('📋 UUID:', uuId);
    console.log('📊 Rates data:', rates);
    
    // Process the rates data
    console.log('\n🔵 Processing rates data...');
    if (rates && rates.orders) {
      console.log('📋 Orders with rates:', rates.orders.length);
      
      rates.orders.forEach((orderData: any, index: number) => {
        console.log(`\n📦 Order ${index + 1}:`, {
          orderId: orderData.order_id,
          courierCount: orderData.courier_rates?.length || 0
        });
        
        if (orderData.courier_rates) {
          orderData.courier_rates.forEach((courierRate: any, courierIndex: number) => {
            console.log(`  🚚 Courier ${courierIndex + 1}:`, {
              name: courierRate.name,
              id: courierRate.courier_partner_id,
              estimatedPickup: courierRate.estimated_pickup,
              estimatedDelivery: courierRate.estimated_delivery,
              totalPayable: courierRate.rate?.[0]?.totalPayable || 'N/A'
            });
          });
        }
      });
    }
    
    console.log('\n🎉 Combined bulk booking and rates test completed successfully!');
    return {
      success: true,
      uuid: uuId,
      ratesData: rates
    };
    
  } catch (error) {
    console.error('❌ Combined bulk booking and rates test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Test individual API functions
 */
export const testCreateBulkBookingRequest = async () => {
  console.log('🧪 Testing createBulkBookingRequest...');
  
  try {
    const result = await shipmentService.createBulkBookingRequest("17", "17", ["5890", "5891"]);
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const testGetBulkBookingRates = async (uuid: string) => {
  console.log('🧪 Testing getBulkBookingRates...');
  
  try {
    const result = await shipmentService.getBulkBookingRates(uuid);
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Debug function to test just the bulk booking request creation
 * This helps isolate where the UUID issue is occurring
 */
export const debugBulkBookingRequest = async () => {
  console.log('🔍 Debug: Testing bulk booking request creation only...');
  
  try {
    const warehouseId = "17";
    const rtoId = "17";
    const orderIds = ["5890"];
    
    console.log('📦 Test Parameters:', { warehouseId, rtoId, orderIds });
    
    // Test just the first step
    const result = await shipmentService.createBulkBookingRequest(
      warehouseId,
      rtoId,
      orderIds
    );
    
    console.log('🔍 Raw result:', result);
    console.log('🔍 Success:', result.success);
    console.log('🔍 Message:', result.message);
    console.log('🔍 Data:', result.data);
    console.log('🔍 UUID found:', result.data?.uuId);
    
    return result;
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testBulkBooking = {
    testBulkBookingFlow,
    testCombinedBulkBookingAndRates,
    testCreateBulkBookingRequest,
    testGetBulkBookingRates,
    debugBulkBookingRequest
  };
  console.log('🧪 Bulk booking test utilities available in window.testBulkBooking');
}
