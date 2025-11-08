/**
 * Test utility for role-based authorization
 * This file can be used to test the role authorization logic
 */

import { isUserAuthorized, getUserRoleNames, getAuthorizationErrorMessage } from './roleUtils';

// Test data based on the API response examples provided
const testUsers = {
  supportUser: {
    id: 147,
    email: 'hks444@gm2ail.com',
    name: 'hks444',
    roles: [
      {
        id: 3,
        name: 'Support',
        guard_name: 'web',
        created_at: null,
        updated_at: null,
        pivot: {
          model_type: 'App\\Models\\User',
          model_id: 147,
          role_id: 3
        }
      }
    ]
  },
  
  superadminUser: {
    id: 1,
    email: 'admin@example.com',
    name: 'Super Admin',
    roles: [
      {
        id: 1,
        name: 'superadmin',
        guard_name: 'web',
        created_at: '2024-07-08T01:57:10.000000Z',
        updated_at: '2024-07-08T01:57:10.000000Z',
        pivot: {
          model_type: 'App\\Models\\User',
          model_id: 1,
          role_id: 1
        }
      }
    ]
  },
  
  regularUser: {
    id: 2,
    email: 'user@example.com',
    name: 'Regular User',
    roles: [
      {
        id: 2,
        name: 'user',
        guard_name: 'web',
        created_at: '2024-07-08T01:57:10.000000Z',
        updated_at: '2024-07-08T01:57:10.000000Z',
        pivot: {
          model_type: 'App\\Models\\User',
          model_id: 2,
          role_id: 2
        }
      }
    ]
  },
  
  userWithoutRoles: {
    id: 3,
    email: 'noroles@example.com',
    name: 'No Roles User',
    roles: []
  },
  
  userWithNullRoles: {
    id: 4,
    email: 'nullroles@example.com',
    name: 'Null Roles User',
    roles: null
  }
};

/**
 * Run all role authorization tests
 */
export const runRoleAuthorizationTests = () => {
  console.log('🧪 Running Role Authorization Tests...\n');
  
  // Test 1: Support user should be authorized
  console.log('Test 1: Support user authorization');
  const supportAuthorized = isUserAuthorized(testUsers.supportUser);
  console.log('✅ Support user authorized:', supportAuthorized);
  console.log('Roles:', getUserRoleNames(testUsers.supportUser));
  console.log('Expected: true\n');
  
  // Test 2: Superadmin user should be authorized
  console.log('Test 2: Superadmin user authorization');
  const superadminAuthorized = isUserAuthorized(testUsers.superadminUser);
  console.log('✅ Superadmin user authorized:', superadminAuthorized);
  console.log('Roles:', getUserRoleNames(testUsers.superadminUser));
  console.log('Expected: true\n');
  
  // Test 3: Regular user should NOT be authorized
  console.log('Test 3: Regular user authorization');
  const regularAuthorized = isUserAuthorized(testUsers.regularUser);
  console.log('❌ Regular user authorized:', regularAuthorized);
  console.log('Roles:', getUserRoleNames(testUsers.regularUser));
  console.log('Error message:', getAuthorizationErrorMessage(getUserRoleNames(testUsers.regularUser)));
  console.log('Expected: false\n');
  
  // Test 4: User without roles should NOT be authorized
  console.log('Test 4: User without roles authorization');
  const noRolesAuthorized = isUserAuthorized(testUsers.userWithoutRoles);
  console.log('❌ User without roles authorized:', noRolesAuthorized);
  console.log('Roles:', getUserRoleNames(testUsers.userWithoutRoles));
  console.log('Error message:', getAuthorizationErrorMessage(getUserRoleNames(testUsers.userWithoutRoles)));
  console.log('Expected: false\n');
  
  // Test 5: User with null roles should NOT be authorized
  console.log('Test 5: User with null roles authorization');
  const nullRolesAuthorized = isUserAuthorized(testUsers.userWithNullRoles);
  console.log('❌ User with null roles authorized:', nullRolesAuthorized);
  console.log('Roles:', getUserRoleNames(testUsers.userWithNullRoles));
  console.log('Error message:', getAuthorizationErrorMessage(getUserRoleNames(testUsers.userWithNullRoles)));
  console.log('Expected: false\n');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`✅ Authorized users: ${supportAuthorized && superadminAuthorized ? 'PASS' : 'FAIL'}`);
  console.log(`❌ Unauthorized users: ${!regularAuthorized && !noRolesAuthorized && !nullRolesAuthorized ? 'PASS' : 'FAIL'}`);
  
  const allTestsPassed = supportAuthorized && superadminAuthorized && !regularAuthorized && !noRolesAuthorized && !nullRolesAuthorized;
  console.log(`🎯 Overall result: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  return allTestsPassed;
};

// Export test data for manual testing
export { testUsers };
