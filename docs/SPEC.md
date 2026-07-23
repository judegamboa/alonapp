# Client Portal — Locked MVP Spec

> **Status: the MVP shipped as of 2026-07-23** — all five build weeks below are complete
> and the app is live at alonapp.com. This is the original locked spec, kept as written
> except for factual corrections noted inline. `DECISIONS.md` records every deviation.

**Product:** A webapp where freelancers and small agencies give each client a branded portal showing project status, shared files, messages, and payment requests — replacing the email/Messenger/Google Drive juggle.

**Primary market:** Philippine freelancers (VAs, bookkeepers, designers, developers) serving mostly US/AU clients. Product UI in English; marketing in Taglish.

**Core promise:** "Look like an agency to your overseas clients. Never answer 'where are we on this?' again."

---

## Pricing (locked)

| Tier | Price | Limits |
|---|---|---|
| Free | ₱0 | 1 active client portal, app-branded watermark |
| Starter | ₱499/mo | 5 client portals, custom branding (logo + colors) |
| Pro | ₱1,499/mo | Unlimited portals, custom portal subdomain *(not built — see `DECISIONS.md`)*, priority support |

- Billing provider: **Paddle** (merchant of record, supports PH sellers) — chosen over Lemon Squeezy in week 5, since the schema already carried `paddle_*` columns. PayMongo remains the fallback if GCash/Maya billing proves necessary for conversion.
- Tier limits enforced server-side against the workspace's plan.

## In scope (must ship)

1. **Auth & workspaces** — freelancer signs up (email/password or Google OAuth), creates a workspace with name, logo, brand color.
2. **Client portals** — one portal per client. Clients access via **magic link only** (no passwords). Portal shows the freelancer's branding, project status, files, messages, and payment requests.
3. **Projects & milestones** — per client: projects with a simple status (e.g. Not started / In progress / In review / Done) and an ordered milestone list. Freelancer edits; client sees read-only.
4. **File sharing** — upload/download scoped per client, with basic version history (re-upload same filename = new version).
5. **Messaging** — async threaded comments per project. Not real-time chat.
6. **Payment request cards** — amount, currency, description, and a pasted payment link (PayPal.me, Wise request, GCash number, etc.), plus a manual "mark as paid" toggle. **No payment provider integration.**
7. **Subscription billing** — freelancer plan management and limit enforcement.

## Transactional email (6 templates, via Resend + React Email)

*A 7th, `payment-request`, was added during the build — see `DECISIONS.md`.*

1. Client portal invite (freelancer-branded magic link — the most important template)
2. Magic link re-login for returning clients
3. Freelancer verification / password reset
4. New message notification (debounced: skip if same thread emailed in last 15 min)
5. Files shared notification (links into portal, never attachments)
6. Project/milestone status update

## Explicitly out of scope (v2 backlog)

- Invoicing / payment provider integrations (PayPal, Wise, PayMongo, Stripe)
- E-signatures, approvals, automations
- Team seats, white-label, client analytics
- Digest emails, dunning/overdue reminders, notification preferences (single activity-email toggle only)
- Time tracking, native mobile apps, real-time chat

## Tech stack (locked)

- **Next.js (App Router) on Vercel** — server actions + API routes (built on 16.2)
- **Supabase** — Postgres (with row-level security), Auth (password/OAuth for freelancers, magic-link OTP for clients), Storage (client files)
- **Resend + React Email** — transactional email from a shared sending domain
- **Paddle** — subscription billing (only third-party payments integration in the MVP)

## Data model (8 tables)

`workspaces` → `clients` → `projects` → (`milestones`, `files`, `message_threads`, `messages`, `payment_requests`)

Every table carries `workspace_id`. RLS enforces: freelancers read/write only their workspace; client sessions read only rows tied to their own `client_id`. Permission logic lives in the database, not route handlers.

## Build order (~5 weeks)

1. **Week 1:** Auth, workspaces, branding settings; schema + RLS policies
2. **Week 2:** Client CRUD, portal shell, magic-link client access
3. **Week 3:** Projects, milestones, status updates; file upload/versioning
4. **Week 4:** Messaging threads; all 6 email templates with debounce
5. **Week 5:** Payment request cards; subscription billing + tier limits; polish and deploy

## Success criteria for the MVP

- A freelancer can onboard, brand their workspace, invite a client, and the client lands in a working portal within 10 minutes.
- No cross-tenant data access is possible even with a forged request (verified by RLS tests).
- Every activity (message, file, status change) triggers exactly one correctly branded email.
- Free-tier limit (1 portal) blocks creation of a second portal with an upgrade prompt.
