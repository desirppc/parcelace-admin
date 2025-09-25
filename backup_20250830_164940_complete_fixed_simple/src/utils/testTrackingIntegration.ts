import TrackingService from '@/services/trackingService';

/**
 * Test utility for tracking integration
 * This file helps verify that our tracking service is working correctly
 */

export const testTrackingIntegration = async () => {
  console.log('🧪 Testing Tracking Integration...');
  
  try {
    // Test with a sample AWB number
    const testAWB = '18045011180841';
    console.log(`🔍 Testing with AWB: ${testAWB}`);
    
    const response = await TrackingService.getTrackingByAWB(testAWB);
    
    console.log('📊 Tracking Response:', {
      status: response.status,
      message: response.message,
      hasData: !!response.data,
      error: response.error
    });
    
    if (response.status && response.data) {
      console.log('✅ Tracking data retrieved successfully');
      console.log('📦 Order Details:', {
        awb: response.data.order_details?.awb,
        orderId: response.data.order_details?.order_id,
        status: response.data.order_details?.shipment_status,
        customer: response.data.customer_details?.shipping_first_name,
        products: response.data.product_details?.length || 0,
        trackingEvents: response.data.trakings_details?.length || 0
      });
      
      console.log('🎨 Tracking Page Config:', {
        hasNPS: response.data.tracking_page?.nps_section?.[0]?.show_nps_section,
        hasHeader: response.data.tracking_page?.header_section?.length > 0,
        hasFooter: response.data.tracking_page?.footer_section?.length > 0
      });
    } else {
      console.log('❌ Failed to retrieve tracking data:', response.message);
    }
    
    return response;
  } catch (error) {
    console.error('💥 Error testing tracking integration:', error);
    return null;
  }
};

export const testTrackingServiceMethods = () => {
  console.log('🧪 Testing Tracking Service Utility Methods...');
  
  // Test status formatting
  const testStatuses = ['Delivered', 'In Transit', 'Cancelled', 'Pending'];
  testStatuses.forEach(status => {
    const formatted = TrackingService.formatTrackingStatus(status);
    const color = TrackingService.getStatusColor(status);
    const badgeColor = TrackingService.getStatusBadgeColor(status);
    
    console.log(`📊 Status: "${status}" -> "${formatted}" | Color: ${color} | Badge: ${badgeColor}`);
  });
  
  // Test date formatting
  const testDates = ['2025-01-15T09:00:00Z', '07 Aug 2025 09:58 AM'];
  testDates.forEach(date => {
    const formatted = TrackingService.formatDate(date);
    console.log(`📅 Date: "${date}" -> "${formatted}"`);
  });
  
  // Test delivery partner icons
  const testPartners = ['delhivery', 'bluedart', 'fedex', 'dhl', 'unknown'];
  testPartners.forEach(partner => {
    const icon = TrackingService.getDeliveryPartnerIcon(partner);
    console.log(`🚚 Partner: "${partner}" -> "${icon}"`);
  });
  
  console.log('✅ Tracking Service utility methods tested successfully');
};

// Export for use in development
if (import.meta.env.DEV) {
  // Make available globally for console testing
  (window as any).testTracking = {
    testIntegration: testTrackingIntegration,
    testMethods: testTrackingServiceMethods
  };
  
  console.log('🧪 Tracking test utilities available globally:');
  console.log('• window.testTracking.testIntegration() - Test API integration');
  console.log('• window.testTracking.testMethods() - Test utility methods');
}
