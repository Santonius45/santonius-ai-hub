import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  // Menggunakan nama variabel yang sesuai dengan .env.local kamu:
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  return createBrowserClient(supabaseUrl, supabaseKey);
}