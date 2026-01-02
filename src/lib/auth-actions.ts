'use server';


import { BASE_URL } from '@/constants';
import logger from './logger';
import { MagicLinkAuthResponse, AuthUserResponse, BrokerInfoResponse } from '@/types';

import { BrokerInfoSchema,BrokerInfo,AuthUser, AuthUserSchema } from '@/app/schemas/auth-schema';


/**
 * Authenticate user with magic link token
 * This server action handles the secure authentication flow
 */
export async function authenticateWithMagicLink(token: string): Promise<{
  success: boolean;
  message: string;
  redirectTo: string;
}> {
  const authLogger = logger.child('AuthActions/authenticateWithMagicLink');

  try {

    // Make API request to validate token
    const response = await fetch(`${BASE_URL}/magic-link/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const responseData: MagicLinkAuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    if (!responseData.success || !responseData.data) {
      throw new Error(responseData.message || 'Authentication failed');
    }


    try {

      await setAuthCookie(responseData.data.access_token, responseData.data.user);

    } catch (cookieError) {

      authLogger.error('!!================!!Failed to set authentication cookies', {
        error: cookieError instanceof Error ? cookieError.message : 'Unknown cookie error',
        context: {
          hasToken: !!responseData.data.access_token,
          hasUser: !!responseData.data.user
        }
      });
      throw new Error('Failed to set authentication cookies');
    }

    authLogger.info('Magic link authentication successful', {
      context: {
        userId: responseData.data.user.id,
        userEmail: responseData.data.user.email,
        userType: responseData.data.user.user_type,
        token: responseData.data.access_token?.substring(0, 20) + '...',

      }
    });

    let user = responseData.data.user;


    let redirectTo: string = '#'; // Default fallback

    if (user.email === 'admin@admin.com') {
      redirectTo = '/en/control-panel';

    } else if (user.user_type === 'platform_user') {
      redirectTo = '/en/control-panel/platform-manager';
    } else if (user.user_type === 'team_user') {
      let brokerContext = responseData.data?.broker_context || null;
      if (brokerContext?.broker_id) {
        redirectTo = `/en/control-panel/${brokerContext.broker_id}/broker-profile/1/general-information`;
      } else {
        throw new Error('Broker context not found');
      }

    }

    return {
      success: true,
      message: 'Authentication successful!',
      redirectTo: redirectTo
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

    authLogger.error('Magic link authentication failed', {
      error: errorMessage,
      context: {
        token: token ? 'present' : 'missing',
        errorType: typeof error,
        errorStack: error instanceof Error ? error.stack : undefined
      }
    });

    return {
      success: false,
      message: errorMessage,
      redirectTo: '#'
    };
  }
}

/**
 * Logout user and clear all authentication cookies
 */
export async function logoutUser(): Promise<void> {
  const logoutLogger = logger.child('AuthActions/logoutUser');

  try {
    await clearAuthCookies();
    logoutLogger.info('User logged out successfully');
  } catch (error) {
    logoutLogger.error('Error during logout', { error });
    throw error;
  }
}

/**
 * Set authentication cookie on the server side
 * This should be called from a Server Action or API route
 */
export async function setAuthCookie(token: string, user: Omit<AuthUser, 'permissions'|'broker_context'>) {

  const setAuthCookieLogger = logger.child('AuthActions/setAuthCookie');
  setAuthCookieLogger.debug('setAuthCookie called with:', { token: token.substring(0, 20) + '...', user: user.email });

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    // Set HttpOnly cookie with secure settings
    cookieStore.set('bearer_token', token, {
      httpOnly: true,        // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',       // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    setAuthCookieLogger.info('bearer_token cookie set successfully');

    // Store user data in a separate cookie (can be accessed by JS for UI)
    const userDataString = JSON.stringify(user);

    cookieStore.set('user_data', userDataString, {
      httpOnly: false,       // Can be accessed by JavaScript for UI
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',       // Changed from 'strict' to 'lax'
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    setAuthCookieLogger.info('user_data cookie set successfully');

  } catch (error) {
    setAuthCookieLogger.error('Error setting cookies:', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}


/**
 * Clear authentication cookies
 */
export async function clearAuthCookies() {
  const clearAuthCookiesLogger = logger.child('AuthActions/clearAuthCookies');
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    cookieStore.delete('bearer_token');
    cookieStore.delete('user_data');
    clearAuthCookiesLogger.info('Authentication cookies cleared successfully');
  } catch (error) {
    clearAuthCookiesLogger.error('Error clearing authentication cookies:', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

export async function getBearerToken(): Promise<string | null> {
  const log = logger.child('lib/auth-actions/getBearerToken');
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('bearer_token')?.value || null;
  } catch (error) {
    log.error('!!================!!Error getting bearer token:', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

/**
 * Get user data from API using bearer token
 */
export async function getUserData(): Promise<AuthUser> {
  const log = logger.child('lib/auth-actions/getUserData');

  try {
    // Get bearer token
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      log.error('Bearer token not found');
      throw new Error('Bearer token not found');
    }

    // Make API request
    const response: Response = await fetch(`${BASE_URL}/user`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    // Check HTTP response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse response
    const responseData: AuthUserResponse = await response.json();

    // Validate API response structure
    if (!responseData.success) {
      throw new Error(responseData.message || 'API request failed');
    }

    if (!responseData.user) {
      throw new Error('User data not found in response');
    }

    

    // const user: AuthUser = AuthUserSchema.parse(responseData.user);
    // log.debug('User data fetched successfully', { user: user });
    // return user;

    const parsed = AuthUserSchema.safeParse(responseData.user);
    if (!parsed.success) {
      log.error('!!================!!Invalid AuthUser shape', { errors: parsed.error.issues });
      throw new Error('Invalid AuthUser shape:' + parsed.error.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join('; ')); // or throw depending on your policy
    }
    return parsed.data;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('!!================!!Error getting user data:', {
      error: errorMessage,
    });
    throw error;
  }
}

/**
 * Check if user is authenticated (server-side)
 * Returns user data if authenticated, null if not
 */
export async function isAuthenticated(): Promise<AuthUser | null> {
  const log = logger.child('lib/auth-actions/isAuthenticated');
  try {
    const user = await getUserData();
    // log.debug('User authenticated successfully', { userId: user.id, userType: user.user_type });
    return user;
  } catch (error) {
    log.error('!!================!!Authentication check failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    //throw error;
    return null;
  }
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await isAuthenticated();
  if (!user) return false;

  return user.user_type === 'platform_user' &&
    (user?.permissions?.some(p => p.type === 'super_admin' && p.action === 'manage') || false);
}

/**
 * Deprecated function
 * Check if user can administer specific broker
 */
export async function canAdministerBroker(brokerId: number): Promise<boolean> {
  const user = await isAuthenticated();
  if (!user) return false;

  if (user.user_type === 'platform_user') {


  } else if (user.user_type === 'team_user') {
    return user?.permissions?.some(p =>
      p.type === 'broker' &&
      p.action === 'manage' &&
      p.resource_id === brokerId
    ) || false;
  }
  return false;
}

export async function canAdminBroker(brokerId: number): Promise<boolean> {
  let log = logger.child('lib/auth-actions/canAdminBroker');
  try {
    const brokerInfo = await getBrokerInfo(brokerId);
    const user = await getUserData();
    
    //check permissions for the user to manage the broker
    if (user.user_type === 'platform_user') {
      return user?.permissions?.some(p =>
        p.action === 'manage' &&
        ((p.type === 'country' && p.resource_id === brokerInfo.country_id) ||
          (p.type === 'zone' && p.resource_id === brokerInfo.zone_id) ||
          (p.type === 'broker' && p.resource_id === brokerId))
      ) || false;


    } else if (user.user_type === 'team_user') {
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

/**
 * 
 * @param brokerId - The ID of the broker to get info for
 * @returns 
 */
export async function getBrokerInfo(brokerId: number): Promise<BrokerInfo> {
  const log = logger.child('lib/auth-actions/getBrokerInfo');

  try {
    const bearerToken = await getBearerToken();
    if (!bearerToken) throw new Error('Authentication token not found');

    const response = await fetch(`${BASE_URL}/brokers/broker-info/${brokerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    // fetch() resolved successfully — now check HTTP status
    if (!response.ok) {
      const msg = `HTTP error: ${response.status}`;
      log.error('!!================!!Error fetching broker info', { error: msg });
      throw new Error(msg);
    }

    // Try to parse JSON
    const data: BrokerInfoResponse = await response.json();

    if (!data.success) {
      log.error('!!================!!Error fetching broker info', { error: data.message || 'API request failed' });
      throw new Error(data.message || 'API request failed');
    }
    log.debug("Broker info fetched successfully", { data: data.data });
   // const brokerInfo: BrokerInfo = BrokerInfoSchema.parse(data.data);
  //  const parsed = BrokerInfoSchema.safeParse(data.data);
  //  if (!parsed.success) {
  //   log.error('!!================!! Invalid BrokerInfo shape', { errors: parsed.error.issues });
  //   throw new Error('Invalid BrokerInfo shape'); // or throw depending on your policy
  //  }
  // return parsed.data;
  return data.data;
  } catch (err) {
    log.error('!!================!!Error fetching broker info', { error: err instanceof Error ? err.message : err });
    throw err; // rethrow so error.tsx can handle UI
  }
}



/**
 * Get user's broker context
 */
export async function getBrokerContext(): Promise<AuthUser['broker_context'] | null> {
  const user = await isAuthenticated();
  return user?.broker_context || null;
}



/**
 * Get user's broker ID from context
 */
export async function getCurrentBrokerId(): Promise<number | null> {
  const brokerContext = await getBrokerContext();
  return brokerContext?.broker_id || null;
}

/**
 * Check if user can access current broker
 */
export async function canAccessCurrentBroker(): Promise<boolean> {
  const brokerId = await getCurrentBrokerId();
  if (!brokerId) return false;

  return await canAdministerBroker(brokerId);
}



/**
 * Send magic link to the given email address
 */
export async function requestMagicLink(email: string): Promise<{ success: boolean; message?: string }> {
  'use server'
  const log = logger.child('AuthActions/requestMagicLink');
  try {
    const response = await fetch(`${BASE_URL}/login-with-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
      next: { revalidate: 0 },
    });

    let data: any = {};
    let responseText = '';
    try {
      responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (e) {
      log.error('Failed to parse magic link response', { error: e, responseText });
    }

    if (!response.ok) {
      let message = data?.message || `HTTP error: ${response.status}`;
      if (data?.errors) {
        const validationErrors = Object.entries(data.errors)
          .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        message += ` - ${validationErrors}`;
      }
      log.error('Magic link request failed', { status: response.status, statusText: response.statusText, message, errors: data?.errors, data });
      return { success: false, message };
    }

    //log.debug('Magic link request successful', { data });
    return { success: true, message: data?.message || 'Magic link sent if email exists' };
  } catch (err) {
    log.error('Exception requesting magic link', { error: err instanceof Error ? err.message : err });
    return { success: false, message: err instanceof Error ? err.message : 'Unexpected error' };
  }
}

// {
//   "success": true,
//   "user": {
//       "id": 4,
//       "name": "Default User",
//       "email": "broker4@example.com",
//       "user_type": "team_user",
//       "broker_context": {
//           "broker_id": 185,
//           "broker_name": null,
//           "team_id": 4,
//           "team_name": "Default Team"
//       },
//       "permissions": [
//           {
//               "type": "broker",
//               "resource_id": 185,
//               "resource_value": null,
//               "action": "manage"
//           }
//       ]
//   }
// }

