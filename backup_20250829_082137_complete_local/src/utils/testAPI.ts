// API Test Utility
export const testAPI = async () => {
  const apiUrl = 'https://app.parcelace.io/api/login';
  
  try {
    console.log('Testing API connectivity...');
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      }),
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('API test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Test mobile OTP verification
export const testMobileOTP = async (authToken: string, otp: string) => {
  const apiUrl = 'https://app.parcelace.io/api/verify-mobile-otp';
  
  try {
    console.log('Testing mobile OTP verification...');
    console.log('API URL:', apiUrl);
    console.log('Auth Token:', authToken);
    console.log('OTP:', otp);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ otp }),
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Mobile OTP test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 