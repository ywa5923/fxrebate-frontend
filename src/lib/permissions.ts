import { AuthUser } from "@/types";
/**
 * Check if user has specific permission
 */
export  function hasPermission(user: AuthUser, action: string, type: string, resourceId: number): boolean {
    // example: action: 'manage', type: 'broker', resourceId: 185
    if (!user?.permissions) return false;
  
    return user.permissions.some(p => 
      p.type === type && 
      p.action === action && 
      p.resource_id === resourceId
    );
  }