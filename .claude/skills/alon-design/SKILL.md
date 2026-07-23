---
name: alon-design
description: Alon's design system — palette, typography, tideline signature, component and copy rules. Use whenever building or modifying ANY UI in this repo (pages, components, emails, the client portal) so every surface stays on-brand.
---

# Alon design system

Alon ("wave" in Tagalog) is a client-portal SaaS for Filipino freelancers with overseas clients. The brand personality is **calm premium**: quietly confident, agency-grade. The product's own design must prove its promise — "look like an agency, not an inbox." References for the league we play in: copilot.com, linear.app, stripe.com.

## Non-negotiables

1. **Use the tokens, never raw colors.** All colors live in `app/globals.css` as shadcn CSS variables. Style with Tailwind semantic utilities (`bg-background`, `text-muted-foreground`, `bg-primary`, `border`), not hex values or Tailwind palette colors (`teal-600`, `gray-500` are forbidden in app code).
2. **One accent.** `primary` (deep tide teal) is the only accent — CTAs, links, active states, focus rings. `destructive` is for errors only, never decoration.
3. **Spend boldness on the tideline only.** Everything else: 1px borders, subtle shadows (`shadow-lg shadow-primary/5` max), generous whitespace, `rounded-lg`/`rounded-xl`.
4. **Workspace branding beats Alon branding on client-facing surfaces.** Client portals and client emails render the freelancer's `logo_url` + `brand_color`, with Alon reduced to a small watermark (free tier) or nothing. Alon's own look applies to the marketing site, auth, and the freelancer app only.

## Palette (defined in `app/globals.css`)

| Token name | Hex (light) | Used as |
|---|---|---|
| ink | `#10231F` | `--foreground` — all primary text |
| paper | `#FAFBF9` | `--background` — page ground |
| tide | `#0E6B5C` | `--primary`, `--ring` — the single accent |
| seaglass | `#DCEAE4` | `--accent` — tints, hovers, selected |
| driftline | `#5C6F6B` | `--muted-foreground` — secondary text |
| signal | `#B94A2C` | `--destructive` — errors only |

Cards are pure white on the paper ground. Dark mode variants exist in the same file; edit both when adding tokens.

## Typography

- **Display: Bricolage Grotesque** (`font-heading`, weights 600/700, loaded in `app/layout.tsx` as `--font-display`). For h1/h2 on marketing pages, card titles on auth, page titles in the app. Use with restraint — it's the personality, not the workhorse.
- **UI/body: Geist Sans** (`font-sans`, default). Everything else. App UI stays 14–16px.
- **Data: Geist Mono** (`font-mono`). Numbers that matter: prices, amounts, plan usage counts.
- Marketing h1 scale: `text-4xl sm:text-6xl`, `tracking-tight`.

## The tideline (signature element)

`components/tideline.tsx` — a single thin SVG sine wave. Usage map:
- Animated (`animated` prop) **only once per page**, under a hero headline. The draw animation + reduced-motion fallback live in `globals.css` (`.tideline-draw`).
- Static, low opacity (`text-primary/30`–`/40`): section dividers, footer, behind auth card.
- Micro (h-2): active-nav underline (see `app/app/nav-links.tsx`).
- Never: as a repeating background, at full opacity in body content, or more than ~3 instances per screen.

## Components

- shadcn/ui (Base UI flavor) from `components/ui/*`. Note: **no `asChild`** — use the `render` prop: `<Button render={<Link href="..." />}>Label</Button>`.
- Add new shadcn components with `npx shadcn@latest add <name>`; they inherit the tokens automatically.
- Status/plan badges: `Badge` with `bg-accent text-accent-foreground`, or outline tinted with the workspace brand color on client-facing surfaces.
- `components/dev-notice.tsx` — the in-development notice. Belongs on Alon's own surfaces (landing, auth, the freelancer app) and **never** inside a client portal, where the freelancer's brand is what the client should see.
- `emails/components/branded-email.tsx` — the shared shell every template renders inside. It carries the workspace logo, name, and `brand_color`; build new templates on top of it rather than restating the branding rule per template.

## Copy voice

- Sentence case everywhere, including buttons and titles.
- Plain active verbs; buttons say exactly what happens ("Save branding", not "Submit"). Action keeps its name through the flow (Publish → "Published").
- Marketing copy is English throughout — most clients read the portal from outside the Philippines, so Taglish stays out of anything client-facing or public.
- Errors state what went wrong and what to do next; no apologies, no vagueness. Empty states invite the next action.
- Name things by what users control ("client portal", "payment request"), never by implementation ("row", "webhook", "record").

## Layout rhythm

- Marketing: `max-w-5xl mx-auto px-6`, sections `py-16`–`py-20`, alternate `bg-background` / `bg-card` with `border-y`.
- App: `max-w-4xl mx-auto px-4 py-8`, header `bg-card border-b` with lowercase `alon` wordmark (`font-heading`).
- Responsive: single column below `sm`; the client portal must be excellent on phones — clients mostly open it there.

## Quality floor (every screen, unannounced)

Visible keyboard focus (ring in tide), `prefers-reduced-motion` respected, real empty/loading/error states, works at 390px width.
