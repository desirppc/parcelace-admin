# Session Persistence Implementation

This document describes the session persistence features implemented to keep users logged in across browser sessions and page refreshes.

## Overview

The application now automatically maintains user sessions, so users don't have to log in every time they visit the application. When a user visits `http://localhost:8080/` with a valid session, they are automatically redirected to the appropriate dashboard page.

## Key Features

### 1. Automatic Session Restoration
- **Session Storage**: User authentication data is stored in both `localStorage` and `sessionStorage` for redundancy
- **Automatic Validation**: Sessions are validated with the server on app startup
- **Smart Redirects**: Authenticated users are automatically redirected based on their verification status

### 2. Session Validation
- **Server Validation**: Sessions are validated with the backend API to ensure they're still valid
- **Automatic Refresh**: Sessions are proactively refreshed to maintain validity
- **Fallback Handling**: Invalid sessions are automatically cleared and users are redirected to login

### 3. User Experience Improvements
- **Loading States**: Users see appropriate loading indicators while session status is being checked
- **Session Status Indicator**: Visual indicator shows when a session is active
- **Session Warnings**: Users are notified when sessions are getting long and can refresh them

## How It Works

### Session Flow
1. **App Startup**: When the app loads, it checks for existing session data
2. **Session Validation**: If session data exists, it's validated with the server
3. **Status Check**: User verification and onboarding status is checked
4. **Automatic Redirect**: Users are redirected to the appropriate page based on their status

### Storage Strategy
- **Primary Storage**: `sessionStorage` for session-specific data
- **Backup Storage**: `localStorage` for persistent data
- **Redundancy**: Data is stored in multiple locations to prevent loss

### Session States
- **Not Authenticated**: Redirected to login page
- **Authenticated but Mobile Not Verified**: Redirected to mobile OTP verification
- **Authenticated but Onboarding Incomplete**: Redirected to onboarding wizard
- **Fully Authenticated**: Redirected to dashboard

## Components Modified

### 1. Index.tsx
- Added session checking logic
- Automatic redirects based on authentication status
- Loading states during session validation

### 2. PublicRoute.tsx
- Prevents authenticated users from accessing public routes
- Automatic redirects to dashboard for logged-in users

### 3. UserContext.tsx
- Enhanced session management
- Server-side session validation
- Automatic session refresh setup

### 4. useAuth.ts
- Improved session checking
- Better integration with UserContext
- Enhanced error handling

### 5. AppHeader.tsx
- Session status indicator
- Visual feedback for active sessions

### 6. SessionWarning.tsx (New)
- Session timeout warnings
- Manual session refresh option
- User-friendly notifications

## Configuration

### Session Timeouts
- **Warning Threshold**: 20 minutes (configurable in `authUtils.ts`)
- **Refresh Interval**: 5 minutes (configurable in `authUtils.ts`)
- **Warning Check**: Every minute (configurable in `authUtils.ts`)

### API Endpoints
- **Session Validation**: `GET /api/user/profile`
- **Session Refresh**: `GET /api/user/profile` (same endpoint, different purpose)

## Usage Examples

### For Users
1. **Login Once**: Users only need to log in once per session
2. **Automatic Redirects**: Users are automatically taken to the right page
3. **Session Warnings**: Users get notified when sessions need attention
4. **Easy Refresh**: One-click session refresh when needed

### For Developers
1. **Session Checking**: Use `useAuth()` hook to check authentication status
2. **Session Validation**: Use `validateSession()` from UserContext
3. **Session Info**: Use `getSessionInfo()` utility for detailed session information

## Security Considerations

### Token Storage
- Tokens are stored in both localStorage and sessionStorage
- No sensitive data is exposed in the UI
- Automatic cleanup on logout

### Session Validation
- All sessions are validated with the server
- Invalid sessions are automatically cleared
- No client-side session manipulation

### Automatic Cleanup
- Sessions are cleared on logout
- Expired sessions are automatically removed
- Browser cache is cleared on logout

## Troubleshooting

### Common Issues
1. **Session Not Persisting**: Check browser storage settings and cookies
2. **Infinite Redirects**: Verify API endpoints are accessible
3. **Session Validation Fails**: Check network connectivity and API status

### Debug Information
- Console logs provide detailed session information
- `getSessionInfo()` utility shows current session state
- Network tab shows session validation requests

## Future Enhancements

### Planned Features
1. **Remember Me**: Option to extend sessions beyond browser close
2. **Session Analytics**: Track session usage patterns
3. **Advanced Security**: Multi-factor authentication support
4. **Offline Support**: Basic functionality when offline

### Configuration Options
1. **Custom Timeouts**: User-configurable session lengths
2. **Session Policies**: Different rules for different user types
3. **Geographic Restrictions**: Location-based session validation

## Testing

### Manual Testing
1. **Login Flow**: Login and verify session persists
2. **Page Refresh**: Refresh page and verify automatic redirect
3. **Session Warning**: Wait for warning and test refresh
4. **Logout**: Verify session is properly cleared

### Automated Testing
- Session persistence tests
- Redirect logic tests
- Session validation tests
- Error handling tests

## Conclusion

The session persistence implementation provides a seamless user experience while maintaining security. Users can now stay logged in across browser sessions, and the application automatically handles all the complexity of session management behind the scenes.
