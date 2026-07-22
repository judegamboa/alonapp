# Decisions

Log of choices not fully specified by INSTRUCTIONS.md / SPEC.md, per the "note the decision" rule.

- **2026-07-23 — Product name/folder:** `alonapp` after the chosen domain alonapp.com; product name "Alon".
- **2026-07-23 — Next.js 16.2:** `create-next-app@latest` produced Next 16 (spec says 14+). Kept — newest App Router, TS strict on by default.
- **2026-07-23 — RLS tests in Vitest, not pgTAP:** TypeScript suite (`tests/rls.test.ts`) using `@supabase/supabase-js`; service-role client seeds fixtures, per-role user clients assert isolation. Same `npm test` entry point locally and in CI, no extra pg tooling.
- **2026-07-23 — Supabase CLI as npm devDependency:** no global install needed; `npx supabase …` works identically locally and in CI.
- **2026-07-23 — Client JWT claims via custom access token auth hook:** Postgres function `public.custom_access_token(event jsonb)` reads `public.user_roles` and injects `user_role` + `client_id` claims; registered in `supabase/config.toml`. Freelancers get `user_role: 'freelancer'` on workspace creation; client users get `user_role: 'client'` + their `client_id`.
- **2026-07-23 — Client file uploads deferred:** INSTRUCTIONS.md's RLS section says client sessions may INSERT on `messages` only (and the merge-required tests assert exactly that), so storage/table policies give clients read-only file access. `files.uploaded_by = 'client'` stays in the schema for when uploads land in v2.
- **2026-07-23 — JWT claim named `user_role`, not `role`:** the reserved `role` claim maps to the Postgres role (`authenticated`) and can't safely carry `'client'`; policies check `auth.jwt() ->> 'user_role'` instead.
- **2026-07-23 — Production deployed early (before milestone 3):** hosted Supabase project `fvsupccynnhqeywpuukg` in `ap-southeast-1` (Singapore, closest region to PH); Vercel project `alonapp` with GitHub push-to-deploy from `judegamboa/alonapp` main; live at https://www.alonapp.com (apex alonapp.com redirects to www; alonapp.vercel.app also serves). All 5 migrations pushed; auth config (custom access token hook) synced via `supabase config push`. DB password lives with the owner only (resettable in the dashboard), service-role key only in Vercel production env.
- **2026-07-23 — Local dev via Supabase CLI (Docker):** no hosted project yet; hosted project + Vercel wiring deferred to deployment.
