// Test utility for session expiry handling
// SIMPLIFIED APPROACH: Only logout on API 401 responses

import { apiRequest } from '@/config/api';
import { clearAllAppData } from '@/utils/authUtils';

// Test function to simulate session expiry
export const testSessionExpiry = async () => {
  console.log('🧪 Testing session expiry handling...');
  
  try {
    // Make a test API call that should trigger session expiry handling
    const result = await apiRequest('api/user/profile', 'GET');
    
    if (result.status === 401) {
      console.log('✅ Session expiry handling working correctly');
      console.log('📊 Result:', result);
      return true;
    } else {
      console.log('ℹ️ Session is still valid, result:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing session expiry:', error);
    return false;
  }
};

// Test function to manually trigger session expiry
export const triggerSessionExpiry = () => {
  console.log('🔒 Manually triggering session expiry...');
  
  // Clear all auth data to simulate session expiry
  clearAllAppData();
  
  // Make a test API call to trigger the 401 handling
  testSessionExpiry();
};

// Test function to check current session status
export const checkSessionStatus = () => {
  console.log('🔍 Checking current session status...');
  
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
  
  console.log('Session Status:', {
    hasToken: !!token,
    hasUserData: !!userData,
    tokenLength: token ? token.length : 0,
    userId: userData ? JSON.parse(userData).id : null
  });
  
  return {
    hasToken: !!token,
    hasUserData: !!userData,
    tokenLength: token ? token.length : 0,
    userId: userData ? JSON.parse(userData).id : null
  };
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testSessionExpiry = testSessionExpiry;
  (window as any).triggerSessionExpiry = triggerSessionExpiry;
  (window as any).checkSessionStatus = checkSessionStatus;
  
  console.log('🧪 Session expiry test functions available:');
  console.log('- testSessionExpiry() - Test current session status');
  console.log('- triggerSessionExpiry() - Manually trigger session expiry');
  console.log('- checkSessionStatus() - Check current session status');
  console.log('');
  console.log('📋 SIMPLIFIED Session Management:');
  console.log('- ✅ Logout ONLY when API returns 401 (session expired)');
  console.log('- ❌ NO automatic session refresh');
  console.log('- ❌ NO automatic session monitoring');
  console.log('- ❌ NO automatic logout timers');
  console.log('- ✅ Simple and reliable approach');
}
