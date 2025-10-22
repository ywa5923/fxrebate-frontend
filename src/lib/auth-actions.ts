'use server';


import { BASE_URL } from '@/constants';
import logger from './logger';
import { AuthUser, MagicLinkAuthResponse } from '@/types';



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
    const response = await fetch(`${BASE_URL}/magic-link/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    // Set secure HttpOnly cookies
    authLogger.info('Setting authentication cookies', { 
      context: { 
        hasToken: !!responseData.data.access_token,
        hasUser: !!responseData.data.user,
        userId: responseData.data.user.id
      } 
    });
    
    try {
      authLogger.debug('About to call setAuthCookie with:', { 
        token: responseData.data.access_token?.substring(0, 20) + '...', 
        user: responseData.data.user?.email 
      });
      await setAuthCookie(responseData.data.access_token, responseData.data.user);
     
      authLogger.info('Authentication cookies set successfully');
    } catch (cookieError) {
      
      authLogger.error('Failed to set authentication cookies', { 
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
export async function setAuthCookie(token: string, user: AuthUser) {

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


