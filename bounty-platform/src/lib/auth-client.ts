'use client';

import { createSupabaseClient } from '@/lib/supabase/client';
import type { Provider } from '@supabase/supabase-js';

export interface OAuthOptions {
  role?: 'CLIENT' | 'FREELANCER';
  redirectTo?: string;
}

export async function signInWithOAuth(provider: Provider, options: OAuthOptions = {}) {
  const supabase = createSupabaseClient();
  
  const redirectTo = options.redirectTo || `${window.location.origin}/auth/callback`;
  const finalRedirectTo = options.role ? `${redirectTo}?role=${options.role}` : redirectTo;
  
  console.log('Starting OAuth with:', { provider, redirectTo: finalRedirectTo });
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: finalRedirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      scopes: 'openid email profile',
      skipBrowserRedirect: false,
    },
  });

  if (error) {
    console.error(`${provider} OAuth error:`, error);
    throw new Error(error.message);
  }

  if (!data.url) {
    console.error('No OAuth URL returned from Supabase');
    throw new Error('Failed to get OAuth URL from Supabase');
  }

  console.log('OAuth URL received:', data.url);
  return data;
}

export async function signInWithGoogle(role?: 'CLIENT' | 'FREELANCER') {
  return signInWithOAuth('google', { role });
}