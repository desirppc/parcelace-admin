import { supportTicketService } from '@/services/supportTicketService';

// Test function to verify API integration
export const testSupportTicketAPI = async () => {
  console.log('🧪 Testing Support Ticket API Integration...');
  
  try {
    // Test 1: Fetch support tickets
    console.log('📋 Testing: Fetch support tickets');
    const ticketsResponse = await supportTicketService.getSupportTickets();
    console.log('✅ Tickets Response:', ticketsResponse);
    
    // Test 2: Fetch with pagination
    console.log('📄 Testing: Fetch with pagination');
    const paginatedResponse = await supportTicketService.getSupportTickets({ page: 1, per_page: 10 });
    console.log('✅ Paginated Response:', paginatedResponse);
    
    // Test 3: Fetch with filters
    console.log('🔍 Testing: Fetch with filters');
    const filteredResponse = await supportTicketService.getSupportTickets({ 
      status: 'open',
      category: 'Technical Support',
      page: 1,
      per_page: 5
    });
    console.log('✅ Filtered Response:', filteredResponse);
    
    // Test 4: Fetch ticket counts
    console.log('📊 Testing: Fetch ticket counts');
    const countsResponse = await supportTicketService.getSupportTicketCounts();
    console.log('✅ Counts Response:', countsResponse);
    
    console.log('🎉 All tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as any).testSupportTicketAPI = testSupportTicketAPI;
}
