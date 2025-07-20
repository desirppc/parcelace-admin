import { debugService } from '@/services/debugService';
import { analyticsService } from '@/services/analyticsService';

export async function testDebugSystem() {
  console.log('🧪 Testing Debug System...');

  try {
    // Test 1: Debug Session Management
    console.log('\n📊 Test 1: Debug Session Management');
    const sessionId = debugService.startSession('Test query');
    console.log('Session started with ID:', sessionId);
    
    // Add some test steps
    debugService.addStep('Test Step 1', { message: 'This is a test' }, 'info');
    debugService.addStep('Test Step 2', { result: 'success' }, 'success');
    
    const session = debugService.endSession();
    console.log('Session ended:', session);
    
    // Test 2: Analytics with Debug
    console.log('\n📊 Test 2: Analytics with Debug');
    const result = await analyticsService.processQuery('Orders for today');
    console.log('Analytics result:', result);
    
    // Test 3: Debug Formatting
    console.log('\n📊 Test 3: Debug Formatting');
    const formattedDebug = debugService.formatSessionForDisplay(session!);
    console.log('Formatted debug output:');
    console.log(formattedDebug);
    
    console.log('\n✅ Debug system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Debug system test failed:', error);
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Make it available globally for testing
  (window as any).testDebugSystem = testDebugSystem;
} 