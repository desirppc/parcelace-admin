// Authentication utility functions

import { ENVIRONMENT } from '@/config/environment';
import { shouldBypassVerification } from './roleUtils';

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  // Basic validation - you can add more sophisticated token validation here
  // For example, check if token is expired, has proper format, etc.
  return token.length > 10; // Basic length check
};

export const getStoredToken = (): string | null => {
  const localStorageToken = localStorage.getItem('auth_token');
  const sessionStorageToken = sessionStorage.getItem('auth_token');
  const localStorageAccessToken = localStorage.getItem('access_token');
  const sessionStorageAccessToken = sessionStorage.getItem('access_token');
  
  console.log('getStoredToken - Available tokens:', {
    localStorageAuth: localStorageToken ? 'exists' : 'none',
    sessionStorageAuth: sessionStorageToken ? 'exists' : 'none',
    localStorageAccess: localStorageAccessToken ? 'exists' : 'none',
    sessionStorageAccess: sessionStorageAccessToken ? 'exists' : 'none'
  });
  
  const token = localStorageToken || sessionStorageToken || localStorageAccessToken || sessionStorageAccessToken;
  
  if (token) {
    console.log('getStoredToken - Using token:', { length: token.length, preview: token.substring(0, 10) + '...' });
  } else {
    console.log('getStoredToken - No token found');
  }
  
  return token;
};

export const getStoredUserData = (): any => {
  try {
    const localStorageData = localStorage.getItem('user_data');
    const sessionStorageData = sessionStorage.getItem('user_data');
    const sessionUserData = sessionStorage.getItem('user');
    
    console.log('getStoredUserData - Available data:', {
      localStorage: localStorageData ? 'exists' : 'none',
      sessionStorage: sessionStorageData ? 'exists' : 'none',
      sessionUser: sessionUserData ? 'exists' : 'none'
    });
    
    if (localStorageData) {
      const parsed = JSON.parse(localStorageData);
      console.log('getStoredUserData - Using localStorage data:', { id: parsed.id, hasToken: !!parsed.auth_token });
      return parsed;
    }
    
    if (sessionStorageData) {
      const parsed = JSON.parse(sessionStorageData);
      console.log('getStoredUserData - Using sessionStorage data:', { id: parsed.id, hasToken: !!parsed.auth_token });
      return parsed;
    }
    
    if (sessionUserData) {
      const parsed = JSON.parse(sessionUserData);
      console.log('getStoredUserData - Using session user data:', { id: parsed.id, hasToken: !!parsed.auth_token });
      return parsed;
    }
    
    console.log('getStoredUserData - No user data found');
    return null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

// Check if session is about to expire (optional - for proactive refresh)
export const isSessionExpiringSoon = (): boolean => {
  const sessionAge = getSessionAge();
  // Consider session expiring soon if it's been more than 8 hours (1 hour before 9-hour timeout)
  return sessionAge >= 480; // 8 hours in minutes
};

// Check if session has actually expired (9 hours - much longer timeout)
export const isSessionExpired = (): boolean => {
  const sessionAge = getSessionAge();
  return sessionAge >= 540; // 9 hours in minutes
};

// Enhanced token validation that checks for actual expiration
export const isTokenActuallyValid = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    // Disable automatic session expiry based on time - let the backend handle this
    // Only check if token exists and has basic validity
    if (!isTokenValid(token)) {
      console.log('Token failed basic validation');
      return false;
    }
    
    // Make a quick API call to validate token with server
    const apiBaseUrl = ENVIRONMENT.getCurrentApiUrl();
    const response = await fetch(`${apiBaseUrl}api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return true;
    } else if (response.status === 401) {
      console.log('Token invalidated by server (401)');
      return false;
    } else {
      console.log('Token validation failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error validating token:', error);
    // If we can't reach the server, assume token is valid if session hasn't expired
    return !isSessionExpired();
  }
};

// Get session age in minutes
export const getSessionAge = (): number => {
  const sessionStart = sessionStorage.getItem('session_start_time');
  const originalSessionStart = sessionStorage.getItem('original_session_start_time');
  
  if (!sessionStart) {
    // Set session start time if not exists
    const now = Date.now();
    sessionStorage.setItem('session_start_time', now.toString());
    sessionStorage.setItem('original_session_start_time', now.toString());
    return 0;
  }
  
  // Use original session start time if available, otherwise use current
  const startTime = parseInt(originalSessionStart || sessionStart);
  const now = Date.now();
  return Math.floor((now - startTime) / (1000 * 60)); // Convert to minutes
};

// Reset session timer on user activity (but preserve original start time)
export const resetSessionTimer = (): void => {
  const originalStart = sessionStorage.getItem('original_session_start_time');
  const now = Date.now();
  
  // Only update the current session time, not the original
  sessionStorage.setItem('session_start_time', now.toString());
  
  // Preserve original start time if it exists
  if (!originalStart) {
    sessionStorage.setItem('original_session_start_time', now.toString());
  }
  
  console.log('Session timer reset due to user activity (original time preserved)');
};

// Reset session timer for API calls (but preserve original start time)
export const resetSessionTimerForAPI = (): void => {
  const originalStart = sessionStorage.getItem('original_session_start_time');
  const now = Date.now();
  
  // Only update the current session time, not the original
  sessionStorage.setItem('session_start_time', now.toString());
  
  // Preserve original start time if it exists
  if (!originalStart) {
    sessionStorage.setItem('original_session_start_time', now.toString());
  }
  
  console.log('Session timer reset for API call (original time preserved)');
};

// Refresh session proactively
export const refreshSession = async (): Promise<boolean> => {
  try {
    const token = getStoredToken();
    if (!token) {
      return false;
    }

    // Get the current API base URL from environment config
    const apiBaseUrl = ENVIRONMENT.getCurrentApiUrl();
    
    // Make a lightweight API call to refresh the session
    // This could be a simple ping endpoint or profile fetch
    const response = await fetch(`${apiBaseUrl}api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Reset session start time on successful refresh
      sessionStorage.setItem('session_start_time', Date.now().toString());
      console.log('Session refreshed successfully via API call');
      return true;
    }

    console.log('Session refresh failed with status:', response.status);
    return false;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
};

// Setup automatic session refresh - REMOVED
// Sessions will only be checked when API calls are made
// No automatic refresh or monitoring needed
export const setupSessionRefresh = (): (() => void) => {
  // Return empty cleanup function - no intervals to clean up
  return () => {
    console.log('No session refresh intervals to clean up');
  };
};

export const clearAuthData = (): void => {
  // Clear all authentication-related data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('user');
  localStorage.removeItem('walletBalance');
  
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user_data');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('walletBalance');
  sessionStorage.removeItem('redirectAfterLogin');
  sessionStorage.removeItem('session_start_time');
  sessionStorage.removeItem('original_session_start_time');
  
  // Clear any other potential cached data
  localStorage.removeItem('parcelace_user');
  localStorage.removeItem('parcelace_token');
  sessionStorage.removeItem('parcelace_user');
  sessionStorage.removeItem('parcelace_token');
  
  // Clear any cached API responses
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('parcelace') || name.includes('api')) {
          caches.delete(name);
        }
      });
    });
  }
  
  // Clear any service worker registrations
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
};

