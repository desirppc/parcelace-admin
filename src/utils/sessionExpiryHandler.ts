import { handleSessionExpiry } from '@/config/api';

/**
 * Utility function to check if a response indicates session expiry
 * This can be used with direct fetch calls to handle session expiry
 */
export const checkForSessionExpiry = (response: Response, result?: any): boolean => {
  // Check for 401 status code
  if (response.status === 401) {
    console.log('🔒 Session expired detected (401 status)');
    return true;
  }

  // Check for session expired message in response body
  if (result && (
    result.message === 'Session expired' || 
    result.error?.message === 'Your session has expired. Please log in again to continue.' ||
    (result.status === 'false' && result.message === 'Session expired')
  )) {
    console.log('🔒 Session expired detected (message in response)');
    return true;
  }

  return false;
};

/**
 * Wrapper function for direct fetch calls that handles session expiry
 * Usage: const result = await fetchWithSessionHandling(url, options);
 */
export const fetchWithSessionHandling = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    // If response is not ok, try to parse the error message
    if (!response.ok) {
      try {
        const result = await response.json();
        if (checkForSessionExpiry(response, result)) {
          handleSessionExpiry();
          return response; // Return the response as-is, session expiry is handled
        }
      } catch (parseError) {
        // If we can't parse JSON, just check status code
        if (checkForSessionExpiry(response)) {
          handleSessionExpiry();
          return response;
        }
      }
    } else {
      // For successful responses, check the body for session expiry messages
      try {
        const result = await response.clone().json();
        if (checkForSessionExpiry(response, result)) {
          handleSessionExpiry();
          return response;
        }
      } catch (parseError) {
        // If we can't parse JSON, that's fine - no session expiry to check
      }
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

/**
 * Helper function to handle API responses and check for session expiry
 * This can be used after making a fetch call to handle the response
 */
export const handleApiResponse = async (response: Response): Promise<any> => {
  const result = await response.json();
  
  if (checkForSessionExpiry(response, result)) {
    handleSessionExpiry();
    return {
      success: false,
      data: null,
      message: 'Session expired. Please login again.',
      status: 401,
      error: 'Session expired'
    };
  }
  
  return {
    success: response.ok,
    data: result.data,
    message: result.message,
    status: response.status,
    error: !response.ok ? result.error || 'Request failed' : null
  };
};
