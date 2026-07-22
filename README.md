# Alon

Branded client portals for freelancers — live at [alonapp.com](https://www.alonapp.com).

Freelancers sign up, brand a workspace, and invite clients. Each client gets a portal (magic-link access, no password) showing project status, milestones, shared files, threaded messages, and payment request cards. Built for Filipino freelancers serving overseas clients.

Full product spec: [`docs/SPEC.md`](docs/SPEC.md) · build instructions: [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md) · decision log: [`DECISIONS.md`](DECISIONS.md)

## Stack

- **Next.js 16** (App Router, TypeScript strict) on Vercel
- **Supabase** — Postgres with RLS as the security boundary, Auth (password/OAuth for freelancers, magic-link OTP for clients), Storage
- **Tailwind CSS 4 + shadcn/ui** (Base UI flavor)
- **Resend + React Email** for transactional email (upcoming milestone)
- **Paddle** for subscription billing (upcoming milestone)
- **Zod** validation at every server boundary

## Local development

Prereqs: Node 22+, Docker Desktop (for local Supabase).

```bash
npm install
npm run db:start      # boots local Supabase (Postgres/Auth/Storage) in Docker
cp .env.example .env.local   # then fill values from `npx supabase status`
npm run dev           # http://localhost:3000
```

Useful:

```bash
npm run db:reset      # re-apply all migrations to the local DB
npm test              # RLS isolation suite (needs db:start running)
npm run typecheck && npm run lint
```

Local Supabase Studio: http://localhost:54323 · emails land in Mailpit: http://localhost:54324

## Project structure

```
app/
  page.tsx                 # marketing landing
  (auth)/                  # /login, /signup + auth server actions
  auth/
    callback/route.ts      # OAuth / email-confirm code exchange
    confirm/route.ts       # magic-link token verification (client invites)
  app/                     # freelancer app (session-guarded by proxy.ts)
    page.tsx               # dashboard: client list, plan usage, add client
    onboarding/            # first-run workspace creation
    settings/              # branding (name, color, logo) + billing placeholder
    clients/[id]/          # manage one client: invite link, projects, milestones
    projects/actions.ts    # project + milestone server actions
  p/[portal_slug]/         # client portal (workspace-branded, RLS-scoped)
components/
  tideline.tsx             # the wave signature element
  ui/                      # shadcn/ui (Base UI flavor)
lib/
  supabase/                # browser / server / admin clients + proxy session
  workspace.ts, status.ts, slug.ts
proxy.ts                   # Next 16 middleware: session refresh + /app guard
supabase/
  config.toml              # local stack config incl. custom access token hook
  migrations/              # tables → auth hook → RLS → storage → grants
tests/
  rls.test.ts              # tenant-isolation suite (merge requirement)
emails/                    # React Email templates (upcoming milestone)
.claude/skills/alon-design # design-system skill for AI-assisted work
docs/                      # SPEC.md, INSTRUCTIONS.md
```

## Architecture in one paragraph

Every table carries `workspace_id`; **all authorization lives in Postgres RLS policies**, not route handlers. Freelancers get full CRUD on workspaces they own; client sessions (JWT claims `user_role: 'client'` + `client_id`, stamped by a custom access token hook reading `user_roles`) can read only rows tied to their `client_id` and can write only `messages`. The RLS test suite (`tests/rls.test.ts`) proves tenant isolation and is a merge requirement — CI runs it against a fresh local stack on every push.

## Deployment

Push to `main` → GitHub Actions CI (typecheck, lint, RLS tests) and Vercel auto-deploy. Database changes ship via `npx supabase db push` to the linked hosted project (`ap-southeast-1`). Production env vars live in Vercel; the service-role key is server-only.

## Design

The visual system (ocean-ink palette, Bricolage Grotesque display, the tideline signature) is documented as a Claude Code skill at [`.claude/skills/alon-design/SKILL.md`](.claude/skills/alon-design/SKILL.md) — read it before touching UI.