export const forceHardRefresh = (): void => {
  // Clear all cached data first
  clearAuthData();
  
  // Force a hard refresh of the page
  window.location.reload();
  
  // If reload doesn't work, try a more aggressive approach
  setTimeout(() => {
    window.location.href = window.location.origin + '/login';
  }, 100);
};

export const clearAllAppData = (): void => {
  // Clear all application data
  clearAuthData();
  
  // Clear any other app-specific data
  const keysToRemove = [];
  
  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('parcelace') || key.includes('user') || key.includes('auth') || key.includes('wallet'))) {
      keysToRemove.push(key);
    }
  }
  
  // Get all sessionStorage keys
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('parcelace') || key.includes('user') || key.includes('auth') || key.includes('wallet'))) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all identified keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('All application data cleared');
};

export const isUserAuthenticated = (): boolean => {
  const token = getStoredToken();
  const userData = getStoredUserData();
  
  return isTokenValid(token) && userData && userData.id;
};

export const isMobileVerified = (): boolean => {
  const userData = getStoredUserData();
  return userData && userData.mobile_verified_at;
};

export const isAdminUser = (): boolean => {
  const userData = getStoredUserData();
  return userData && userData.user_role === 'admin';
};

export const isAdminUserByEmail = (email: string): boolean => {
  return email === 'hitesh.verma0@gmail.com';
};

export const isOnboardingCompleted = (): boolean => {
  const userData = getStoredUserData();
  return userData && userData.is_onboarding_filled;
};

export const shouldBypassOnboarding = (): boolean => {
  const userData = getStoredUserData();
  if (!userData) return false;
  
  try {
    return shouldBypassVerification(userData);
  } catch (error) {
    console.error('Error calling shouldBypassVerification:', error);
    return false;
  }
};

// Enhanced session management
export const getSessionInfo = () => {
  const token = getStoredToken();
  const userData = getStoredUserData();
  const sessionAge = getSessionAge();
  
  return {
    hasToken: !!token,
    hasUserData: !!userData,
    isAuthenticated: isUserAuthenticated(),
    isMobileVerified: isMobileVerified(),
    isOnboardingCompleted: isOnboardingCompleted(),
    shouldBypassOnboarding: shouldBypassOnboarding(),
    tokenLength: token ? token.length : 0,
    userId: userData?.id || null,
    userEmail: userData?.email || null,
    userRoles: userData?.roles?.map((r: any) => r.name) || [],
    sessionAgeMinutes: sessionAge,
    shouldShowWarning: false, // Removed as per edit hint
    isExpiringSoon: isSessionExpiringSoon(),
    isExpired: isSessionExpired(),
  };
};

// Setup user activity monitoring - REMOVED
// No automatic session management needed
export const setupActivityMonitoring = (): (() => void) => {
  // Return empty cleanup function - no monitoring needed
  return () => {
    console.log('No activity monitoring to clean up');
  };
};

// Enhanced session restoration that doesn't require server validation
export const restoreSessionFromStorage = (): boolean => {
  try {
    const token = getStoredToken();
    const userData = getStoredUserData();
    
    if (!token || !userData) {
      console.log('No token or user data found in storage');
      return false;
    }
    
    // Check if session has expired based on time
    if (isSessionExpired()) {
      console.log('Session expired based on time (30 minutes)');
      return false;
    }
    
    // If we have valid data and session hasn't expired, consider it valid
    console.log('Session restored from storage successfully');
    return true;
  } catch (error) {
    console.error('Error restoring session from storage:', error);
    return false;
  }
};

// Check if we should attempt to restore session on page load
export const shouldAttemptSessionRestore = (): boolean => {
  const token = getStoredToken();
  const userData = getStoredUserData();
  const sessionAge = getSessionAge();
  
  // Only attempt restore if we have the basics and session isn't too old
  return !!(token && userData && sessionAge < 30);
};

// Setup page visibility monitoring - REMOVED
// No automatic session management needed
export const setupPageVisibilityMonitoring = (): (() => void) => {
  // Return empty cleanup function - no monitoring needed
  return () => {
    console.log('No page visibility monitoring to clean up');
  };
};
