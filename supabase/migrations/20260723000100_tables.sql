-- Core schema: 8 product tables + user_roles.
-- Every product table carries workspace_id; RLS (next migrations) is the security boundary.

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  logo_url text,
  brand_color text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  paddle_customer_id text,
  paddle_subscription_id text
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  email text not null,
  invite_token text,
  portal_slug text not null unique,
  archived_at timestamptz
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'in_review', 'done')),
  sort_order int not null default 0
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  sort_order int not null default 0
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  storage_path text not null,
  filename text not null,
  version int not null default 1,
  size_bytes bigint,
  uploaded_by text not null check (uploaded_by in ('freelancer', 'client'))
);

create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  last_emailed_at timestamptz
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  thread_id uuid not null references public.message_threads (id) on delete cascade,
  author_role text not null check (author_role in ('freelancer', 'client')),
  author_client_id uuid references public.clients (id) on delete set null,
  body text not null
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  amount numeric not null,
  currency text not null default 'USD',
  description text,
  payment_url text,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid')),
  paid_at timestamptz
);

-- Maps auth users to their app role; read by the custom access token hook
-- to stamp user_role / client_id claims into JWTs.
create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null check (role in ('freelancer', 'client')),
  client_id uuid references public.clients (id) on delete cascade,
  check (role != 'client' or client_id is not null)
);

create index on public.clients (workspace_id);
create index on public.projects (workspace_id);
create index on public.projects (client_id);
create index on public.milestones (project_id);
create index on public.files (client_id);
create index on public.message_threads (project_id);
create index on public.messages (thread_id);
create index on public.payment_requests (client_id);
create index on public.user_roles (client_id);
