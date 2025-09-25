/**
 * Test utility for debugging the import API functionality
 * This can be used in the browser console to test the API directly
 */

export const testImportAPI = async (file: File, authToken: string) => {
  console.log('🧪 Testing Import API...');
  
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('spreadsheet', file);
    
    console.log('📁 FormData created:', {
      file: file.name,
      type: file.type,
      size: file.size,
      formDataEntries: Array.from(formData.entries())
    });
    
    // Test the API call
    const response = await fetch('https://app.parcelace.io/api/order/import-bulk-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const data = await response.json();
    console.log('📊 Response Data:', data);
    
    if (response.ok) {
      console.log('✅ Import successful!');
      return { success: true, data };
    } else {
      console.error('❌ Import failed:', data);
      return { success: false, data, status: response.status };
    }
    
  } catch (error) {
    console.error('💥 Network error:', error);
    return { success: false, error };
  }
};

export const testFileValidation = (file: File) => {
  console.log('🔍 Testing file validation...');
  
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'application/csv' // alternative CSV MIME type
  ];
  
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  
  const typeValid = validTypes.includes(file.type);
  const extensionValid = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  console.log('📋 File validation results:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    typeValid,
    extensionValid,
    isValid: typeValid || extensionValid
  });
  
  return typeValid || extensionValid;
};

// Usage in browser console:
// 1. Select a file input element: const fileInput = document.querySelector('input[type="file"]');
// 2. Get the file: const file = fileInput.files[0];
// 3. Get auth token: const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
// 4. Test: testImportAPI(file, token);
// 5. Test validation: testFileValidation(file);
