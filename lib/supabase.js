
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase instance (for use in components/pages)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase instance (for use in API routes, etc.)
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing server Supabase env vars.');
  return createClient(url, key, { auth: { persistSession: false } });
}
