// Authentication utility functions

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  // Basic validation - you can add more sophisticated token validation here
  // For example, check if token is expired, has proper format, etc.
  return token.length > 10; // Basic length check
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token') || 
         sessionStorage.getItem('auth_token') || 
         null;
};

export const getStoredUserData = (): any => {
  try {
    const userData = localStorage.getItem('user_data') || 
                     sessionStorage.getItem('user_data') || 
                     sessionStorage.getItem('user');
    
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
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
