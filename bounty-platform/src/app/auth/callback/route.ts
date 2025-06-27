import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = await createSupabaseServerClient();
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Get user role from metadata
      const userRole = data.user.user_metadata?.role || 'CLIENT';
      
      // Redirect to appropriate dashboard
      const redirectTo = userRole === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer';
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=auth-error', requestUrl.origin));
}