import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { serverConfig } from '@/config/server';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    serverConfig.NEXT_PUBLIC_SUPABASE_URL,
    serverConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
  return createServerClient(
    serverConfig.NEXT_PUBLIC_SUPABASE_URL,
    serverConfig.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}