/**
 * Authentication utilities for JWT token management
 * 
 * SECURITY NOTE: This implementation uses localStorage for simplicity,
 * but in production, consider using HttpOnly cookies for better security.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

/**
 * Get JWT token from localStorage
 * 
 *SECURITY WARNING: localStorage is vulnerable to XSS attacks.
 * For production, consider using HttpOnly cookies instead.
 */
export const getJWTToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
};

/**
 * Set JWT token in localStorage
 * 
 * SECURITY WARNING: localStorage is vulnerable to XSS attacks.
 * For production, consider using HttpOnly cookies instead.
 */
export const setJWTToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('jwt_token', token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeJWTToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('jwt_token');
};

/**
 * Get user data from localStorage
 */
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Set user data in localStorage
 */
export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove user data from localStorage
 */
export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getJWTToken() && !!getUser();
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.is_admin || false;
};

/**
 * Logout user (clear all auth data)
 */
export const logout = (): void => {
  removeJWTToken();
  removeUser();
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getJWTToken();
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`
  };
};
