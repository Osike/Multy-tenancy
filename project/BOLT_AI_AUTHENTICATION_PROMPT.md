# BOLT AI PROMPT: Implement Functional Authentication System for Multi-Tenant Logistics Platform

## CONTEXT & REQUIREMENTS

I have a multi-tenant logistics management system with the following structure:
- **Backend**: Node.js/Express with MongoDB using Mongoose
- **Frontend**: React/TypeScript with Vite, TailwindCSS, and Heroicons
- **Authentication**: JWT tokens with bcrypt password hashing (12 rounds)
- **User Roles**: super_admin, company_admin, dispatcher, driver
- **Multi-tenancy**: Company-based user isolation

## CURRENT PROBLEM
The authentication system is currently using mock data instead of real API calls. I need you to make it fully functional by connecting the frontend to the existing backend API endpoints.

## BACKEND API ENDPOINTS (Already Implemented)
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
POST /api/auth/logout
```

**API Base URL**: `http://localhost:5000/api`

## EXISTING BACKEND FEATURES
- Password hashing with bcrypt (12 rounds)
- JWT token generation and validation
- Role-based access control
- Account lockout after 5 failed attempts (2 hours)
- Company-specific user validation
- Input validation with express-validator

## WHAT YOU NEED TO FIX

1. **Remove Mock Authentication**: Replace all mock login/register logic with real API calls
2. **Implement Real Login Flow**: Connect login form to `/api/auth/login` endpoint
3. **Implement Real Registration Flow**: Connect registration to `/api/auth/register` endpoint
4. **Add Proper Error Handling**: Display backend validation errors and authentication failures
5. **Token Management**: Implement proper JWT token storage and refresh
6. **Protected Routes**: Ensure authentication state persists across page refreshes
7. **Role-Based Navigation**: Redirect users to appropriate dashboards based on their role

## SPECIFIC REQUIREMENTS

### Login Page (`src/pages/LoginPage.tsx`)
- Remove demo credential buttons
- Connect form submission to real API
- Handle authentication errors (invalid credentials, account locked, etc.)
- Show loading states during authentication
- Redirect based on user role after successful login

### Registration Page (`src/pages/RegisterPage.tsx`)
- Connect to real registration API
- Handle company creation for company_admin users
- Show validation errors from backend
- Support role-based registration fields

### Auth Context (`src/contexts/AuthContext.tsx`)
- Remove all mock user logic
- Implement real API calls for login/register
- Add token refresh mechanism
- Handle authentication state persistence
- Implement proper logout with token cleanup

### Error Handling Requirements
- Display specific backend error messages
- Handle network errors gracefully
- Show field-specific validation errors
- Implement retry mechanisms for failed requests

### Security Features to Implement
- Automatic token refresh before expiration
- Secure token storage (consider httpOnly cookies vs localStorage)
- CSRF protection if needed
- Rate limiting awareness on frontend

## TECHNICAL SPECIFICATIONS

### Expected API Request/Response Format

**Login Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Login Response:**
```typescript
{
  success: boolean;
  data: {
    token: string;
    user: {
      _id: string;
      email: string;
      username: string;
      role: string;
      fullName: string;
      companyId?: string;
      isActive: boolean;
    }
  };
  message?: string;
}
```

**Registration Request:**
```typescript
{
  username: string;
  email: string;
  password: string;
  role: string;
  fullName: string;
  phoneNumber?: string;
  companyId?: string; // Required for non-super_admin
  licenseNumber?: string; // Required for drivers
}
```

### Role-Based Dashboard Routing
- `super_admin` → `/super-admin-dashboard`
- `company_admin` → `/company-admin-dashboard`
- `dispatcher` → `/dispatcher-dashboard`
- `driver` → `/driver-dashboard`

## FILES TO MODIFY

1. `src/contexts/AuthContext.tsx` - Remove mock logic, implement real API calls
2. `src/pages/LoginPage.tsx` - Remove demo buttons, connect to real API
3. `src/pages/RegisterPage.tsx` - Connect registration form to API
4. `src/components/Layout.tsx` - Ensure proper user data display
5. Add `src/utils/api.ts` - Centralized API configuration with interceptors

## ADDITIONAL REQUIREMENTS

1. **Validation**: Use the same validation rules as backend (password min 6 chars, email format, etc.)
2. **Loading States**: Show spinners during API calls
3. **Error Display**: Toast notifications or inline error messages
4. **Accessibility**: Maintain ARIA labels and keyboard navigation
5. **Dark Mode**: Preserve existing dark mode styling
6. **Responsive Design**: Maintain mobile-friendly layout

## SECURITY CONSIDERATIONS
- Never log sensitive data (passwords, tokens)
- Implement proper token expiration handling
- Clear sensitive data on logout
- Validate all user inputs on frontend before API calls

## TESTING REQUIREMENTS
- Test with real backend running on localhost:5000
- Test all user roles (super_admin, company_admin, dispatcher, driver)
- Test error scenarios (wrong password, network failures, validation errors)
- Test authentication persistence across browser refreshes

## CURRENT MOCK CODE TO REPLACE

### In `src/contexts/AuthContext.tsx`:
Replace this mock logic:
```typescript
// MOCK USER - Comment this section out when you want real authentication
const mockToken = 'mock-jwt-token-super-admin';
localStorage.setItem('token', mockToken);

const mockUser = {
  id: 'super-user-123',
  _id: 'super-user-123',
  name: 'Super Admin User',
  fullName: 'Super Admin User',
  email: 'superadmin@system.com',
  role: 'super_admin' as const,
  companyId: {
    _id: 'system-company',
    companyName: 'System Administration',
    status: 'Active'
  }
};
```

### In `src/pages/LoginPage.tsx`:
Remove the demo credentials section:
```typescript
{/* Demo Credentials */}
<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
    Demo Accounts
  </h3>
  // ... demo buttons
</div>
```

## BACKEND PASSWORD HASHING DETAILS
Your backend uses:
- **Algorithm**: bcrypt via bcryptjs
- **Salt Rounds**: 12 (high security)
- **Implementation**: Pre-save middleware in User model
- **Password Comparison**: `user.comparePassword(candidatePassword)` method

## EXISTING USER SCHEMA
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // bcrypt hashed
  role: String, // 'super_admin' | 'company_admin' | 'dispatcher' | 'driver'
  fullName: String,
  phoneNumber: String,
  companyId: ObjectId, // Optional for super_admin
  isActive: Boolean,
  lastLogin: Date,
  security: {
    loginAttempts: Number,
    lockUntil: Date,
    passwordChangedAt: Date
  }
}
```

**GOAL**: Make the authentication system production-ready and remove all mock/demo functionality while maintaining the existing UI design and user experience. The system should work with the existing backend API that's already implemented and tested.

## PRIORITY ORDER
1. Fix AuthContext to use real API calls
2. Update LoginPage to remove mock features
3. Update RegisterPage for real registration
4. Add proper error handling throughout
5. Implement role-based routing
6. Add token management and refresh logic
