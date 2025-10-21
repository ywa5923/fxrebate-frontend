/**
 * Example: How to use the secure authentication system
 * 
 * This file demonstrates the proper way to implement secure authentication
 * using HttpOnly cookies instead of localStorage.
 */

'use client';

import React, { useState } from 'react';
import { authenticateWithMagicLink, logoutUser } from '@/lib/auth-actions';
import { getUserFromCookie, isAuthenticated, isAdmin, getBrokerContext, getUserPermissions, canManageBroker } from '@/lib/secure-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example: Login form using secure authentication
 */
export function SecureLoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // In a real app, you'd send a magic link to the email
      // For this example, we'll simulate the magic link flow
      const response = await fetch('/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Magic link sent! Check your email.');
      } else {
        setMessage('Failed to send magic link. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Secure Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>
          {message && (
            <p className={`text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Example: User dashboard with secure authentication
 */
export function SecureUserDashboard() {
  const [user, setUser] = useState(getUserFromCookie());
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      // Redirect to home page
      window.location.href = '/en';
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status
  if (!isAuthenticated()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please log in to access your dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {user?.name}!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User Type:</strong> {user?.user_type}</p>
          <p><strong>Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</p>
        </div>
        
        {getBrokerContext() && (
          <div>
            <h3 className="font-semibold mb-2">Broker Context:</h3>
            <p><strong>Broker ID:</strong> {getBrokerContext()?.broker_id}</p>
            <p><strong>Team:</strong> {getBrokerContext()?.team_name}</p>
            <p><strong>Can Manage Broker:</strong> {canManageBroker() ? 'Yes' : 'No'}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-semibold mb-2">Permissions:</h3>
          <ul className="text-sm space-y-1">
            {getUserPermissions().map((permission, index) => (
              <li key={index} className="text-gray-600">
                {permission.type} - {permission.action} (Resource: {permission.resource_id})
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          onClick={handleLogout} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example: Protected route component
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  // Check authentication on mount
  React.useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You need to be logged in to access this page.
            </p>
            <Button onClick={() => window.location.href = '/en/auth'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Example: API call with secure authentication
 * 
 * Note: With HttpOnly cookies, you need to use server actions or API routes
 * for authenticated requests, as the token cannot be accessed by JavaScript.
 */
export async function fetchUserData() {
  // This would be a server action or API route
  const response = await fetch('/api/user-data', {
    credentials: 'include', // Include HttpOnly cookies
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  
  return response.json();
}
