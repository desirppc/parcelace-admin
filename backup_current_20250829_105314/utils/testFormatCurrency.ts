// Test file for formatCurrency function
export const testFormatCurrency = () => {
  const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined) {
      return '₹0.00';
    }
    return `₹${parseFloat(amount.toString()).toFixed(2)}`;
  };

  // Test cases
  console.log('Testing formatCurrency function:');
  console.log('formatCurrency(100):', formatCurrency(100));
  console.log('formatCurrency("50.5"):', formatCurrency("50.5"));
  console.log('formatCurrency(null):', formatCurrency(null));
  console.log('formatCurrency(undefined):', formatCurrency(undefined));
  console.log('formatCurrency(0):', formatCurrency(0));
  
  return {
    formatCurrency,
    testCases: [
      { input: 100, expected: '₹100.00' },
      { input: "50.5", expected: '₹50.50' },
      { input: null, expected: '₹0.00' },
      { input: undefined, expected: '₹0.00' },
      { input: 0, expected: '₹0.00' }
    ]
  };
};
