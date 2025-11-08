# Role-Based Authorization Implementation

## Overview

This implementation adds role-based access control to the ParcelAce Admin application, restricting login access to users with `superadmin` or `Support` roles only.

## Implementation Details

### 1. Role Validation Logic

The authorization check is implemented in multiple layers for security:

#### Login Components
- **File**: `src/pages/Login.tsx` and `src/components/LoginScreen.tsx`
- **Location**: After successful API login response, before storing user data
- **Action**: Shows error message and prevents login if user doesn't have authorized role

#### Route Guard
- **File**: `src/components/RouteGuard.tsx`
- **Location**: Before allowing access to protected routes
- **Action**: Clears auth data and redirects to login if user doesn't have authorized role

### 2. Utility Functions

#### `src/utils/roleUtils.ts`
Contains reusable functions for role validation:

- `isUserAuthorized(userData)`: Checks if user has superadmin or Support role
- `getUserRoleNames(userData)`: Returns array of user's role names
- `hasRole(userData, roleName)`: Checks if user has a specific role
- `getAuthorizationErrorMessage(userRoles)`: Returns formatted error message

### 3. API Response Structure

The implementation expects the login API response to include a `roles` array:

```json
{
  "status": true,
  "message": "Successfully LoggedIn.",
  "data": {
    "id": 147,
    "email": "user@example.com",
    "name": "User Name",
    "roles": [
      {
        "id": 3,
        "name": "Support",
        "guard_name": "web",
        "created_at": null,
        "updated_at": null,
        "pivot": {
          "model_type": "App\\Models\\User",
          "model_id": 147,
          "role_id": 3
        }
      }
    ]
  }
}
```

### 4. Authorized Roles

Only users with the following roles are allowed to login:
- `superadmin`
- `Support`

### 5. Error Handling

When unauthorized users attempt to login:
- Clear error message is displayed: "You are not authorized to login. Only superadmin and Support roles are allowed."
- Login process is terminated
- No user data is stored
- User is redirected back to login screen

### 6. Security Features

- **Multi-layer validation**: Both login components and route guards check authorization
- **Data cleanup**: Unauthorized users' auth data is cleared from storage
- **Logging**: All authorization attempts are logged for security monitoring
- **Graceful degradation**: System handles missing or malformed role data

### 7. Testing

A test utility is available at `src/utils/testRoleAuthorization.ts` to verify the implementation:

```typescript
import { runRoleAuthorizationTests } from '@/utils/testRoleAuthorization';

// Run tests
runRoleAuthorizationTests();
```

## Usage

The implementation is automatic and requires no additional configuration. Users will be automatically checked for authorization during login and route access.

## Security Considerations

1. **Client-side validation**: This is primarily for UX - server-side validation should also be implemented
2. **Role data integrity**: The system assumes role data comes from a trusted API source
3. **Session management**: Unauthorized users' sessions are immediately cleared
4. **Audit logging**: All authorization attempts are logged for security monitoring

## Future Enhancements

- Add role-based UI element visibility
- Implement granular permissions within roles
- Add role management interface for superadmin users
- Implement server-side role validation
