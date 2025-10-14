import { analyticsService } from '@/services/analyticsService';

export async function testAnalyticsSystem() {
  console.log('🧪 Testing Analytics System...');

  try {
    // Test 1: Analytics Query Processing
    console.log('\n📊 Test 1: Analytics Query Processing');
    const result = await analyticsService.processQuery('Orders for today');
    console.log('Analytics result:', result);
    
    console.log('\n✅ Analytics system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Analytics system test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Make it available globally for testing
  (window as any).testAnalyticsSystem = testAnalyticsSystem;
} 