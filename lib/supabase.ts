// Supabase client helper: creates a configured browser Supabase client for auth.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Backwards-compatible alias (in case other parts of the codebase still import the old name).
export function getSupabaseClient() {
  return createClient();
}

