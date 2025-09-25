// Test file to verify authentication system
import { 
  isUserAuthenticated, 
  isMobileVerified, 
  isOnboardingCompleted,
  clearAuthData 
} from './authUtils';

export const testAuthSystem = () => {
  console.log('=== Testing Authentication System ===');
  
  // Test initial state
  console.log('Initial auth state:', {
    isAuthenticated: isUserAuthenticated(),
    isMobileVerified: isMobileVerified(),
    isOnboardingCompleted: isOnboardingCompleted()
  });
  
  // Test with mock data
  const mockUserData = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    auth_token: 'test-token-123456789',
    mobile_verified_at: new Date().toISOString(),
    is_onboarding_filled: true
  };
  
  // Simulate login
  localStorage.setItem('auth_token', mockUserData.auth_token);
  localStorage.setItem('user_data', JSON.stringify(mockUserData));
  
  console.log('After mock login:', {
    isAuthenticated: isUserAuthenticated(),
    isMobileVerified: isMobileVerified(),
    isOnboardingCompleted: isOnboardingCompleted()
  });
  
  // Test logout
  clearAuthData();
  
  console.log('After logout:', {
    isAuthenticated: isUserAuthenticated(),
    isMobileVerified: isMobileVerified(),
    isOnboardingCompleted: isOnboardingCompleted()
  });
  
  console.log('=== Authentication System Test Complete ===');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testAuthSystem = testAuthSystem;
}
