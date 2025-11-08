/**
 * Role-based authorization utilities
 */

export interface UserRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string | null;
  updated_at: string | null;
  pivot: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface UserData {
  id: number;
  email: string;
  name: string;
  roles?: UserRole[];
  [key: string]: any;
}

/**
 * Check if user has authorized role (superadmin or Support)
 * @param userData - User data object containing roles array
 * @returns boolean indicating if user is authorized
 */
export const isUserAuthorized = (userData: UserData): boolean => {
  if (!userData || !userData.roles || !Array.isArray(userData.roles)) {
    console.warn('User data or roles not found:', userData);
    return false;
  }

  const authorizedRoles = ['superadmin', 'Support'];
  const hasAuthorizedRole = userData.roles.some((role: UserRole) => 
    authorizedRoles.includes(role.name)
  );

  console.log('Role authorization check:', {
    userEmail: userData.email,
    userRoles: userData.roles.map(r => r.name),
    isAuthorized: hasAuthorizedRole
  });

  return hasAuthorizedRole;
};

/**
 * Get user's role names as an array
 * @param userData - User data object containing roles array
 * @returns array of role names
 */
export const getUserRoleNames = (userData: UserData): string[] => {
  if (!userData || !userData.roles || !Array.isArray(userData.roles)) {
    return [];
  }
  
  return userData.roles.map((role: UserRole) => role.name);
};

/**
 * Check if user has a specific role
 * @param userData - User data object containing roles array
 * @param roleName - Role name to check for
 * @returns boolean indicating if user has the role
 */
export const hasRole = (userData: UserData, roleName: string): boolean => {
  if (!userData || !userData.roles || !Array.isArray(userData.roles)) {
    return false;
  }
  
  return userData.roles.some((role: UserRole) => role.name === roleName);
};

/**
 * Check if user should bypass mobile verification and onboarding
 * @param userData - User data object containing roles array
 * @returns boolean indicating if user should bypass verification
 */
export const shouldBypassVerification = (userData: UserData): boolean => {
  // Admin users (hardcoded email) always bypass
  if (userData.email === 'hitesh.verma0@gmail.com') {
    return true;
  }
  
  // Authorized users (superadmin/Support) bypass verification
  return isUserAuthorized(userData);
};

/**
 * Get authorization error message
 * @param userRoles - Array of user role names
 * @returns formatted error message
 */
export const getAuthorizationErrorMessage = (userRoles: string[]): string => {
  const roleList = userRoles.length > 0 ? userRoles.join(', ') : 'none';
  return `You are not authorized to login. Your current role(s): ${roleList}. Only superadmin and Support roles are allowed.`;
};
