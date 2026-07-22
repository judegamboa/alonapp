# Decisions

Log of choices not fully specified by INSTRUCTIONS.md / SPEC.md, per the "note the decision" rule.

- **2026-07-23 — Product name/folder:** `alonapp` after the chosen domain alonapp.com; product name "Alon".
- **2026-07-23 — Next.js 16.2:** `create-next-app@latest` produced Next 16 (spec says 14+). Kept — newest App Router, TS strict on by default.
- **2026-07-23 — RLS tests in Vitest, not pgTAP:** TypeScript suite (`tests/rls.test.ts`) using `@supabase/supabase-js`; service-role client seeds fixtures, per-role user clients assert isolation. Same `npm test` entry point locally and in CI, no extra pg tooling.
- **2026-07-23 — Supabase CLI as npm devDependency:** no global install needed; `npx supabase …` works identically locally and in CI.
- **2026-07-23 — Client JWT claims via custom access token auth hook:** Postgres function `public.custom_access_token(event jsonb)` reads `public.user_roles` and injects `user_role` + `client_id` claims; registered in `supabase/config.toml`. Freelancers get `user_role: 'freelancer'` on workspace creation; client users get `user_role: 'client'` + their `client_id`.
- **2026-07-23 — Local dev via Supabase CLI (Docker):** no hosted project yet; hosted project + Vercel wiring deferred to deployment.
