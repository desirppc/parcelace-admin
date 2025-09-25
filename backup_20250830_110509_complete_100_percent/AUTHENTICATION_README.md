# Authentication System Documentation

## Overview

This document describes the authentication system implemented in the ParcelAce React application. The system provides comprehensive route protection and user authentication management.

## Components

### 1. RouteGuard
The main authentication guard component that protects routes based on authentication requirements.

**Props:**
- `requireAuth` (boolean, default: true): Whether authentication is required
- `requireOnboarding` (boolean, default: false): Whether onboarding completion is required

**Features:**
- Automatically redirects unauthenticated users to login
- Stores intended destination for post-login redirect
- Handles mobile verification requirements
- Manages onboarding completion requirements

### 2. PublicRoute
Wrapper component for routes that don't require authentication (login, signup, etc.).

### 3. OnboardingRoute
Wrapper component for routes that require both authentication and onboarding completion.

## Authentication Flow

### 1. Public Access
- Users can access: `/`, `/login`, `/signup`, `/forgot-password`, etc.
- No authentication checks performed

### 2. Authentication Required
- Users must be logged in to access dashboard routes
- Automatic redirect to login if not authenticated
- Stores intended destination for post-login redirect

### 3. Mobile Verification Required
- After login, users must verify mobile number via OTP
- Redirects to `/mobile-otp-verification` if not verified
- Maintains intended destination for post-verification redirect

### 4. Onboarding Required
- Certain routes require onboarding completion
- Redirects to `/onboarding/wizard` if not completed
- Examples: finance, support, advanced settings

## Route Protection Levels

### Level 1: Public Routes
```tsx
<PublicRoute>
  <Component />
</PublicRoute>
```

### Level 2: Authentication Required
```tsx
<RouteGuard>
  <Component />
</RouteGuard>
```

### Level 3: Authentication + Onboarding Required
```tsx
<OnboardingRoute>
  <Component />
</OnboardingRoute>
```

## Implementation Details

### Token Storage
- Tokens stored in both `localStorage` and `sessionStorage` for redundancy
- User data stored in `user_data` key
- Automatic cleanup on logout

### Redirect Handling
- Stores intended destination in `sessionStorage.redirectAfterLogin`
- Automatically redirects after successful authentication
- Falls back to default dashboard if no redirect destination

### State Management
- Uses `useAuth` hook for authentication state
- Integrates with `UserContext` for user data
- Automatic token validation and cleanup

## Usage Examples

### Protecting a Route
```tsx
import { RouteGuard } from '@/components/RouteGuard';

<Route 
  path="/dashboard" 
  element={
    <RouteGuard>
      <DashboardComponent />
    </RouteGuard>
  } 
/>
```

### Public Route
```tsx
import { PublicRoute } from '@/components/PublicRoute';

<Route 
  path="/login" 
  element={
    <PublicRoute>
      <LoginComponent />
    </PublicRoute>
  } 
/>
```

### Onboarding Required Route
```tsx
import { OnboardingRoute } from '@/components/OnboardingRoute';

<Route 
  path="/dashboard/finance" 
  element={
    <OnboardingRoute>
      <FinanceComponent />
    </OnboardingRoute>
  } 
/>
```

## Security Features

1. **Route Protection**: All internal routes are protected by default
2. **Token Validation**: Automatic token validation and cleanup
3. **Session Management**: Secure session storage with automatic cleanup
4. **Redirect Security**: Safe redirect handling with validation
5. **State Isolation**: Authentication state isolated from public routes

## Testing

Use the test utility in browser console:
```javascript
testAuthSystem()
```

This will test:
- Initial authentication state
- Mock login functionality
- Logout functionality
- State management

## Troubleshooting

### Common Issues

1. **Infinite Redirects**: Check if RouteGuard is properly configured
2. **Authentication State Not Persisting**: Verify localStorage/sessionStorage access
3. **Routes Not Protected**: Ensure RouteGuard is wrapping protected components

### Debug Mode

Enable debug logging by setting in browser console:
```javascript
localStorage.setItem('debug', 'true')
```

## Future Enhancements

1. **Token Expiration**: Add automatic token expiration handling
2. **Refresh Tokens**: Implement refresh token mechanism
3. **Multi-factor Authentication**: Add additional security layers
4. **Session Timeout**: Implement automatic session timeout
5. **Audit Logging**: Add authentication event logging
