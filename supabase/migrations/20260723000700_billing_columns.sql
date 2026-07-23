-- Billing columns are service-role territory.
--
-- Until now "owner full access" (20260723000300) plus the blanket table grant
-- (20260723000500) let a freelancer write EVERY column on their own workspace
-- row — including `plan`. A signed-in user could simply call
--   supabase.from('workspaces').update({ plan: 'pro' })
-- with the public anon key and promote themselves, making every tier limit
-- decorative. RLS can't scope to columns, so column privileges do it.
--
-- Note: revoking a column privilege does NOT override a table-level grant
-- (Postgres treats them separately), so the table-level privilege has to go
-- first and the safe columns get granted back explicitly.

revoke insert, update on public.workspaces from authenticated;

-- Onboarding (createWorkspace) writes owner_id/name/brand_color; `plan` falls
-- back to its DEFAULT 'free'. Settings (updateBranding) writes the rest.
grant insert (owner_id, name, logo_url, brand_color)
  on public.workspaces to authenticated;
grant update (name, logo_url, brand_color)
  on public.workspaces to authenticated;

-- One Paddle subscription can only ever back one workspace, so a replayed or
-- misrouted webhook can't attach it to a second.
create unique index workspaces_paddle_subscription_id_key
  on public.workspaces (paddle_subscription_id)
  where paddle_subscription_id is not null;
