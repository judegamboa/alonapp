# Claude Code Instructions — Client Portal MVP

> **Status: all 10 build milestones shipped as of 2026-07-23.** This is the original
> build brief, kept as written except for factual corrections noted inline. Where the
> implementation deviates from it, `DECISIONS.md` is authoritative.

You are building a multi-tenant client portal SaaS for freelancers. Follow this document strictly. When a decision isn't covered here, choose the simplest option that preserves tenant isolation, and note the decision in `DECISIONS.md`.

## What we're building

Freelancers sign up, create a branded workspace, and invite clients. Each client gets a portal (accessed by magic link, no password) showing project status, milestones, shared files, threaded messages, and payment request cards. Freelancers pay for the app via subscription tiers; clients never pay us.

Out of scope — do NOT build: payment provider integrations for client invoices (payment requests are just pasted links + a manual paid toggle), e-signatures, automations, team seats, real-time chat, time tracking, digest/reminder emails.

## Stack (fixed — do not substitute)

- Next.js App Router, TypeScript strict mode, deployed on Vercel (built on 16.2 — see `DECISIONS.md`)
- Supabase: Postgres + RLS, Auth, Storage
- Tailwind CSS; shadcn/ui for components
- Resend + React Email for transactional email
- Paddle for subscription billing (sandbox mode until launch)
- Zod for all input validation at server boundaries

## Architecture rules

1. **RLS is the security boundary.** Every table has `workspace_id uuid not null`. All authorization happens via Postgres RLS policies, not in route handlers. Route handlers may add friendly errors but must never be the only check.
2. **Two auth roles.** Freelancers: Google OAuth only — no passwords anywhere in the product (`DECISIONS.md`). Clients: magic-link OTP sessions carrying `user_role: 'client'` and `client_id` in JWT claims (use a `user_roles` table + custom claims via Supabase auth hook). The claim is `user_role`, not `role` — the reserved `role` claim maps to the Postgres role and stays `authenticated` (`DECISIONS.md`). Client sessions are read-only except for creating messages and viewing files.
3. **Server actions for mutations, server components for reads.** No client-side Supabase writes for freelancer actions; use server actions with Zod validation.
4. **Emails fire from server actions after successful DB writes**, never from the client. Message notification emails are debounced: skip sending if the same thread triggered an email within the last 15 minutes (track `last_emailed_at` on `message_threads`).
5. **Tier limits enforced server-side.** Before portal creation, check the workspace plan: free = 1 client portal, starter = 5, pro = unlimited. Return a typed error the UI turns into an upgrade prompt.

## Database schema

Create migrations in order. All tables: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`.

- `workspaces`: owner_id (auth.users fk), name, logo_url, brand_color, plan text default 'free', paddle_customer_id, paddle_subscription_id
- `clients`: workspace_id fk, name, email, invite_token, portal_slug unique, archived_at
- `projects`: workspace_id, client_id fk, name, status text check in ('not_started','in_progress','in_review','done'), sort_order
- `milestones`: workspace_id, project_id fk, title, done boolean, due_date, sort_order
- `files`: workspace_id, client_id, project_id nullable, storage_path, filename, version int default 1, size_bytes, uploaded_by text check in ('freelancer','client')
- `message_threads`: workspace_id, project_id fk, title, last_emailed_at timestamptz
- `messages`: workspace_id, thread_id fk, author_role text check in ('freelancer','client'), author_client_id nullable, body text
- `payment_requests`: workspace_id, client_id fk, amount numeric, currency text default 'USD', description, payment_url, status text check in ('unpaid','paid') default 'unpaid', paid_at

RLS policies per table:
- Freelancer (authenticated, role 'freelancer'): full CRUD where `workspace_id` belongs to a workspace they own.
- Client (role 'client'): SELECT where row's `client_id = auth.jwt() ->> 'client_id'` (for workspace-level tables, join through their client row); INSERT on `messages` only, with `author_role = 'client'`.
- Storage bucket `client-files`: path convention `{workspace_id}/{client_id}/{filename}`; policies mirror the table rules.

Write RLS tests (resolved to a Vitest suite using two Supabase test users, `tests/rls.test.ts`) proving: client A cannot read client B's rows; a client cannot read another workspace; a client cannot write anything except messages. These tests are a merge requirement.

## Routes

- `/` marketing landing (simple, one page)
- `/login`, `/signup` — freelancer auth
- `/app` — freelancer dashboard: client list, plan usage
- `/app/clients/[id]` — manage one client: projects, files, messages, payment requests, portal invite button
- `/app/settings` — workspace branding, billing (Paddle checkout/portal links)
- `/p/[portal_slug]` — client portal (magic-link gated): status overview, milestones, files, messages, payment requests, all in workspace branding
- `/api/webhooks/paddle` — subscription lifecycle: update `workspaces.plan`

## Email templates (React Email, in `/emails`)

1. `client-invite` — freelancer's logo/name/brand color, magic link CTA
2. `client-login-link` — returning client magic link
3. ~~`freelancer-auth` — verification / password reset~~ — removed with passwords; Google is the only freelancer sign-in, so there is nothing to confirm or reset
4. `new-message` — author, message preview, deep link to thread
5. `files-shared` — file count + names, link into portal (no attachments)
6. `status-update` — project name, old → new status

A 7th template, `payment-request`, was added during milestone 8 — a payment request the
client never learns about is useless, since the portal is pull-only (`DECISIONS.md`).

All client-facing emails render the workspace's branding, not ours. Send from `notifications@` on the shared domain via Resend.

## Build milestones (work in this order, commit per milestone)

1. Scaffold: Next.js + Supabase + Tailwind + shadcn, env wiring, CI with typecheck/lint/test
2. Migrations + RLS policies + RLS test suite
3. Freelancer auth, workspace creation, branding settings
4. Client CRUD, magic-link invite flow, empty portal shell rendering branding
5. Projects + milestones + status (freelancer edit, portal read-only)
6. File upload/versioning with Storage policies
7. Message threads + all 6 emails + debounce
8. Payment request cards
9. Paddle billing + tier limit enforcement
10. Polish pass: loading/empty/error states, mobile layout for the portal (clients will mostly open it on phones)

## Conventions

- Env vars in `.env.local`, documented in `.env.example`: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, RESEND_API_KEY, RESEND_FROM, PADDLE_WEBHOOK_SECRET, PADDLE_PRICE_STARTER, PADDLE_PRICE_PRO, NEXT_PUBLIC_APP_URL. `.env.example` also carries PADDLE_API_KEY, NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and NEXT_PUBLIC_PADDLE_ENV, which no code reads yet — Paddle.js checkout is unwired; billing today is webhook-in only.
- Never expose the service-role key to the client bundle; it is used only in webhook handlers and admin scripts.
- Every server action: Zod-parse input → auth check → DB write → (maybe) email → typed result.
- Prefer boring, readable code over abstractions. No premature generalization.
- Definition of done per milestone: typecheck passes, RLS tests pass, feature works logged in as freelancer AND as a magic-link client in a second browser profile.
