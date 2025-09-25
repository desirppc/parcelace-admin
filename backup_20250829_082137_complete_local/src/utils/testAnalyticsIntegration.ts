import { analyticsService } from '@/services/analyticsService';
import { orderService } from '@/services/orderService';
import { shipmentService } from '@/services/shipmentService';
import { walletService } from '@/services/walletService';

export async function testAnalyticsIntegration() {
  console.log('🧪 Testing Analytics Integration...');

  try {
    // Test 1: Dashboard Data
    console.log('\n📊 Testing Dashboard Data...');
    const dashboardData = await analyticsService.getDashboardData();
    console.log('Dashboard Data:', dashboardData);

    // Test 2: Order Analytics
    console.log('\n📦 Testing Order Analytics...');
    const orderStats = await orderService.getOrderStats();
    console.log('Order Stats:', orderStats);

    // Test 3: Shipment Analytics
    console.log('\n🚚 Testing Shipment Analytics...');
    const shipmentStats = await shipmentService.getShipmentStats();
    console.log('Shipment Stats:', shipmentStats);

    // Test 4: Wallet Analytics
    console.log('\n💰 Testing Wallet Analytics...');
    const walletBalance = await walletService.getWalletBalance();
    console.log('Wallet Balance:', walletBalance);

    // Test 5: Analytics Queries
    console.log('\n🤖 Testing Analytics Queries...');
    
    const testQueries = [
      'Check my wallet expense for today',
      'total number of orders today',
      'delivered shipments this month',
      'RTO orders yesterday',
      'wallet balance'
    ];

    for (const query of testQueries) {
      console.log(`\nTesting query: "${query}"`);
      const result = await analyticsService.processQuery(query);
      if (result) {
        console.log('✅ Result:', result.friendly_response);
      } else {
        console.log('❌ No result found');
      }
    }

    console.log('\n✅ Analytics Integration Test Completed!');

  } catch (error) {
    console.error('❌ Analytics Integration Test Failed:', error);
  }
}

// Export for use in browser console
(window as any).testAnalyticsIntegration = testAnalyticsIntegration; 