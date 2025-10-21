# Magic Link Authentication

This document describes how the magic link authentication system works in the application.

## Overview

The magic link authentication page (`/src/app/[locale]/(auth)/page.tsx`) handles the authentication flow when users click on magic links sent via email.

## How it works

1. **URL Structure**: The magic link should contain a `token` parameter:
   ```
   https://yourapp.com/en/auth?token=abc123xyz
   ```

2. **Authentication Flow**:
   - Page extracts the token from URL parameters
   - Makes a POST request to `${BASE_URL}/auth/magic-link` with the token
   - API validates the token and returns a JWT token and user data
   - JWT token and user data are stored in localStorage
   - User is redirected to the dashboard

3. **API Endpoint Expected**:
   ```
   POST /api/v1/auth/magic-link
   Content-Type: application/json
   
   {
     "token": "abc123xyz"
   }
   ```

4. **API Response Expected**:
   ```json
   {
     "success": true,
     "message": "Authentication successful",
     "data": {
       "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": {
         "id": 123,
         "name": "John Doe",
         "email": "john@example.com",
         "is_admin": false
       }
     }
   }
   ```

## Error Handling

The page handles various error scenarios:
- Missing token in URL
- Invalid or expired token
- Network errors
- API errors

## User Experience

- **Loading State**: Shows spinner while authenticating
- **Success State**: Shows success message and redirects after 2 seconds
- **Error State**: Shows error message with retry and go home options

## Authentication Utilities

The `/src/lib/auth.ts` file provides utilities for managing authentication:

- `getJWTToken()`: Get stored JWT token
- `setJWTToken(token)`: Store JWT token
- `getUser()`: Get user data
- `setUser(user)`: Store user data
- `isAuthenticated()`: Check if user is logged in
- `isAdmin()`: Check if user is admin
- `logout()`: Clear all auth data
- `getAuthHeader()`: Get authorization header for API requests

## Usage in Components

```typescript
import { isAuthenticated, isAdmin, getUser, getAuthHeader } from '@/lib/auth';

// Check if user is logged in
if (isAuthenticated()) {
  // User is logged in
}

// Check if user is admin
if (isAdmin()) {
  // User is admin
}

// Get user data
const user = getUser();
console.log(user?.name, user?.email);

// Make authenticated API request
const response = await fetch('/api/data', {
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader()
  }
});
```

## Security Considerations

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Tokens should have expiration times
- Magic link tokens should be single-use and expire quickly
- Always validate tokens on the server side
