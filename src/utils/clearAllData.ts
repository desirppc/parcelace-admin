// Comprehensive data clearing utility for logout and session expiry
// This ensures all cached data is cleared while preserving password refills

import { clearAllCache } from './cache';

/**
 * Comprehensive function to clear ALL application data
 * This is called when user logs out or session expires
 * Preserves password refills as requested
 */
export const clearAllApplicationData = (): void => {
  console.log('🧹 Starting comprehensive data clearing...');
  
  try {
    // 1. Clear all authentication tokens and user data
    clearAuthenticationData();
    
    // 2. Clear all application cache
    clearAllCache();
    
    // 3. Clear onboarding and KYC data
    clearOnboardingData();
    
    // 4. Clear session-specific data
    clearSessionData();
    
    // 5. Clear browser caches and service workers
    clearBrowserCaches();
    
    // 6. Clear any other app-specific data
    clearMiscellaneousData();
    
    console.log('✅ All application data cleared successfully');
    
  } catch (error) {
    console.error('❌ Error during data clearing:', error);
  }
};

/**
 * Clear all authentication-related data
 */
const clearAuthenticationData = (): void => {
  console.log('🔐 Clearing authentication data...');
  
  // Clear localStorage auth data
  const authKeys = [
    'auth_token',
    'access_token', 
    'user_data',
    'user',
    'walletBalance',
    'parcelace_user',
    'parcelace_token'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage auth data
  sessionStorage.clear();
  
  console.log('✅ Authentication data cleared');
};

/**
 * Clear onboarding and KYC verification data
 */
const clearOnboardingData = (): void => {
  console.log('📝 Clearing onboarding and KYC data...');
  
  const onboardingKeys = [
    'onboardingData',
    'kycVerificationData',
    'onboarding_status',
    'kyc_status'
  ];
  
  onboardingKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ Onboarding and KYC data cleared');
};

/**
 * Clear session-specific data (but preserve password refills)
 */
const clearSessionData = (): void => {
  console.log('⏰ Clearing session data...');
  
  const sessionKeys = [
    'session_start_time',
    'original_session_start_time',
    'redirectAfterLogin',
    'last_activity_time',
    'session_refresh_time'
  ];
  
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ Session data cleared');
};

/**
 * Clear browser caches and service workers
 */
const clearBrowserCaches = (): void => {
  console.log('🌐 Clearing browser caches...');
  
  // Clear HTTP caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('parcelace') || 
            name.includes('api') || 
            name.includes('vite') ||
            name.includes('app')) {
          caches.delete(name);
          console.log(`🗑️ Deleted cache: ${name}`);
        }
      });
    }).catch(error => {
      console.error('Error clearing caches:', error);
    });
  }
  
  // Clear service worker registrations
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('🗑️ Unregistered service worker');
      });
    }).catch(error => {
      console.error('Error unregistering service workers:', error);
    });
  }
  
  console.log('✅ Browser caches cleared');
};

/**
 * Clear miscellaneous application data
 */
const clearMiscellaneousData = (): void => {
  console.log('🔧 Clearing miscellaneous data...');
  
  // Get all localStorage keys and remove app-specific ones
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('parcelace') ||
      key.includes('user') ||
      key.includes('auth') ||
      key.includes('wallet') ||
      key.includes('order') ||
      key.includes('shipment') ||
      key.includes('courier') ||
      key.includes('warehouse') ||
      key.includes('profile') ||
      key.includes('onboarding') ||
      key.includes('kyc') ||
      key.includes('session') ||
      key.includes('cache')
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove identified keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`✅ Removed ${keysToRemove.length} miscellaneous localStorage entries`);
};

/**
 * Clear all data EXCEPT password refills
 * This preserves saved email/password for login convenience
 */
export const clearAllDataExceptPasswords = (): void => {
  console.log('🧹 Clearing all data except password refills...');
  
  // Store password refills temporarily
  const savedEmail = localStorage.getItem('parcelace_saved_email');
  const savedPassword = localStorage.getItem('parcelace_saved_password');
  const savedRemember = localStorage.getItem('parcelace_remember_credentials');
  
  // Clear everything
  clearAllApplicationData();
  
  // Restore password refills if they existed
  if (savedEmail) {
    localStorage.setItem('parcelace_saved_email', savedEmail);
  }
  if (savedPassword) {
    localStorage.setItem('parcelace_saved_password', savedPassword);
  }
  if (savedRemember) {
    localStorage.setItem('parcelace_remember_credentials', savedRemember);
  }
  
  console.log('✅ All data cleared except password refills');
};

/**
 * Get data clearing statistics for debugging
 */
export const getDataClearingStats = (): {
  localStorageKeys: number;
  sessionStorageKeys: number;
  cacheEntries: number;
  preservedPasswords: boolean;
} => {
  let localStorageKeys = 0;
  let sessionStorageKeys = 0;
  let cacheEntries = 0;
  
  // Count localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    localStorageKeys++;
  }
  
  // Count sessionStorage keys
  for (let i = 0; i < sessionStorage.length; i++) {
    sessionStorageKeys++;
  }
  
  // Count cache entries
  try {
    const cacheStats = require('./cache').getCacheStats();
    cacheEntries = cacheStats.totalEntries;
  } catch (error) {
    // Ignore cache stats error
  }
  
  const preservedPasswords = !!(
    localStorage.getItem('parcelace_saved_email') ||
    localStorage.getItem('parcelace_saved_password')
  );
  
  return {
    localStorageKeys,
    sessionStorageKeys,
    cacheEntries,
    preservedPasswords
  };
};

/**
 * Force clear everything including password refills
 * Use this for complete logout
 */
export const forceClearEverything = (): void => {
  console.log('💥 Force clearing everything including passwords...');
  
  // Clear everything
  clearAllApplicationData();
  
  // Also clear password refills
  localStorage.removeItem('parcelace_saved_email');
  localStorage.removeItem('parcelace_saved_password');
  localStorage.removeItem('parcelace_remember_credentials');
  
  console.log('✅ Everything cleared including passwords');
};
