import { shipmentService } from '@/services/shipmentService';

/**
 * Test file to demonstrate Shipment Cancel API functionality
 * This file can be used to test both single and bulk shipment cancellation
 */

export const testSingleShipmentCancel = async (awb: string) => {
  console.log('🧪 Testing Single Shipment Cancel API');
  console.log('📦 AWB:', awb);
  
  try {
    const result = await shipmentService.cancelShipment(awb);
    
    if (result.success) {
      console.log('✅ Single shipment cancelled successfully:', result.message);
      console.log('📊 Response data:', result.data);
    } else {
      console.error('❌ Single shipment cancellation failed:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Error testing single shipment cancel:', error);
    throw error;
  }
};

export const testBulkShipmentCancel = async (awbs: string[]) => {
  console.log('🧪 Testing Bulk Shipment Cancel API');
  console.log('📦 AWBs:', awbs);
  
  try {
    const result = await shipmentService.cancelBulkShipments(awbs);
    
    if (result.success) {
      console.log('✅ Bulk shipments cancelled successfully:', result.message);
      console.log('📊 Response data:', result.data);
      if (result.failedAwbs && result.failedAwbs.length > 0) {
        console.warn('⚠️ Some AWBs failed to cancel:', result.failedAwbs);
      }
    } else {
      console.error('❌ Bulk shipment cancellation failed:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Error testing bulk shipment cancel:', error);
    throw error;
  }
};

// Example usage functions
export const testExampleSingleCancel = () => {
  // Test with the AWB from your example
  const testAWB = '18045011180841';
  return testSingleShipmentCancel(testAWB);
};

export const testExampleBulkCancel = () => {
  // Test with multiple AWBs
  const testAWBs = ['18045011180841', '18045011180842', '18045011180843'];
  return testBulkShipmentCancel(testAWBs);
};

// Function to test the API endpoints directly
export const testAPIEndpoints = () => {
  console.log('🔗 API Endpoints for Shipment Cancel:');
  console.log('📡 Single Cancel: POST /api/shipments/bulk-cancel');
  console.log('📡 Bulk Cancel: POST /api/shipments/bulk-cancel');
  console.log('📋 Request Body Format: { "awb": "AWB_NUMBER" }');
  console.log('📋 Bulk Request Body Format: { "awb": ["AWB1", "AWB2", "AWB3"] }');
  console.log('🔑 Authentication: Bearer token required');
  console.log('🌐 Base URL: From environment configuration');
};

// Export all test functions
export default {
  testSingleShipmentCancel,
  testBulkShipmentCancel,
  testExampleSingleCancel,
  testExampleBulkCancel,
  testAPIEndpoints
};
