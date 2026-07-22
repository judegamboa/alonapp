# Alon — agent guide

Multi-tenant client-portal SaaS (see `README.md`, `docs/SPEC.md`, `docs/INSTRUCTIONS.md`). Live at https://www.alonapp.com. Log non-obvious choices in `DECISIONS.md`.

# This is NOT the Next.js you know

This is Next.js 16 with breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. Known renames: middleware is now `proxy.ts` (exported function `proxy`).

# Commands

- `npm run dev` / `npm run build` / `npm run start`
- `npm run typecheck`, `npm run lint`, `npm test` (Vitest RLS suite — local Supabase must be running)
- `npm run db:start` / `db:reset` / `db:stop` (Supabase CLI is an npm devDependency; use `npx supabase …`; needs Docker Desktop)
- Deploy: push to `main` (CI + Vercel auto-deploy). DB: `npx supabase db push` to the linked hosted project.

# Architecture rules (non-negotiable, from docs/INSTRUCTIONS.md)

1. **RLS is the security boundary** — authorization lives in Postgres policies, never only in route handlers or actions. Every table carries `workspace_id`.
2. **Two roles**: freelancers (password/OAuth) own workspaces; clients (magic-link OTP) get JWT claims `user_role: 'client'` + `client_id` via the custom access token hook reading `public.user_roles`. The reserved `role` claim stays `authenticated` — check `user_role` instead.
3. **Server actions for mutations** (Zod-parse → auth check → DB write → typed result), server components for reads. No client-side writes.
4. `user_roles` is **service-role-only** (no authenticated grants) — manage it via `createAdminClient()` (`lib/supabase/admin.ts`), server-side only.
5. Tier limits enforced server-side before portal creation (free 1 / starter 5 / pro unlimited).
6. New tables need: `workspace_id`, RLS policies for both roles, explicit grants (see `supabase/migrations/20260723000500_grants.sql`), and RLS test coverage in `tests/rls.test.ts` — the suite is a merge requirement.

# Gotchas

- shadcn here is the **Base UI** flavor: no `asChild`; use `render={<Link … />}` on Button etc.
- RLS policy subqueries re-enter RLS: use the `security definer` helpers in the `private` schema (`private.owned_workspace_ids()`, `private.jwt_client_id()`, …) instead of raw subselects.
- Local Supabase default privileges exclude DML — every new table needs explicit grants in its migration.
- Test cleanup deletes only `@test.dev` users; use `@test.dev` emails for all test/seed accounts so manual local accounts survive.
- Port 3000 may already be taken by the user's dev server — check before assuming `npm run start` succeeded.
- `.env.local` holds the local demo keys; production values live only in Vercel env. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client bundle.

# Design

Before building or changing ANY UI (pages, components, emails, the client portal), invoke the `alon-design` skill (`.claude/skills/alon-design/SKILL.md`). It defines the token palette, typography, tideline signature, component conventions, copy voice, and the quality floor. Do not introduce raw colors or new fonts outside that system. On client-facing surfaces the workspace's branding (logo + `brand_color`) wins over Alon's.
