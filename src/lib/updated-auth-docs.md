# Updated Authentication System

## 🔄 **API Response Structure Updated**

The authentication system has been updated to handle the new API response structure from your backend.

### **New API Response Format:**

```json
{
  "success": true,
  "message": "Magic link verified successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Default User",
      "email": "broker@example.com",
      "user_type": "team_user",
      "permissions": [
        {
          "type": "broker",
          "resource_id": 182,
          "resource_value": null,
          "action": "manage"
        }
      ],
      "broker_context": {
        "broker_id": 182,
        "broker_name": null,
        "team_id": 1,
        "team_name": "Default Team"
      }
    },
    "access_token": "1|T70bC3ofZp80UsyRq2rdZY29aL3eT91paRN81RRh216969ff",
    "token_type": "Bearer",
    "expires_at": "2025-11-20T10:06:21.833568Z"
  }
}
```

## 🔧 **Updated Components**

### **1. User Interface**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;           // NEW: User type (admin, team_user, etc.)
  permissions: Array<{         // NEW: Detailed permissions
    type: string;
    resource_id: number;
    resource_value: string | null;
    action: string;
  }>;
  broker_context: {           // NEW: Broker context
    broker_id: number;
    broker_name: string | null;
    team_id: number;
    team_name: string;
  };
}
```

### **2. Authentication Functions**

#### **Basic Authentication:**
```typescript
import { isAuthenticated, isAdmin, getUserFromCookie } from '@/lib/secure-auth';

// Check if user is logged in
if (isAuthenticated()) {
  // User is authenticated
}

// Check if user is admin (based on user_type or permissions)
if (isAdmin()) {
  // User has admin privileges
}

// Get user data
const user = getUserFromCookie();
console.log(user?.name, user?.email, user?.user_type);
```

#### **Permission Management:**
```typescript
import { 
  getBrokerContext, 
  getUserPermissions, 
  hasPermission, 
  canManageBroker 
} from '@/lib/secure-auth';

// Get broker context
const brokerContext = getBrokerContext();
console.log(brokerContext?.broker_id, brokerContext?.team_name);

// Get all permissions
const permissions = getUserPermissions();
console.log(permissions);

// Check specific permission
if (hasPermission('broker', 'manage', 182)) {
  // User can manage broker 182
}

// Check if user can manage any broker
if (canManageBroker()) {
  // User can manage brokers
}

// Check if user can manage specific broker
if (canManageBroker(182)) {
  // User can manage broker 182
}
```

## 🎯 **Usage Examples**

### **1. Dashboard with Role-Based Access**
```typescript
import { isAuthenticated, isAdmin, getBrokerContext, canManageBroker } from '@/lib/secure-auth';

export function Dashboard() {
  if (!isAuthenticated()) {
    return <LoginPrompt />;
  }

  const brokerContext = getBrokerContext();
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {isAdmin() && (
        <AdminPanel />
      )}
      
      {canManageBroker() && (
        <BrokerManagementPanel brokerId={brokerContext?.broker_id} />
      )}
      
      <UserInfo />
    </div>
  );
}
```

### **2. Permission-Based Component Rendering**
```typescript
import { hasPermission, canManageBroker } from '@/lib/secure-auth';

export function BrokerActions({ brokerId }: { brokerId: number }) {
  return (
    <div>
      {hasPermission('broker', 'manage', brokerId) && (
        <Button>Manage Broker</Button>
      )}
      
      {canManageBroker(brokerId) && (
        <Button>Edit Broker Settings</Button>
      )}
    </div>
  );
}
```

### **3. Team Context Display**
```typescript
import { getBrokerContext, getUserPermissions } from '@/lib/secure-auth';

export function UserProfile() {
  const brokerContext = getBrokerContext();
  const permissions = getUserPermissions();
  
  return (
    <div>
      <h2>User Profile</h2>
      
      {brokerContext && (
        <div>
          <h3>Broker Context</h3>
          <p>Broker ID: {brokerContext.broker_id}</p>
          <p>Team: {brokerContext.team_name}</p>
        </div>
      )}
      
      <div>
        <h3>Permissions</h3>
        <ul>
          {permissions.map((permission, index) => (
            <li key={index}>
              {permission.type} - {permission.action} 
              (Resource: {permission.resource_id})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## 🔐 **Security Features**

### **1. HttpOnly Cookies**
- JWT tokens stored in HttpOnly cookies (XSS protection)
- User data stored in regular cookies (accessible for UI)
- Automatic expiration handling

### **2. Permission-Based Access Control**
- Fine-grained permissions system
- Resource-specific access control
- Role-based UI rendering

### **3. Broker Context Management**
- Multi-broker support
- Team-based access control
- Context-aware permissions

## 🚀 **Migration Guide**

### **From Old System:**
```typescript
// OLD: Simple admin check
if (user.is_admin) {
  // Admin logic
}
```

### **To New System:**
```typescript
// NEW: Permission-based check
if (isAdmin() || canManageBroker(brokerId)) {
  // Admin or broker management logic
}
```

### **API Endpoint Update:**
```typescript
// OLD: /auth/magic-link
// NEW: /magic-link/verify-token
```

## 📝 **Key Changes**

1. **API Endpoint**: Changed from `/auth/magic-link` to `/magic-link/verify-token`
2. **Token Field**: Changed from `jwt_token` to `access_token`
3. **User Structure**: Added `user_type`, `permissions`, and `broker_context`
4. **Admin Check**: Now based on `user_type` and `permissions` instead of `is_admin`
5. **Permission System**: Added comprehensive permission management
6. **Broker Context**: Added broker and team context management

## 🔍 **Testing**

```typescript
// Test authentication
console.log('Authenticated:', isAuthenticated());
console.log('Is Admin:', isAdmin());
console.log('Can Manage Broker:', canManageBroker());
console.log('Broker Context:', getBrokerContext());
console.log('Permissions:', getUserPermissions());
```

This updated system provides much more granular control over user permissions and broker access while maintaining the same secure HttpOnly cookie approach.
