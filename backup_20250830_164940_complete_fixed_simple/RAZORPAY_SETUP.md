# Razorpay Integration Setup

This document provides instructions for setting up Razorpay payment gateway integration in the ParcelAce application.

## Prerequisites

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Complete the KYC process in your Razorpay dashboard
3. Get your API keys from the Razorpay dashboard

## Setup Instructions

### 1. Get Your Razorpay API Keys

1. Log in to your Razorpay dashboard
2. Go to **Settings** → **API Keys**
3. Copy your **Key ID** and **Key Secret**
4. For testing, use the **Test Mode** keys
5. For production, use the **Live Mode** keys

### 2. Update Configuration

Update the Razorpay configuration in `src/config/razorpay.ts`:

```typescript
export const RAZORPAY_CONFIG = {
  // Replace with your actual test credentials
  TEST_KEY_ID: 'rzp_test_YOUR_ACTUAL_TEST_KEY_ID',
  TEST_KEY_SECRET: 'YOUR_ACTUAL_TEST_SECRET_KEY',
  
  // Replace with your actual production credentials
  PRODUCTION_KEY_ID: 'rzp_live_YOUR_ACTUAL_LIVE_KEY_ID',
  PRODUCTION_KEY_SECRET: 'YOUR_ACTUAL_LIVE_SECRET_KEY',
  
  // ... rest of the config
};
```

### 3. Update Company Information

Update the payment configuration in `src/config/razorpay.ts`:

```typescript
export const PAYMENT_CONFIG = {
  // ... other config
  COMPANY_NAME: 'Your Company Name',
  COMPANY_DESCRIPTION: 'Wallet Recharge',
  COMPANY_LOGO: 'https://your-actual-logo-url.com/logo.png',
  THEME_COLOR: '#your-brand-color'
};
```

### 4. Backend Integration (Required for Production)

For production use, you'll need to implement backend endpoints for:

1. **Order Creation**: Create orders on your backend before initiating payment
2. **Payment Verification**: Verify payment signatures on your backend
3. **Wallet Update**: Update user wallet balance after successful payment

#### Example Backend Endpoints:

```javascript
// POST /api/razorpay/create-order
{
  "amount": 1000,
  "currency": "INR",
  "receipt": "receipt_123"
}

// POST /api/razorpay/verify-payment
{
  "payment_id": "pay_xxx",
  "order_id": "order_xxx",
  "signature": "signature_xxx"
}
```

### 5. Environment Variables (Recommended)

For better security, use environment variables:

```bash
# .env.local
REACT_APP_RAZORPAY_TEST_KEY_ID=rzp_test_41JjJAPo94OAvY
REACT_APP_RAZORPAY_TEST_KEY_SECRET=Dq4v1LpGwSd0r7zvkno0CWHB
REACT_APP_RAZORPAY_LIVE_KEY_ID=rzp_live_your_key
REACT_APP_RAZORPAY_LIVE_KEY_SECRET=your_secret
```

Then update the config to use environment variables:

```typescript
export const RAZORPAY_CONFIG = {
  TEST_KEY_ID: process.env.REACT_APP_RAZORPAY_TEST_KEY_ID || 'rzp_test_YOUR_TEST_KEY_ID',
  TEST_KEY_SECRET: process.env.REACT_APP_RAZORPAY_TEST_KEY_SECRET || 'YOUR_TEST_SECRET_KEY',
  // ... rest of config
};
```

## Testing

### Test Cards

Use these test cards for testing payments:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **Network Error**: 4000 0000 0000 9995

### Test UPI

- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Security Considerations

1. **Never expose your secret key** in frontend code
2. **Always verify payments** on your backend
3. **Use HTTPS** in production
4. **Implement proper error handling**
5. **Log all payment events** for debugging

## Features Implemented

✅ **Frontend Integration**
- Razorpay SDK loading
- Payment modal integration
- Amount validation
- Loading states
- Error handling
- Toast notifications

✅ **Configuration Management**
- Environment-based keys
- Configurable company details
- Theme customization

✅ **Type Safety**
- TypeScript interfaces
- Proper type definitions

## Next Steps

1. Replace placeholder API keys with your actual keys
2. Implement backend endpoints for order creation and verification
3. Add proper error handling and logging
4. Test with test cards and UPI
5. Deploy to production with live keys

## Support

For Razorpay support:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For application support, contact the development team. 