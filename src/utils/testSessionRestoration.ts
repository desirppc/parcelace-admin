// Test file for session restoration functionality
import { 
  getSessionAge, 
  restoreSessionFromStorage,
  shouldAttemptSessionRestore,
  getSessionInfo 
} from './authUtils';

export const testSessionRestoration = () => {
  console.log('🧪 Testing Session Restoration...');
  
  // Test if we should attempt session restore
  const shouldRestore = shouldAttemptSessionRestore();
  console.log('🔄 Should attempt session restore:', shouldRestore);
  
  // Test session restoration
  const restored = restoreSessionFromStorage();
  console.log('✅ Session restored from storage:', restored);
  
  // Test session age
  const sessionAge = getSessionAge();
  console.log('📊 Current session age:', sessionAge, 'minutes');
  
  // Test session info
  const sessionInfo = getSessionInfo();
  console.log('ℹ️ Session info:', sessionInfo);
  
  // Test storage contents
  const storageInfo = {
    sessionStart: sessionStorage.getItem('session_start_time'),
    originalStart: sessionStorage.getItem('original_session_start_time'),
    user: sessionStorage.getItem('user') ? 'exists' : 'none',
    userData: sessionStorage.getItem('user_data') ? 'exists' : 'none',
    authToken: sessionStorage.getItem('auth_token') ? 'exists' : 'none',
    accessToken: sessionStorage.getItem('access_token') ? 'exists' : 'none'
  };
  console.log('💾 Storage contents:', storageInfo);
  
  console.log('✅ Session restoration test completed');
  
  return {
    shouldRestore,
    restored,
    sessionAge,
    sessionInfo,
    storageInfo
  };
};

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  // Wait a bit for the page to load
  setTimeout(() => {
    testSessionRestoration();
  }, 1000);
}
