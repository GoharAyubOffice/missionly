import { createBrowserClient } from '@supabase/ssr';
import { getPublicConfig } from '@/config';

const config = getPublicConfig();

export const supabase = createBrowserClient(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type SupabaseClient = typeof supabase;