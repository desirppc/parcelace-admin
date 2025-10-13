# Tracking Authentication System

This document explains the OTP-based authentication system implemented for the public tracking page.

## Overview

The tracking authentication system allows users to verify their identity using OTP (One-Time Password) before they can perform actions like submitting feedback, ratings, or other user-specific operations on the public tracking page.

## API Endpoints

### 1. Send OTP
- **Endpoint**: `POST /api/tracking/send-otp`
- **Request Body**: `{ "awb": "18045110098943" }`
- **Response**:
```json
{
  "status": true,
  "message": "success",
  "data": {
    "message": "OTP sent successfully!"
  },
  "error": null
}
```

### 2. Verify OTP
- **Endpoint**: `POST /api/tracking/verify-otp`
- **Request Body**: `{ "awb": "18045110098943", "otp": "934152" }`
- **Response**:
```json
{
  "status": true,
  "message": "success",
  "data": {
    "message": "OTP verified successfully!",
    "token": "kee9iL7NQ5HrgKMk5gUObXeDeWmoi0rqkbg4cTnu18045110098943"
  },
  "error": null
}
```

## Implementation Details

### TrackingAuthService

The `TrackingAuthService` class handles all authentication-related operations:

```typescript
import TrackingAuthService from '@/services/trackingAuthService';

// Send OTP
const sendResult = await TrackingAuthService.sendOTP('18045110098943');

// Verify OTP
const verifyResult = await TrackingAuthService.verifyOTP('18045110098943', '934152');

// Check authentication status
const isAuthenticated = TrackingAuthService.isAuthenticated();

// Get stored token
const token = TrackingAuthService.getToken();

// Get auth headers for API calls
const headers = TrackingAuthService.getAuthHeaders();

// Clear authentication
TrackingAuthService.clearToken();
```

### Token Management

- **Storage**: Tokens are stored in `localStorage` with a 24-hour expiry
- **Automatic Cleanup**: Expired tokens are automatically removed
- **Security**: Tokens are used for all authenticated API calls

### PublicTracking Component Integration

The `PublicTracking` component automatically:

1. **Checks Authentication**: On component mount, checks if user is already authenticated
2. **Shows OTP Modal**: When user tries to perform actions without authentication
3. **Handles OTP Flow**: Sends OTP and verifies user input
4. **Updates UI**: Shows authentication status and enables/disables features
5. **Manages Session**: Handles token storage and cleanup

## User Flow

1. **User visits tracking page**: `http://localhost:8084/tracking/18045110098943`
2. **User tries to submit feedback**: Clicks on feedback section
3. **OTP Modal appears**: System automatically sends OTP to registered phone
4. **User enters OTP**: Enters 6-digit OTP received via SMS
5. **Authentication successful**: Token is stored, user can now submit feedback
6. **Session persists**: User remains authenticated for 24 hours

## Testing

### Manual Testing

1. Navigate to: `http://localhost:8084/tracking/18045110098943`
2. Try to submit feedback without authentication
3. Enter OTP when prompted
4. Verify authentication status
5. Test logout functionality

### Automated Testing

Use the `TrackingAuthTester` utility:

```typescript
import TrackingAuthTester from '@/utils/testTrackingAuth';

// Test complete flow
const result = await TrackingAuthTester.testCompleteFlow('18045110098943', '934152');

// Test OTP sending only
const otpResult = await TrackingAuthTester.testOTPSending('18045110098943');

// Test token management
const tokenResult = TrackingAuthTester.testTokenManagement();

// Run all tests
const allResults = await TrackingAuthTester.runAllTests('18045110098943', '934152');
```

### Test Component

A test component is available at `/src/components/TrackingAuthTestComponent.tsx` that provides a UI for testing all authentication features.

## Security Considerations

1. **Token Expiry**: Tokens expire after 24 hours
2. **Local Storage**: Tokens are stored locally, not in cookies
3. **OTP Validation**: OTP is validated server-side
4. **Session Management**: Proper cleanup on logout/expiry

## Error Handling

The system handles various error scenarios:

- **Network errors**: Graceful fallback with user-friendly messages
- **Invalid OTP**: Clear error messages with retry options
- **Expired tokens**: Automatic cleanup and re-authentication prompt
- **API failures**: Proper error logging and user notification

## Future Enhancements

1. **Biometric Authentication**: Add fingerprint/face ID support
2. **Social Login**: Integrate with Google/Facebook login
3. **Remember Me**: Option to extend session duration
4. **Multi-factor**: Additional security layers
5. **Analytics**: Track authentication success rates and user behavior

## Troubleshooting

### Common Issues

1. **OTP not received**: Check phone number in tracking data
2. **Token not stored**: Check localStorage permissions
3. **Authentication fails**: Verify API endpoints and network connectivity
4. **Session expires**: User needs to re-authenticate

### Debug Mode

Enable debug logging by checking browser console for detailed authentication flow logs.

## API Integration

When making authenticated API calls, use the auth headers:

```typescript
const headers = TrackingAuthService.getAuthHeaders();
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers,
  body: JSON.stringify(data)
});
```

This ensures the authentication token is included in all requests that require user verification.

## Feedback API Integration

The system now includes comprehensive feedback submission APIs:

### Feedback Endpoints

#### 1. Submit Delivery Rating
- **Endpoint**: `POST /api/feedback/rate-us`
- **Headers**: `Authorization: Bearer {access_token}`
- **Request Body**: 
```json
{
  "rate": "excellent|good|okay|bad|terrible",
  "awb": "18045110098943"
}
```
- **Response**:
```json
{
  "status": true,
  "message": "Rating submitted successfully",
  "data": {...},
  "error": null
}
```

#### 2. Submit NPS Score
- **Endpoint**: `POST /api/feedback/nps`
- **Headers**: `Authorization: Bearer {access_token}`
- **Request Body**:
```json
{
  "remark_score": 8,
  "remark": "Great service!",
  "awb": "18045110098943"
}
```
- **Response**:
```json
{
  "status": true,
  "message": "NPS submitted successfully",
  "data": {...},
  "error": null
}
```

### Error Handling

The system handles API errors with dynamic error messages:

```json
{
  "status": false,
  "message": "Unauthorized or invalid token",
  "error": {
    "message": "Unauthorized or invalid token."
  },
  "data": null
}
```

These error messages are displayed directly to users in the UI.

### FeedbackService Usage

```typescript
import FeedbackService from '@/services/feedbackService';

// Submit delivery rating
const ratingResult = await FeedbackService.submitRating('excellent', '18045110098943');

// Submit NPS score
const npsResult = await FeedbackService.submitNPS(8, 'Great service!', '18045110098943');

// Convert numeric rating to API format
const apiRating = FeedbackService.convertNumericRatingToAPI(5); // Returns 'excellent'
```

### User Experience

1. **Authentication Required**: Users must authenticate before submitting feedback
2. **Loading States**: Buttons show loading indicators during submission
3. **Error Display**: Dynamic error messages from API are shown to users
4. **Success Feedback**: Clear success messages confirm submission
5. **Form Reset**: Forms are automatically cleared after successful submission
