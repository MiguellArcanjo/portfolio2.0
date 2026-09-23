import { createBrowserClient } from '@supabase/ssr';

// Browser client for Client Components. The publishable key is safe to expose; access is governed by RLS policies.
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
