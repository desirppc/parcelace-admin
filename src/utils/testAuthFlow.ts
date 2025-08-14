// Comprehensive test for authentication flow
import { 
  getStoredToken, 
  getStoredUserData,
  getSessionAge,
  restoreSessionFromStorage,
  shouldAttemptSessionRestore,
  getSessionInfo 
} from './authUtils';

export const testAuthFlow = () => {
  console.log('🧪 Testing Complete Authentication Flow...');
  
  // Test 1: Storage Contents
  console.log('\n📦 Test 1: Storage Contents');
  const storageInfo = {
    localStorage: {
      auth_token: localStorage.getItem('auth_token') ? 'exists' : 'none',
      access_token: localStorage.getItem('access_token') ? 'exists' : 'none',
      user_data: localStorage.getItem('user_data') ? 'exists' : 'none',
      user: localStorage.getItem('user') ? 'exists' : 'none'
    },
    sessionStorage: {
      auth_token: sessionStorage.getItem('auth_token') ? 'exists' : 'none',
      access_token: sessionStorage.getItem('access_token') ? 'exists' : 'none',
      user_data: sessionStorage.getItem('user_data') ? 'exists' : 'none',
      user: sessionStorage.getItem('user') ? 'exists' : 'none',
      session_start_time: sessionStorage.getItem('session_start_time') ? 'exists' : 'none',
      original_session_start_time: sessionStorage.getItem('original_session_start_time') ? 'exists' : 'none'
    }
  };
  console.log('Storage Info:', storageInfo);
  
  // Test 2: Token Retrieval
  console.log('\n🔑 Test 2: Token Retrieval');
  const token = getStoredToken();
  console.log('Stored Token:', token ? `${token.substring(0, 20)}...` : 'none');
  
  // Test 3: User Data Retrieval
  console.log('\n👤 Test 3: User Data Retrieval');
  const userData = getStoredUserData();
  console.log('User Data:', userData ? {
    id: userData.id,
    email: userData.email,
    hasAuthToken: !!userData.auth_token,
    hasAccessToken: !!userData.access_token
  } : 'none');
  
  // Test 4: Session Age
  console.log('\n⏰ Test 4: Session Age');
  const sessionAge = getSessionAge();
  console.log('Session Age:', sessionAge, 'minutes');
  
  // Test 5: Session Restoration
  console.log('\n🔄 Test 5: Session Restoration');
  const shouldRestore = shouldAttemptSessionRestore();
  console.log('Should Attempt Restore:', shouldRestore);
  
  if (shouldRestore) {
    const restored = restoreSessionFromStorage();
    console.log('Restoration Result:', restored);
  }
  
  // Test 6: Session Info
  console.log('\nℹ️ Test 6: Session Info');
  const sessionInfo = getSessionInfo();
  console.log('Session Info:', sessionInfo);
  
  // Test 7: Authentication State
  console.log('\n🔐 Test 7: Authentication State');
  const authState = {
    hasToken: !!token,
    hasUserData: !!userData,
    tokenValid: token && token.length > 10,
    userDataValid: userData && userData.id,
    sessionNotExpired: sessionAge < 30,
    readyForRestore: shouldRestore
  };
  console.log('Auth State:', authState);
  
  // Test 8: Recommendations
  console.log('\n💡 Test 8: Recommendations');
  if (!token) {
    console.log('❌ No token found - user needs to login');
  } else if (!userData) {
    console.log('❌ Token exists but no user data - storage issue');
  } else if (sessionAge >= 30) {
    console.log('❌ Session expired - user needs to login');
  } else if (!shouldRestore) {
    console.log('⚠️ Session exists but restoration not recommended');
  } else {
    console.log('✅ Session ready for restoration');
  }
  
  console.log('\n✅ Authentication Flow Test Completed');
  
  return {
    storageInfo,
    token,
    userData,
    sessionAge,
    shouldRestore,
    sessionInfo,
    authState
  };
};

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  // Wait a bit for the page to load
  setTimeout(() => {
    testAuthFlow();
  }, 2000); // Increased delay to ensure UserContext is ready
}
