// Test utility to verify date conversion for API
export function testDateConversion() {
  console.log('Testing date conversion...');
  
  // Test yesterday date conversion
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const formattedDate = yesterday.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
  
  console.log('Original ISO date:', yesterdayStr);
  console.log('Formatted date for API:', formattedDate);
  console.log('Expected format: Jul 16, 2025');
  
  return {
    iso: yesterdayStr,
    formatted: formattedDate
  };
}

// Test the conversion
if (typeof window !== 'undefined') {
  // Only run in browser
  testDateConversion();
} 