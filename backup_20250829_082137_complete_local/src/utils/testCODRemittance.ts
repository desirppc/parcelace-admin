/**
 * Test utility for COD Remittance Service
 * This file demonstrates how to use the COD remittance service
 */

import CODRemittanceService from '@/services/codRemittanceService';

/**
 * Test function to demonstrate COD remittance service usage
 */
export const testCODRemittanceService = async () => {
  console.log('🧪 Testing COD Remittance Service...');
  
  try {
    // Test 1: Get COD remittances
    console.log('\n📋 Test 1: Fetching COD remittances...');
    const response = await CODRemittanceService.getCODRemittances(1, 10);
    
    if (response.success) {
      console.log('✅ Successfully fetched COD remittances:', {
        total: response.data?.pagination.total,
        currentPage: response.data?.pagination.current_page,
        remittances: response.data?.cod_remittances.length
      });
      
      // Display first remittance details
      if (response.data?.cod_remittances.length > 0) {
        const firstRemittance = response.data.cod_remittances[0];
        console.log('📄 First remittance details:', {
          id: firstRemittance.id,
          referenceId: firstRemittance.reference_id,
          amount: firstRemittance.total_amount,
          status: firstRemittance.check_payment ? 'Paid' : 'Pending',
          utrNumber: firstRemittance.utr_no || 'Not set'
        });
      }
    } else {
      console.log('❌ Failed to fetch COD remittances:', response.error);
    }
    
    // Test 2: Get specific COD remittance by ID (if we have data)
    if (response.success && response.data?.cod_remittances.length > 0) {
      const firstId = response.data.cod_remittances[0].id;
      console.log(`\n🔍 Test 2: Fetching COD remittance by ID ${firstId}...`);
      
      const detailResponse = await CODRemittanceService.getCODRemittanceById(firstId);
      
      if (detailResponse.success) {
        console.log('✅ Successfully fetched COD remittance details:', detailResponse.data);
      } else {
        console.log('❌ Failed to fetch COD remittance details:', detailResponse.error);
      }
    }

    // Test 3: Get COD remittance details (detailed view with AWB information)
    if (response.success && response.data?.cod_remittances.length > 0) {
      const firstId = response.data.cod_remittances[0].id;
      console.log(`\n📋 Test 3: Fetching COD remittance details with AWB info for ID ${firstId}...`);
      
      const detailsResponse = await CODRemittanceService.getCODRemittanceDetails(firstId);
      
      if (detailsResponse.success) {
        console.log('✅ Successfully fetched COD remittance details with AWB:', {
          totalAWB: detailsResponse.data?.cod_remittance_details.length,
          totalValue: detailsResponse.data?.cod_remittance_details.reduce((sum, item) => 
            sum + parseFloat(item.invoice_value.replace('₹', '').replace(',', '')), 0
          ),
          pagination: detailsResponse.data?.pagination
        });
        
        // Display first AWB detail
        if (detailsResponse.data?.cod_remittance_details.length > 0) {
          const firstAWB = detailsResponse.data.cod_remittance_details[0];
          console.log('📦 First AWB details:', {
            awb: firstAWB.awb,
            dueDate: firstAWB.due_date,
            invoiceValue: firstAWB.invoice_value,
            utrNumber: firstAWB.utr_no || 'Not set',
            referenceId: firstAWB.remittance.reference_id
          });
        }
      } else {
        console.log('❌ Failed to fetch COD remittance details with AWB:', detailsResponse.error);
      }
    }
    
    // Test 4: Test UTR update (this would require a valid ID and might fail in test environment)
    console.log('\n🔄 Test 4: Testing UTR update functionality...');
    console.log('ℹ️  Note: This test requires a valid COD remittance ID and proper authentication');
    
    // Test 5: Test export functionality
    console.log('\n📤 Test 5: Testing export functionality...');
    console.log('ℹ️  Note: Export functionality requires proper authentication and server support');
    
    console.log('\n🎉 COD Remittance Service test completed!');
    
  } catch (error) {
    console.error('❌ Error during COD remittance service test:', error);
  }
};

/**
 * Test function to simulate API responses
 */
export const simulateCODRemittanceData = () => {
  console.log('🎭 Simulating COD remittance data...');
  
  const mockData = {
    status: true,
    message: "COD remittance data retrieved successfully",
    data: {
      cod_remittances: [
        {
          id: 4,
          reference_id: "ACE3020250708",
          total_awb: 1,
          due_date: "08 Jul 2025",
          total_amount: "42.00",
          utr_no: null,
          check_payment: false,
          utr_date: null
        },
        {
          id: 5,
          reference_id: "ACE3020250709",
          total_awb: 3,
          due_date: "10 Jul 2025",
          total_amount: "125.50",
          utr_no: "UTR123456789",
          check_payment: true,
          utr_date: "2025-07-08"
        }
      ],
      pagination: {
        current_page: 1,
        last_page: 1,
        total_page: 1,
        per_page: 50,
        total: 2
      }
    },
    error: null
  };
  
  console.log('📊 Mock data structure:', mockData);
  return mockData;
};

/**
 * Test function to validate data structure
 */
export const validateCODRemittanceStructure = (data: any) => {
  console.log('🔍 Validating COD remittance data structure...');
  
  const requiredFields = [
    'id', 'reference_id', 'total_awb', 'due_date', 
    'total_amount', 'utr_no', 'check_payment', 'utr_date'
  ];
  
  const requiredPaginationFields = [
    'current_page', 'last_page', 'total_page', 'per_page', 'total'
  ];
  
  let isValid = true;
  
  // Check if data has required structure
  if (!data || !data.cod_remittances || !Array.isArray(data.cod_remittances)) {
    console.log('❌ Invalid data structure: missing cod_remittances array');
    return false;
  }
  
  if (!data.pagination) {
    console.log('❌ Invalid data structure: missing pagination object');
    return false;
  }
  
  // Check pagination fields
  for (const field of requiredPaginationFields) {
    if (data.pagination[field] === undefined) {
      console.log(`❌ Missing pagination field: ${field}`);
      isValid = false;
    }
  }
  
  // Check remittance fields
  if (data.cod_remittances.length > 0) {
    const firstRemittance = data.cod_remittances[0];
    for (const field of requiredFields) {
      if (firstRemittance[field] === undefined) {
        console.log(`❌ Missing remittance field: ${field}`);
        isValid = false;
      }
    }
  }
  
  if (isValid) {
    console.log('✅ Data structure validation passed!');
  } else {
    console.log('❌ Data structure validation failed!');
  }
  
  return isValid;
};

export default {
  testCODRemittanceService,
  simulateCODRemittanceData,
  validateCODRemittanceStructure
};
