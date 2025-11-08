// Test function to verify role checking with your actual user data structure
export const testRoleChecking = () => {
  console.log('🧪 Testing Role Checking with Actual User Data...');
  
  // Your actual user data structure from login response
  const mockUserData = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    roles: [
      {
        id: 1,
        name: "superadmin",
        guard_name: "web",
        created_at: "2024-07-08T01:57:10.000000Z",
        updated_at: "2024-07-08T01:57:10.000000Z",
        pivot: {
          model_type: "App\\Models\\User",
          model_id: 1,
          role_id: 1
        }
      }
    ]
  };
  
  console.log('📋 Mock User Data:', mockUserData);
  
  // Test the hasRole function
  const { hasRole } = require('@/utils/roleUtils');
  const isSuperAdmin = hasRole(mockUserData, 'superadmin');
  
  console.log('✅ Role Check Result:', {
    hasSuperAdminRole: isSuperAdmin,
    expectedResult: true,
    testPassed: isSuperAdmin === true
  });
  
  // Test fallback checks
  const fallbackCheck1 = mockUserData.user_role === 'superadmin';
  const fallbackCheck2 = mockUserData.roles?.some(role => role.name === 'superadmin');
  
  console.log('🔄 Fallback Checks:', {
    userRoleCheck: fallbackCheck1,
    rolesArrayCheck: fallbackCheck2,
    combinedCheck: fallbackCheck1 || fallbackCheck2
  });
  
  return isSuperAdmin;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testRoleChecking = testRoleChecking;
}
