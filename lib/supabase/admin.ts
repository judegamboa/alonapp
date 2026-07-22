import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client. Bypasses RLS — use only in webhook handlers and
// admin scripts, never with user-controlled filters.
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
