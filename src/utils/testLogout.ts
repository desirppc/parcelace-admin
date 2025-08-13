// Test utility for logout functionality

export const testLogoutFunctionality = () => {
  console.log('=== Testing Logout Functionality ===');
  
  // Check current state
  console.log('Current localStorage items:', Object.keys(localStorage));
  console.log('Current sessionStorage items:', Object.keys(sessionStorage));
  
  // Check specific auth items
  const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
  const walletBalance = localStorage.getItem('walletBalance') || sessionStorage.getItem('walletBalance');
  
  console.log('Auth state before logout:', {
    hasAuthToken: !!authToken,
    hasUserData: !!userData,
    hasWalletBalance: !!walletBalance
  });
  
  // Simulate logout
  console.log('Simulating logout...');
  
  // Clear all data
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('After logout - localStorage items:', Object.keys(localStorage));
  console.log('After logout - sessionStorage items:', Object.keys(sessionStorage));
  
  console.log('=== Logout Test Complete ===');
};

export const testLoginDataRefresh = () => {
  console.log('=== Testing Login Data Refresh ===');
  
  // Simulate login with mock data
  const mockUserData = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    auth_token: 'test-token-123456789',
    mobile_verified_at: new Date().toISOString(),
    is_onboarding_filled: true
  };
  
  // Store mock data
  localStorage.setItem('auth_token', mockUserData.auth_token);
  localStorage.setItem('user_data', JSON.stringify(mockUserData));
  sessionStorage.setItem('auth_token', mockUserData.auth_token);
  sessionStorage.setItem('user_data', JSON.stringify(mockUserData));
  
  console.log('Mock login data stored');
  console.log('Current auth state:', {
    hasAuthToken: !!localStorage.getItem('auth_token'),
    hasUserData: !!localStorage.getItem('user_data')
  });
  
  console.log('=== Login Data Refresh Test Complete ===');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testLogoutFunctionality = testLogoutFunctionality;
  (window as any).testLoginDataRefresh = testLoginDataRefresh;
}
