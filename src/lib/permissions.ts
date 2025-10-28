//import { AuthUser, BrokerInfo } from "@/types";
import { BrokerInfo,AuthUser } from '@/app/schemas/auth-schema';
import logger from "./logger";
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

  export  function canManageBroker(brokerId: number,user: AuthUser,brokerInfo: BrokerInfo,checkOnlyPlatformUser: boolean = false): boolean {
    let log = logger.child('lib/auth-actions/canAdminBroker');
    try {
     
      if (!user || !brokerInfo) {
        log.error('Missing user or brokerInfo in canAdminBroker');
        return false;
      }
      //check permissions for the user to manage the broker
      if (user.user_type === 'platform_user') {
        return user?.permissions?.some(p =>
          p.action === 'manage' &&
          ((p.type === 'country' && p.resource_id === brokerInfo.country_id) ||
            (p.type === 'zone' && p.resource_id === brokerInfo.zone_id) ||
            (p.type === 'broker' && p.resource_id === brokerId))
        ) || false;
  
  
      } else if (!checkOnlyPlatformUser && user.user_type === 'team_user') {
        return user?.permissions?.some(p =>
          p.type === 'broker' &&
          p.action === 'manage' &&
          p.resource_id === brokerId
        ) || false;
      }else{
        return false;
      }
    } catch (error) {
      log.error('!!================!!Error checking broker admin permissions', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  export  function isAdminOfBroker(brokerId: number,user: AuthUser,brokerInfo: BrokerInfo): boolean {
    return canManageBroker(brokerId,user,brokerInfo,true);
  }

  export function getAdminInfo(brokerId: number,user: AuthUser,brokerInfo: BrokerInfo): {
    isAdmin: boolean;
    isPlatformUser: boolean;
    isTeamUser: boolean;
    canManageBroker: boolean;
    isSuperAdmin: boolean;
  } {

    return {
      isAdmin: canManageBroker(brokerId,user,brokerInfo,true),
      isSuperAdmin: isSuperAdmin(user),
      isPlatformUser: user.user_type === 'platform_user',
      isTeamUser: user.user_type === 'team_user',
      canManageBroker: canManageBroker(brokerId,user,brokerInfo,false)
    }
  }

  export function isSuperAdmin(user: AuthUser): boolean {
      let superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
      let superAdminName = process.env.SUPER_ADMIN_NAME;
      return user.user_type === 'platform_user' && user.email === superAdminEmail && user.name === superAdminName &&
      (user?.permissions?.some(p => p.type === 'super_admin' && p.action === 'manage') || false);
  }