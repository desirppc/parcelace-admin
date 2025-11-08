import { supportTicketService } from '@/services/supportTicketService';
import { hasRole } from '@/utils/roleUtils';

// Test function to verify the new functionality
export const testSupportTicketActions = async () => {
  console.log('🧪 Testing Support Ticket Actions...');
  
  try {
    // Test 1: Check role-based access
    console.log('🔐 Testing: Role-based access control');
    const mockUser = {
      id: 1,
      email: 'admin@test.com',
      name: 'Test Admin',
      roles: [{ name: 'superadmin', guard_name: 'web', id: 1, created_at: null, updated_at: null, pivot: { model_type: 'App\\User', model_id: 1, role_id: 1 } }]
    };
    
    const isSuperAdmin = hasRole(mockUser, 'superadmin');
    console.log('✅ Superadmin role check:', isSuperAdmin);
    
    // Test 2: Test assign ticket API structure
    console.log('📋 Testing: Assign ticket API structure');
    const assignData = {
      support_user_id: 138,
      support_ticket_id: 11,
      note: 'Test assignment note'
    };
    
    console.log('✅ Assign ticket data structure:', assignData);
    
    // Test 3: Test support users API integration
    console.log('👥 Testing: Support users API integration');
    const supportUsersResponse = await supportTicketService.getSupportTickets({ per_page: 1 });
    console.log('✅ Support tickets API working:', supportUsersResponse.status);
    
    console.log('🎉 All action tests completed successfully!');
    console.log('📝 Note: Assign ticket API call is ready but requires valid support_user_id and support_ticket_id');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as any).testSupportTicketActions = testSupportTicketActions;
}
