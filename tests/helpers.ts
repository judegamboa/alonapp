import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Locally, pull env from .env.local; in CI the vars are set directly
// (dotenv never overrides existing values).
config({ path: ".env.local" });

const url = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !anonKey || !serviceRoleKey) {
  throw new Error(
    "SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY must be set (is `npm run db:start` running?)"
  );
}

export const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "test-password-123";

/** Create a confirmed auth user and return its id. */
export async function createUser(email: string): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

/**
 * Sign in as an existing user and return a client whose requests carry that
 * user's JWT (including claims stamped by the custom access token hook).
 */
export async function signIn(email: string): Promise<SupabaseClient> {
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });
  if (error) throw error;
  return client;
}

/** Delete all test users (cascades through workspaces → all tenant data). */
export async function deleteAllUsers() {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  await Promise.all(
    data.users.map((u) => admin.auth.admin.deleteUser(u.id))
  );
}
