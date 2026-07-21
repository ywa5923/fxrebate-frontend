//import { AuthUser, BrokerInfo } from "@/types";
import { BrokerInfo, AuthUser } from '@/app/schemas/auth-schema';

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthUser, action: string, type: string, resourceId: number): boolean {
  // example: action: 'manage', type: 'broker', resourceId: 185
  if (!user?.permissions) return false;

  return user.permissions.some(p =>
    p.type === type &&
    p.action === action &&
    p.resource_id === resourceId
  );
}

export function canManageBroker(user: AuthUser, brokerInfo: BrokerInfo): boolean {

  if (!user || !brokerInfo) return false;
  if (isSuperAdmin(user)) return true;
  if (isAdminOfBroker(user, brokerInfo)) return true;


  if (user.user_type === 'team_user') {
    return user?.permissions?.some(p =>
      p.type === 'broker' &&
      p.action === 'manage' &&
      p.resource_id === brokerInfo.broker_id
    ) || false;
  }
  return false;
}

export function isAdminOfBroker(user: AuthUser, brokerInfo: BrokerInfo): boolean {
  if (!user || !brokerInfo) return false;

  if (isSuperAdmin(user)) return true;

  if (user.user_type === 'platform_user') {
    return (
      user.permissions?.some(p =>
        p.action === 'manage' &&
        ((p.type === 'country' && p.resource_id === brokerInfo.country_id) ||
          (p.type === 'zone' && p.resource_id === brokerInfo.zone_id) ||
          (p.type === 'broker_group' &&
            p.resource_id != null &&
            brokerInfo.broker_groups_ids?.includes(p.resource_id)))
      ) ?? false
    );
  }

  return false;
}

export function getAdminInfo( user: AuthUser, brokerInfo: BrokerInfo): {
  isAdmin: boolean;
  isPlatformUser: boolean;
  isTeamUser: boolean;
  canManageBroker: boolean;
  isSuperAdmin: boolean;
} {

  return {
    isAdmin: isAdminOfBroker(user, brokerInfo),
    isSuperAdmin: isSuperAdmin(user),
    isPlatformUser: user.user_type === 'platform_user',
    isTeamUser: user.user_type === 'team_user',
    canManageBroker: canManageBroker(user, brokerInfo)
  }
}

export function isSuperAdmin(user: AuthUser): boolean {
  if (!user) return false;

  return (
    user.user_type === 'platform_user' &&
    (user.permissions?.some(p => p.type === 'super-admin' && p.action === 'manage') ?? false)
  );
}