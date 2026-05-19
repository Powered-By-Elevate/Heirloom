import { createClient } from "@supabase/supabase-js";

// Service-role client. NEVER expose to the browser. Use only in server actions
// and route handlers for operations that legitimately need to bypass RLS
// (e.g. deleting the authenticated user via the admin API).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
