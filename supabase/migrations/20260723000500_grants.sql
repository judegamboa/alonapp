-- Explicit table grants. The local stack's default privileges don't include
-- DML on migration-created tables, and explicit grants beat relying on
-- defaults anyway. Row visibility is still enforced entirely by RLS.

grant select, insert, update, delete on all tables in schema public
  to authenticated, service_role;

-- user_roles is managed by the service role only (auth hook reads it as
-- supabase_auth_admin, granted in 20260723000200).
revoke select, insert, update, delete on public.user_roles
  from authenticated, anon;
