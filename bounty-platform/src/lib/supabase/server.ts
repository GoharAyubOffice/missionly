import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerConfig } from '@/config';

export async function createSupabaseServerClient() {
  const config = getServerConfig();
  const cookieStore = await cookies();

  return createServerClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// For use in API routes and server actions
export async function createSupabaseServiceClient() {
  const config = getServerConfig();
  
  return createServerClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}