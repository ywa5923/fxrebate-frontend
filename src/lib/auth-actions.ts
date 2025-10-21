'use server';

import { setAuthCookie, clearAuthCookies } from './secure-auth';
import { BASE_URL } from '@/constants';
import logger from './logger';

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      name: string;
      email: string;
      user_type: string;
      permissions: Array<{
        type: string;
        resource_id: number;
        resource_value: string | null;
        action: string;
      }>;
      broker_context: {
        broker_id: number;
        broker_name: string | null;
        team_id: number;
        team_name: string;
      };
    };
    access_token: string;
    token_type: string;
    expires_at: string;
  };
}

/**
 * Authenticate user with magic link token
 * This server action handles the secure authentication flow
 */
export async function authenticateWithMagicLink(token: string): Promise<{
  success: boolean;
  message: string;
  redirectTo?: string;
}> {
  const authLogger = logger.child('AuthActions/authenticateWithMagicLink');
  
  try {
   

    // Make API request to validate token
    const response = await fetch(`${BASE_URL}/magic-link/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Authentication failed');
    }

    // Set secure HttpOnly cookies
    authLogger.info('Setting authentication cookies', { 
      context: { 
        hasToken: !!data.data.access_token,
        hasUser: !!data.data.user,
        userId: data.data.user.id
      } 
    });
    
    try {
      console.log('About to call setAuthCookie with:', { 
        token: data.data.access_token?.substring(0, 20) + '...', 
        user: data.data.user?.email 
      });
      await setAuthCookie(data.data.access_token, data.data.user);
      console.log('setAuthCookie completed successfully');
      authLogger.info('Authentication cookies set successfully');
    } catch (cookieError) {
      
      authLogger.error('Failed to set authentication cookies', { 
        error: cookieError instanceof Error ? cookieError.message : 'Unknown cookie error',
        context: { 
          hasToken: !!data.data.access_token,
          hasUser: !!data.data.user
        } 
      });
      throw new Error('Failed to set authentication cookies');
    }

    authLogger.info('Magic link authentication successful', { 
      context: { 
        userId: data.data.user.id,
        userEmail: data.data.user.email,
        userType: data.data.user.user_type,
        brokerId: data.data.user.broker_context.broker_id,
        teamId: data.data.user.broker_context.team_id
      } 
    });

    return {
      success: true,
      message: 'Authentication successful!',
     // redirectTo: '/en/control-panel'
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
      message: errorMessage
    };
  }
}

/**
 * Logout user and clear all authentication cookies
 */
export async function logoutUser(): Promise<void> {
  const authLogger = logger.child('AuthActions/logoutUser');
  
  try {
    await clearAuthCookies();
    authLogger.info('User logged out successfully');
  } catch (error) {
    authLogger.error('Error during logout', { error });
    throw error;
  }
}
