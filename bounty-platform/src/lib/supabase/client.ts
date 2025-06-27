import { createBrowserClient } from '@supabase/ssr';
import { clientConfig } from '@/config/client';

export const supabase = createBrowserClient(
  clientConfig.NEXT_PUBLIC_SUPABASE_URL,
  clientConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function createSupabaseClient() {
  return createBrowserClient(
    clientConfig.NEXT_PUBLIC_SUPABASE_URL,
    clientConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export type SupabaseClient = typeof supabase;