-- RLS: the security boundary. Freelancers get full CRUD on rows in workspaces
-- they own; client sessions get SELECT on rows tied to their client_id claim,
-- plus INSERT on messages only.

create schema if not exists private;
grant usage on schema private to authenticated;

-- security definer helpers: policy subqueries would otherwise re-enter RLS on
-- the referenced tables (recursion) and re-run per row.

create or replace function private.owned_workspace_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select id from public.workspaces where owner_id = (select auth.uid())
$$;

create or replace function private.jwt_client_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select case
    when auth.jwt() ->> 'user_role' = 'client'
    then nullif(auth.jwt() ->> 'client_id', '')::uuid
  end
$$;

create or replace function private.client_workspace_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select workspace_id from public.clients where id = private.jwt_client_id()
$$;

create or replace function private.client_project_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select id from public.projects where client_id = private.jwt_client_id()
$$;

create or replace function private.client_thread_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select t.id
  from public.message_threads t
  join public.projects p on p.id = t.project_id
  where p.client_id = private.jwt_client_id()
$$;

revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

-- workspaces
alter table public.workspaces enable row level security;

create policy "owner full access" on public.workspaces
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "client reads own workspace branding" on public.workspaces
  for select to authenticated
  using (id = private.client_workspace_id());

-- clients
alter table public.clients enable row level security;

create policy "freelancer full access" on public.clients
  for all to authenticated
  using (workspace_id in (select private.owned_workspace_ids()))
  with check (workspace_id in (select private.owned_workspace_ids()));

create policy "client reads own row" on public.clients
  for select to authenticated
  using (id = private.jwt_client_id());

-- projects
alter table public.projects enable row level security;

create policy "freelancer full access" on public.projects
  for all to authenticated
  using (workspace_id in (select private.owned_workspace_ids()))
  with check (workspace_id in (select private.owned_workspace_ids()));

create policy "client reads own projects" on public.projects
  for select to authenticated
  using (client_id = private.jwt_client_id());

-- milestones
alter table public.milestones enable row level security;

create policy "freelancer full access" on public.milestones
  for all to authenticated
  using (workspace_id in (select private.owned_workspace_ids()))
  with check (workspace_id in (select private.owned_workspace_ids()));

create policy "client reads own milestones" on public.milestones
  for select to authenticated
  using (project_id in (select private.client_project_ids()));

-- files
alter table public.files enable row level security;

create policy "freelancer full access" on public.files
  for all to authenticated
  using (workspace_id in (select private.owned_workspace_ids()))
  with check (workspace_id in (select private.owned_workspace_ids()));

create policy "client reads own files" on public.files
  for select to authenticated
  using (client_id = private.jwt_client_id());

-- message_threads
alter table public.message_threads enable row level security;

create policy "freelancer full access" on public.message_threads
  for all to authenticated
  using (workspace_id in (select private.owned_workspace_ids()))
  with check (workspace_id in (select private.owned_workspace_ids()));

create policy "client reads own threads" on public.message_threads
  for select to authenticated
  using (project_id in (select private.client_project_ids()));

-- messages
alter table public.messages enable row level security;

create policy "freelancer full access" on public.messages
  for all to authenticated
  using (workspace_id in (select private.owned_workspace_ids()))
  with check (workspace_id in (select private.owned_workspace_ids()));

create policy "client reads own thread messages" on public.messages
  for select to authenticated
  using (thread_id in (select private.client_thread_ids()));

-- The one client write in the whole app.
create policy "client posts messages in own threads" on public.messages
  for insert to authenticated
  with check (
    author_role = 'client'
    and author_client_id = private.jwt_client_id()
    and thread_id in (select private.client_thread_ids())
    and workspace_id = private.client_workspace_id()
  );

-- payment_requests
alter table public.payment_requests enable row level security;

create policy "freelancer full access" on public.payment_requests
  for all to authenticated
  using (workspace_id in (select private.owned_workspace_ids()))
  with check (workspace_id in (select private.owned_workspace_ids()));

create policy "client reads own payment requests" on public.payment_requests
  for select to authenticated
  using (client_id = private.jwt_client_id());
