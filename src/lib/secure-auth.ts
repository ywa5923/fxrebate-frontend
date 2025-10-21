/**
 * Secure Authentication utilities using HttpOnly cookies
 * 
 * This is the RECOMMENDED approach for production applications.
 * HttpOnly cookies are not accessible via JavaScript, making them
 * immune to XSS attacks.
 */

export interface User {
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
}

/**
 * Set authentication cookie on the server side
 * This should be called from a Server Action or API route
 */
export async function setAuthCookie(token: string, user: User) {
  console.log('setAuthCookie called with:', { token: token.substring(0, 20) + '...', user: user.email });
  
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    
    // Set HttpOnly cookie with secure settings
    cookieStore.set('auth_token', token, {
      httpOnly: true,        // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',       // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    console.log('auth_token cookie set successfully');
    
    // Store user data in a separate cookie (can be accessed by JS for UI)
    const userDataString = JSON.stringify(user);
    console.log('User data string length:', userDataString.length);
    
    cookieStore.set('user_data', userDataString, {
      httpOnly: false,       // Can be accessed by JavaScript for UI
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',       // Changed from 'strict' to 'lax'
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    console.log('user_data cookie set successfully');
    
  } catch (error) {
    console.error('Error setting cookies:', error);
    throw error;
  }
}

/**
 * Clear authentication cookies
 */
export async function clearAuthCookies() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  cookieStore.delete('auth_token');
  cookieStore.delete('user_data');
}

/**
 * Get user data from cookie (server-side)
 * Use this in Server Components, API routes, and Server Actions
 */
export async function getUserFromCookieServer(): Promise<User | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const userData = cookieStore.get('user_data')?.value;
    
    if (!userData) return null;
    
    return JSON.parse(decodeURIComponent(userData));
  } catch {
    return null;
  }
}

/**
 * Get user data from cookie (client-side)
 */
export function getUserFromCookie(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userData = document.cookie
    .split('; ')
    .find(row => row.startsWith('user_data='))
    ?.split('=')[1];
    
  if (!userData) return null;
  
  try {
    return JSON.parse(decodeURIComponent(userData));
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 * Use this in Server Components, API routes, and Server Actions
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    console.log('authToken from cookie==============:', authToken);
    
    if (!authToken) return false;
    
    // Validate JWT token
    const jwt = await import('jsonwebtoken');
    //const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    let JWT_SECRET = 'base64:ojTUxMyNjfZQ3VxoIlU37kfQrYPy7osUNGc2V/pOyOI=';
    
    if (!JWT_SECRET) {
      console.warn('JWT_SECRET not found in environment variables');
      return false;
    }
    
    // Handle Laravel base64-encoded secrets
    if (JWT_SECRET.startsWith('base64:')) {
     // JWT_SECRET = atob(JWT_SECRET.slice(7));
     // JWT_SECRET = Buffer.from(JWT_SECRET.slice(7), 'base64').toString('utf8')
      JWT_SECRET = Buffer.from(JWT_SECRET.substring(7), 'base64').toString('utf8')
    }
    
    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(authToken, JWT_SECRET) as any;
      
      console.log('decoded JWT token:', decoded);
      // Check if token is expired (additional safety check)
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return false;
      }
      
      return true;
    } catch (jwtError) {
      console.warn('JWT validation failed:', jwtError);
      return false;
    }
  } catch (error) {
    console.warn('Authentication check failed:', error);
    return false;
  }
}

/**
 * Get JWT token payload (server-side)
 * Use this to get additional token information
 */
export async function getJwtPayload(): Promise<any | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) return null;
    
    const jwt = await import('jsonwebtoken');
    let JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'base64:ojTUxMyNjfZQ3VxoIlU37kfQrYPy7osUNGc2V/pOyOI=';
    
    if (!JWT_SECRET) return null;
    
    // Handle Laravel base64-encoded secrets
    if (JWT_SECRET.startsWith('base64:')) {
      JWT_SECRET = Buffer.from(JWT_SECRET.slice(7), 'base64').toString('utf8');
    }
    
    try {
      const decoded = jwt.verify(authToken, JWT_SECRET) as any;
      return decoded;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  const user = getUserFromCookie();
  return !!user;
}

/**
 * Check if user is admin (server-side)
 * Use this in Server Components, API routes, and Server Actions
 */
export async function isAdminServer(): Promise<boolean> {
  const user = await getUserFromCookieServer();
  if (!user) return false;
  
  return user.user_type === 'admin' || 
         user.permissions.some(p => p.type === 'admin' && p.action === 'manage');
}

/**
 * Check if user is admin (client-side)
 * Based on user_type or permissions
 */
export function isAdmin(): boolean {
  const user = getUserFromCookie();
  if (!user) return false;
  
  // Check if user_type is admin or if they have admin permissions
  return user.user_type === 'admin' || 
         user.permissions.some(p => p.type === 'admin' && p.action === 'manage');
}

/**
 * Get authorization header for API requests
 * Note: This won't work with HttpOnly cookies - you'll need server-side API calls
 */
export function getAuthHeader(): Record<string, string> {
  // This is a limitation of HttpOnly cookies
  // For client-side API calls, you'll need to use server actions or API routes
  console.warn('HttpOnly cookies cannot be accessed by JavaScript. Use server actions for authenticated requests.');
  return {};
}

/**
 * Get user's broker context (server-side)
 * Use this in Server Components, API routes, and Server Actions
 */
export async function getBrokerContextServer(): Promise<User['broker_context'] | null> {
  const user = await getUserFromCookieServer();
  return user?.broker_context || null;
}

/**
 * Get user's broker context (client-side)
 */
export function getBrokerContext(): User['broker_context'] | null {
  const user = getUserFromCookie();
  return user?.broker_context || null;
}

/**
 * Get user's permissions
 */
export function getUserPermissions(): User['permissions'] {
  const user = getUserFromCookie();
  return user?.permissions || [];
}

/**
 * Check if user has specific permission
 */
export function hasPermission(type: string, action: string, resourceId?: number): boolean {
  const permissions = getUserPermissions();
  return permissions.some(p => 
    p.type === type && 
    p.action === action && 
    (resourceId === undefined || p.resource_id === resourceId)
  );
}

/**
 * Check if user can manage broker
 */
export function canManageBroker(brokerId?: number): boolean {
  const user = getUserFromCookie();
  if (!user) return false;
  
  // Check if user is admin
  if (isAdmin()) return true;
  
  // Check broker-specific permissions
  const permissions = getUserPermissions();
  return permissions.some(p => 
    p.type === 'broker' && 
    p.action === 'manage' && 
    (brokerId === undefined || p.resource_id === brokerId)
  );
}

/**
 * Logout user (client-side)
 * Note: This only clears the user_data cookie, not the auth_token
 * The auth_token should be cleared server-side
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  
  // Clear user data cookie
  document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirect to login or home page
  window.location.href = '/en';
}
