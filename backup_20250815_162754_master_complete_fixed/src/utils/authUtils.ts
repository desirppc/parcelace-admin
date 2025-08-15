// Authentication utility functions

import { ENVIRONMENT } from '@/config/environment';

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
  // Consider session expiring soon if it's been more than 25 minutes (5 minutes before 30-minute timeout)
  return sessionAge >= 25;
};

// Check if session has actually expired (30 minutes)
export const isSessionExpired = (): boolean => {
  const sessionAge = getSessionAge();
  return sessionAge >= 30;
};

// Enhanced token validation that checks for actual expiration
export const isTokenActuallyValid = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  
  try {
    // Check if session has expired based on time
    if (isSessionExpired()) {
      console.log('Session expired based on time (30 minutes)');
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

// Check if session should show warning (e.g., after 20 minutes)
export const shouldShowSessionWarning = (): boolean => {
  const sessionAge = getSessionAge();
  return sessionAge >= 20; // Show warning after 20 minutes
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

// Setup automatic session refresh
export const setupSessionRefresh = (): (() => void) => {
  // Refresh session every 2 minutes to keep it alive (more aggressive than 5 minutes)
  const refreshInterval = setInterval(async () => {
    console.log('Session refresh check - session age:', getSessionAge(), 'minutes');
    
    // Always refresh if session is older than 2 minutes to prevent timeout
    const sessionAge = getSessionAge();
    if (sessionAge >= 2) {
      console.log('Session older than 2 minutes, refreshing...');
      const success = await refreshSession();
      if (!success) {
        console.log('Session refresh failed, but not logging out immediately');
        // Don't log out immediately on refresh failure
        // The session might still be valid, just the refresh failed
        // We'll try again on the next interval
      } else {
        console.log('Session refreshed successfully');
      }
    }
  }, 2 * 60 * 1000); // 2 minutes instead of 5 minutes

  // Also set up a more frequent check for very short sessions (every 30 seconds)
  const quickCheckInterval = setInterval(async () => {
    const sessionAge = getSessionAge();
    
    // If session is very new (less than 1 minute), don't refresh yet
    if (sessionAge < 1) {
      return;
    }
    
    // If session is getting close to 2 minutes, refresh proactively
    if (sessionAge >= 1.5) {
      console.log('Quick check: Session approaching 2 minutes, refreshing...');
      const success = await refreshSession();
      if (!success) {
        console.log('Quick refresh failed, but not logging out immediately');
        // Don't log out immediately on refresh failure
        // We'll try again on the next interval
      }
    }
  }, 30 * 1000); // 30 seconds

  // Return cleanup function for both intervals
  return () => {
    clearInterval(refreshInterval);
    clearInterval(quickCheckInterval);
  };
};

// Setup session timeout warning
export const setupSessionWarning = (onWarning: () => void): (() => void) => {
  // Check every minute if we should show warning
  const warningInterval = setInterval(() => {
    if (shouldShowSessionWarning()) {
      console.log('Session warning threshold reached');
      onWarning();
    }
  }, 60 * 1000); // 1 minute

  // Return cleanup function
  return () => clearInterval(warningInterval);
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

export const isOnboardingCompleted = (): boolean => {
  const userData = getStoredUserData();
  return userData && userData.is_onboarding_filled;
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
    tokenLength: token ? token.length : 0,
    userId: userData?.id || null,
    userEmail: userData?.email || null,
    sessionAgeMinutes: sessionAge,
    shouldShowWarning: shouldShowSessionWarning(),
    isExpiringSoon: isSessionExpiringSoon(),
    isExpired: isSessionExpired(),
  };
};

// Setup user activity monitoring to extend sessions
export const setupActivityMonitoring = (): (() => void) => {
  let activityTimeout: NodeJS.Timeout;
  
  const resetTimer = () => {
    clearTimeout(activityTimeout);
    resetSessionTimer();
    
    // Set up next activity check
    activityTimeout = setTimeout(() => {
      console.log('No user activity detected, session may expire soon');
    }, 5 * 60 * 1000); // 5 minutes of inactivity
  };
  
  // Monitor various user activities
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  events.forEach(event => {
    document.addEventListener(event, resetTimer, true);
  });
  
  // Return cleanup function
  return () => {
    clearTimeout(activityTimeout);
    events.forEach(event => {
      document.removeEventListener(event, resetTimer, true);
    });
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

// Setup page visibility monitoring to handle tab switches
export const setupPageVisibilityMonitoring = (): (() => void) => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('Page became visible, checking session status...');
      // When page becomes visible, check if we need to refresh session
      const sessionAge = getSessionAge();
      if (sessionAge >= 2) {
        console.log('Session may need refresh after tab switch');
        // Don't refresh immediately, let the normal refresh interval handle it
      }
    } else {
      console.log('Page became hidden');
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
