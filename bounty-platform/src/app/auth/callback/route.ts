import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createUserProfile } from '@/lib/createUser';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const role = requestUrl.searchParams.get('role') as 'CLIENT' | 'FREELANCER' | null;
  const error = requestUrl.searchParams.get('error');
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error from provider:', error);
    const errorMessage = error === 'access_denied' ? 'oauth-cancelled' : 'oauth-error';
    return NextResponse.redirect(new URL(`/login?error=${errorMessage}`, requestUrl.origin));
  }
  
  if (code) {
    const supabase = await createSupabaseServerClient();
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=auth-error', requestUrl.origin));
      }
      
      if (data.user) {
        console.log('User authenticated via OAuth:', data.user.id);
        
        // For Google OAuth, determine role or use provided role
        const userRole = data.user.user_metadata?.role || role || 'CLIENT';
        
        // Check if this is a new user (first time OAuth)
        const isNewUser = !data.user.user_metadata?.profile_created;
        
        if (isNewUser) {
          const displayName = data.user.user_metadata?.full_name || 
                             data.user.user_metadata?.name || 
                             data.user.email?.split('@')[0] || 'User';
          
          try {
            await createUserProfile(data.user.id, data.user.email!, displayName, userRole);
            
            // Update user metadata to indicate profile has been created
            await supabase.auth.updateUser({
              data: {
                ...data.user.user_metadata,
                profile_created: true,
                role: userRole,
              }
            });
            
            console.log('Created user profile for OAuth user:', data.user.id);
          } catch (profileError) {
            console.error('Failed to create user profile:', profileError);
            // For development, continue anyway if it's a database connection issue
            if (profileError instanceof Error && profileError.message.includes('FATAL: Tenant or user not found')) {
              console.log('Continuing OAuth flow despite database error (development mode)');
            } else {
              // Redirect to login with error if profile creation fails for other reasons
              return NextResponse.redirect(new URL('/login?error=profile-creation-failed', requestUrl.origin));
            }
          }
        }
        
        // Determine redirect URL based on user role
        const redirectTo = userRole === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer';
        
        // Add success parameter for new users
        const redirectUrl = new URL(redirectTo, requestUrl.origin);
        if (isNewUser) {
          redirectUrl.searchParams.set('welcome', 'true');
        }
        
        return NextResponse.redirect(redirectUrl);
      }
    } catch (callbackError) {
      console.error('Auth callback error:', callbackError);
      return NextResponse.redirect(new URL('/login?error=auth-error', requestUrl.origin));
    }
  }

  // If there's no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=no-code', requestUrl.origin));
}