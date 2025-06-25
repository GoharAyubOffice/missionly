# Authentication Configuration Guide

This guide covers how to properly configure Supabase Authentication for your bounty platform.

## 🔐 Authentication Overview

Your platform uses Supabase Auth with the following features:
- Email/password authentication
- Email verification
- Password reset functionality
- Role-based access control
- Session management with SSR support

## 📋 Supabase Auth Configuration

### Step 1: Basic Auth Settings

1. **Go to Authentication → Settings in your Supabase dashboard**

2. **Site URL Configuration:**
   ```
   Development: http://localhost:3000
   Production: https://yourdomain.com
   ```

3. **Redirect URLs:**
   Add these URLs to allow authentication redirects:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

4. **JWT Settings:**
   - JWT expiry: 3600 (1 hour) - recommended
   - Refresh token expiry: 2592000 (30 days) - recommended

### Step 2: Email Configuration

1. **Enable Email Confirmations:**
   - ✅ Enable email confirmations
   - ✅ Enable secure email change
   - Disable if you want to skip email verification in development

2. **Email Templates (Optional):**
   Go to Authentication → Templates to customize:
   - Confirmation email
   - Magic link email  
   - Password recovery email
   - Email change confirmation

### Step 3: Advanced Security Settings

1. **Password Policy:**
   - Minimum password length: 8 characters
   - Require special characters: Recommended
   - Require numbers: Recommended

2. **Rate Limiting:**
   - Keep default settings unless you have specific needs
   - Consider increasing limits for high-traffic applications

3. **Session Settings:**
   - Auto refresh tokens: Enabled
   - Persist session: Enabled

## 🛡️ Custom Metadata Configuration

Your app uses custom metadata to store user roles. Configure this:

### User Metadata Structure

```json
{
  "name": "User Name",
  "role": "CLIENT" | "FREELANCER" | "ADMIN"
}
```

### Setting Up Custom Claims

If you need custom JWT claims, create this function in your Supabase SQL editor:

```sql
-- Function to add custom claims to JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Get user role from your users table
  SELECT role INTO user_role
  FROM public.users
  WHERE supabase_id = (event->>'user_id')::uuid;

  -- Set claims
  claims := event->'claims';
  
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  END IF;

  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
```

Then in your Supabase dashboard:
1. Go to Database → Extensions
2. Enable the `pg_net` extension
3. Go to Authentication → Hooks
4. Add the function as a JWT hook

## 🔧 Environment Variables

Ensure these environment variables are set:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

## 📱 Authentication Flow Implementation

### Registration Flow

Your app implements this registration flow:

1. **User submits registration form**
2. **Supabase creates auth user with metadata**
3. **Your app creates user record in database**
4. **Email verification sent (if enabled)**
5. **User redirected to appropriate dashboard**

### Login Flow

1. **User submits credentials**
2. **Supabase validates and creates session**
3. **Your app fetches user data from database**
4. **User redirected based on role**

### Password Reset Flow

1. **User requests password reset**
2. **Supabase sends reset email**
3. **User clicks link → redirected to reset page**
4. **User sets new password**
5. **Automatic login with new password**

## 🎭 Role-Based Access Control

### User Roles

Your platform supports these roles:

- **CLIENT**: Can create and manage bounties
- **FREELANCER**: Can apply to and work on bounties  
- **ADMIN**: Full platform management access
- **MODERATOR**: Limited admin access

### Role Assignment

Roles are assigned during registration and stored in:
1. **Supabase user metadata** (for quick access)
2. **Database users table** (for complex queries)

### Role Checking in Code

```typescript
// Client-side role checking
import { useUser } from '@/hooks/useUser';

const { user, isLoading } = useUser();

if (user?.role === 'CLIENT') {
  // Show client-specific UI
}

// Server-side role checking
import { createSupabaseServerClient } from '@/lib/supabase/server';

const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();

// Get user role from database
const dbUser = await prisma.user.findUnique({
  where: { supabaseId: user?.id }
});
```

## 🔒 Security Best Practices

### 1. Row Level Security (RLS)

All your database tables have RLS enabled with policies that:
- Users can only access their own data
- Role-based permissions are enforced
- Service role has admin access

### 2. API Route Protection

Protect your API routes:

```typescript
// pages/api/protected-route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function handler(req, res) {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Your protected logic here
}
```

### 3. Client-Side Protection

Protect your pages and components:

```typescript
// Use middleware for route protection
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}
```

## 🧪 Testing Authentication

### Test User Registration

1. **Create test account:**
   ```bash
   curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
   -H 'apikey: your-anon-key' \
   -H 'Content-Type: application/json' \
   -d '{
     "email": "test@example.com",
     "password": "testpassword123",
     "data": {
       "name": "Test User",
       "role": "CLIENT"
     }
   }'
   ```

2. **Check user in dashboard:**
   - Go to Authentication → Users
   - Verify user appears with correct metadata

### Test Login

1. **Login via API:**
   ```bash
   curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
   -H 'apikey: your-anon-key' \
   -H 'Content-Type: application/json' \
   -d '{
     "email": "test@example.com",
     "password": "testpassword123"
   }'
   ```

2. **Test in your app:**
   - Use registration/login forms
   - Check session persistence
   - Verify role-based redirects

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid login credentials" error:**
   - Check email/password are correct
   - Verify email is confirmed (if required)
   - Check user status in Auth dashboard

2. **Session not persisting:**
   - Verify cookie settings
   - Check middleware configuration
   - Ensure environment variables are correct

3. **Role not available in frontend:**
   - Check user metadata in Auth dashboard
   - Verify database user record exists
   - Check useUser hook implementation

4. **RLS blocking queries:**
   - Verify user is authenticated
   - Check RLS policies are correct
   - Test with service role key

### Debug Tips

1. **Enable Supabase debug logging:**
   ```typescript
   const supabase = createBrowserClient(url, key, {
     auth: {
       debug: process.env.NODE_ENV === 'development'
     }
   });
   ```

2. **Check browser network tab:**
   - Look for auth API calls
   - Check response status codes
   - Verify JWT tokens

3. **Use Supabase logs:**
   - Go to Logs in Supabase dashboard
   - Filter by Auth logs
   - Look for error messages

## ✅ Authentication Checklist

- [ ] Site URL configured correctly
- [ ] Redirect URLs added
- [ ] Email confirmation settings configured
- [ ] Password policy set
- [ ] Custom metadata structure defined
- [ ] Environment variables set
- [ ] RLS policies applied
- [ ] Role-based access implemented
- [ ] Middleware protection configured
- [ ] API route protection implemented
- [ ] Test users created and verified
- [ ] Login/logout flow tested
- [ ] Password reset tested
- [ ] Session persistence verified

Your authentication system is now fully configured! 🔐