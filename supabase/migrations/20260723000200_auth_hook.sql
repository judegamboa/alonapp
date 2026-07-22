-- Custom access token hook: injects user_role and client_id claims from user_roles.
-- The JWT's reserved `role` claim stays 'authenticated' (Postgres role mapping);
-- app role travels in `user_role`. Registered in supabase/config.toml.

create or replace function public.custom_access_token(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  claims jsonb := event -> 'claims';
  rec public.user_roles%rowtype;
begin
  select * into rec
  from public.user_roles
  where user_id = (event ->> 'user_id')::uuid;

  if found then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(rec.role));
    if rec.client_id is not null then
      claims := jsonb_set(claims, '{client_id}', to_jsonb(rec.client_id::text));
    end if;
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token to supabase_auth_admin;
revoke execute on function public.custom_access_token from authenticated, anon, public;
grant select on table public.user_roles to supabase_auth_admin;

alter table public.user_roles enable row level security;

create policy "auth admin can read user roles"
  on public.user_roles
  for select
  to supabase_auth_admin
  using (true);
-- No policies for authenticated/anon: user_roles rows are managed with the
-- service role only.
