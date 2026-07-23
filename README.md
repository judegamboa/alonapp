# Alon

Branded client portals for freelancers — live at [alonapp.com](https://www.alonapp.com).

Freelancers sign up, brand a workspace, and invite clients. Each client gets a portal (magic-link access, no password) showing project status, milestones, shared files, threaded messages, and payment request cards. Built for Filipino freelancers serving overseas clients.

**New here? Start with [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** — how the system works, from system context down to the RLS model.

Full product spec: [`docs/SPEC.md`](docs/SPEC.md) · build instructions: [`docs/INSTRUCTIONS.md`](docs/INSTRUCTIONS.md) · decision log: [`DECISIONS.md`](DECISIONS.md)

## Stack

- **Next.js 16** (App Router, TypeScript strict) on Vercel
- **Supabase** — Postgres with RLS as the security boundary, Auth (password/OAuth for freelancers, magic-link OTP for clients), Storage
- **Tailwind CSS 4 + shadcn/ui** (Base UI flavor)
- **Resend + React Email** for transactional email (7 templates in `emails/`)
- **Paddle** for subscription billing — webhook-driven plan updates
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
npm test              # RLS isolation suite (needs db:start) + Paddle signature suite (no DB)
npm run typecheck && npm run lint
```

Local Supabase Studio: http://localhost:54323 · emails land in Mailpit: http://localhost:54324

## Project structure

```
alonapp/
├── app/
│   ├── page.tsx                    # marketing landing
│   ├── layout.tsx                  # fonts, analytics, global shell
│   ├── globals.css                 # design tokens (ocean-ink palette)
│   ├── not-found.tsx               # 404
│   ├── global-error.tsx            # root error boundary
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── auth-form.tsx
│   │   └── actions.ts              # sign up / in / out, Google OAuth
│   ├── auth/
│   │   ├── callback/route.ts       # OAuth / email-confirm code exchange
│   │   └── confirm/route.ts        # magic-link token verification (client invites)
│   ├── api/webhooks/paddle/route.ts # subscription lifecycle → workspaces.plan
│   ├── app/                        # freelancer app (session-guarded by proxy.ts)
│   │   ├── page.tsx                # dashboard: client list, plan usage, add client
│   │   ├── layout.tsx              # header, nav, client-role redirect guard
│   │   ├── nav-links.tsx           # nav with the micro-tideline active state
│   │   ├── loading.tsx / error.tsx # route-level pending + error states
│   │   ├── actions.ts              # workspace creation / branding
│   │   ├── onboarding/page.tsx     # first-run workspace creation
│   │   ├── settings/               # branding form + billing section (plans, usage)
│   │   ├── billing/actions.ts      # plan reads, dev-only plan switcher
│   │   ├── clients/
│   │   │   ├── actions.ts          # add / archive client, invite-link generation
│   │   │   └── [id]/               # one client: projects, files, messages, payments
│   │   ├── projects/actions.ts     # project + milestone server actions
│   │   ├── files/actions.ts        # upload + versioning
│   │   ├── messages/actions.ts     # threads + replies (debounced notifications)
│   │   └── payment-requests/actions.ts
│   └── p/
│       └── [portal_slug]/          # client portal (workspace-branded, RLS-scoped)
│           ├── page.tsx
│           ├── actions.ts          # client-side replies (the only client write)
│           └── loading.tsx / error.tsx
├── components/
│   ├── tideline.tsx                # the wave signature element
│   ├── message-thread.tsx          # shared thread UI (app + portal)
│   ├── dev-notice.tsx              # in-development banner on Alon's own surfaces
│   └── ui/                         # shadcn/ui (Base UI flavor)
├── lib/
│   ├── supabase/                   # browser / server / admin clients + proxy session
│   ├── workspace.ts                # workspace fetch + plan limits
│   ├── status.ts                   # project status enum + labels
│   ├── slug.ts                     # portal slug generation
│   ├── email.ts                    # Resend wrapper (no-ops without RESEND_API_KEY)
│   ├── notify.ts                   # which template fires for which event
│   ├── files.ts                    # storage paths + version resolution
│   ├── messages.ts                 # thread queries + debounce bookkeeping
│   ├── currency.ts                 # Intl formatting with a plain-text fallback
│   └── paddle.ts                   # webhook signature verification, plan mapping
├── proxy.ts                        # Next 16 middleware: session refresh + /app guard
├── supabase/
│   ├── config.toml                 # local stack config incl. custom access token hook
│   └── migrations/                 # tables → auth hook → RLS → storage → grants
│                                   #   → branding bucket → billing column privileges
├── tests/
│   ├── helpers.ts                  # fixture seeding via service role
│   ├── rls.test.ts                 # tenant-isolation suite (merge requirement)
│   └── paddle-signature.test.ts    # webhook HMAC: tamper / replay / malformed
├── emails/                         # React Email templates (7) + branded-email shell
├── .claude/skills/alon-design/     # design-system skill for AI-assisted work
└── docs/                           # SPEC.md, INSTRUCTIONS.md
```

## Architecture in one paragraph

Every table carries `workspace_id`; **all authorization lives in Postgres RLS policies**, not route handlers. Freelancers get full CRUD on workspaces they own; client sessions (JWT claims `user_role: 'client'` + `client_id`, stamped by a custom access token hook reading `user_roles`) can read only rows tied to their `client_id` and can write only `messages`. The RLS test suite (`tests/rls.test.ts`) proves tenant isolation and is a merge requirement — CI runs it against a fresh local stack on every push.

## Deployment

Push to `main` → GitHub Actions CI (typecheck, lint, RLS tests) and Vercel auto-deploy. Database changes ship via `npx supabase db push` to the linked hosted project (`ap-southeast-1`). Production env vars live in Vercel; the service-role key is server-only.

## Design

The visual system (ocean-ink palette, Bricolage Grotesque display, the tideline signature) is documented as a Claude Code skill at [`.claude/skills/alon-design/SKILL.md`](.claude/skills/alon-design/SKILL.md) — read it before touching UI.
