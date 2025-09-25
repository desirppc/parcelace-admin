// Test file for session management functionality
import { 
  getSessionAge, 
  isSessionExpiringSoon, 
  isSessionExpired,
  resetSessionTimer,
  getSessionInfo 
} from './authUtils';

export const testSessionManagement = () => {
  console.log('🧪 Testing Session Management...');
  
  // Test session age
  const sessionAge = getSessionAge();
  console.log('📊 Current session age:', sessionAge, 'minutes');
  
  // Test expiring soon
  const expiringSoon = isSessionExpiringSoon();
  console.log('⏰ Is expiring soon:', expiringSoon);
  
  // Test expired
  const expired = isSessionExpired();
  console.log('❌ Is expired:', expired);
  
  // Test session info
  const sessionInfo = getSessionInfo();
  console.log('ℹ️ Session info:', sessionInfo);
  
  // Test timer reset
  console.log('🔄 Resetting session timer...');
  resetSessionTimer();
  
  const newSessionAge = getSessionAge();
  console.log('📊 New session age after reset:', newSessionAge, 'minutes');
  
  console.log('✅ Session management test completed');
  
  return {
    sessionAge,
    expiringSoon,
    expired,
    sessionInfo,
    newSessionAge
  };
};

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  // Wait a bit for the page to load
  setTimeout(() => {
    testSessionManagement();
  }, 1000);
}
