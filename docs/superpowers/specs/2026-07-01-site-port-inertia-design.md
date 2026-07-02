# Ledion Autocare — `(site)` Port to Laravel + Inertia (Design)

**Date:** 2026-07-01
**Status:** Approved (design), pending implementation plan

## Overview

Port the customer-facing marketing site from the Next.js app
(`D:\dev\ledion-project`, the `app/(site)/*` route group + `globals.css`) into
this Laravel 13 + Inertia v3 + React 19 application (`ledion-webapp`). The goal
is to **copy the visual identity, then optimize** for Laravel/Inertia idioms —
not a literal transliteration.

Both apps share the same rendering stack (React 19, Tailwind v4, shadcn), so
components port near-verbatim; the work is in the shell, routing, theming,
images, and dark-mode wiring.

## Source Design (what we are copying)

A modern, luxury-feeling car-detailing site with:

- A purple/magenta OKLCH shadcn theme (`--primary: oklch(0.52 0.2 302)`), a
  pure-black dark mode, an extended radius scale (`--radius-sm` → `--radius-4xl`),
  and `font-heading` (Bricolage Grotesque) / `font-mono` (Geist Mono) tokens.
- A sticky header that is transparent at the top and becomes solid + blurred on
  scroll; centered desktop nav; mobile hamburger opening a shadcn `Sheet`.
- A centered, uppercase, full-bleed hero with gradient-text accent.
- Landing sections: Hero, Services (3 cards), Showreel, About (feature list +
  image), CtaBand (image backdrop + legibility gradient).
- Content sub-pages: About, Services index, Service detail (`/services/{slug}`),
  Gallery, Pricing, FAQ, Contact — several driven by a `lib/services.ts` data
  module (`getServiceBySlug`, `CATEGORIES`, `getServicesByCategory`).
- A `/booking` placeholder route so all CTAs resolve.

## Decisions (confirmed)

1. **Target:** fresh optimized rebuild inside `ledion-webapp` (Laravel + Inertia).
2. **Fidelity:** copy the visual identity, then optimize.
3. **Theme scope:** adopt the purple brand + radius scale **globally** in
   `resources/css/app.css` (restyles admin/dashboard/auth too — one brand).
4. **Fonts:** self-host via the project's existing `bunny()` Vite font helper
   (Bricolage Grotesque, Inter, Geist Mono) — no external requests, no layout
   shift, and no new dependency (already used for Instrument Sans).
5. **Scope of full effort:** the entire `(site)`, delivered in **three phases**
   (below). Each phase is its own spec → plan → build cycle. This document
   fully specifies **Phase 1** and records a roadmap for Phases 2–3.

## Optimizations over a literal copy (the "Inertia style")

| Next.js idiom | Inertia/Laravel replacement |
|---|---|
| Per-route `layout.tsx` shell | **Persistent Inertia layout** — header/footer + scroll listener never remount between visits |
| Hand-typed `href: \`/${string}\`` unions | **Wayfinder** route functions (`@/routes`) — hrefs verified against real Laravel routes |
| `next/image` optimizer | Responsive `<img>` with explicit `width`/`height`, `loading`, `sizes`/`srcset` — no CLS, lazy below the fold |
| `next-themes` + `ThemeProvider` | Reuse the starter kit's existing `useAppearance` / `.dark` system — no new dependency |
| `"use client"` directives | Removed — all Inertia React is already client-rendered |
| `usePathname()` for active nav | Inertia `usePage().url` |
| `lib/services.ts` static module | Kept as typed config in Phases 1–2; teed up to move to DB / controller props in Phase 3 |

## Phased Roadmap

- **Phase 1 — Foundation + Landing (this spec):** theme + fonts, `sheet` +
  `badge`, persistent `SiteLayout` (header/footer/nav), shared primitives, the
  landing page, and a `/booking` placeholder. A complete, shippable slice.
- **Phase 2 — Content pages:** About, Services index, Service detail, Gallery,
  Pricing, FAQ, Contact + the `services` data layer. Reuses Phase 1 primitives.
- **Phase 3 — Booking flow:** real booking page + backend model/scheduling.
  Needs its own design (not a static page).

---

# Phase 1 — Foundation + Landing Page

## 1. Theme & Fonts — `resources/css/app.css`

- Replace the grayscale `:root` / `.dark` token blocks with the source design's
  purple/magenta OKLCH values (including `--primary`, `--ring`, chart, and
  sidebar tokens; pure-black `.dark --background`).
- Extend the `@theme` block with the radius scale
  (`--radius-sm` … `--radius-4xl` as `calc()` multiples of `--radius`) and add
  `--font-heading: var(--font-display)` and `--font-mono: var(--font-mono)`.
- Self-host Bricolage Grotesque, Inter, and Geist Mono via the existing
  `bunny()` font helper in `vite.config.ts` (no new dependency), and set
  `--font-display` / `--font-sans` / `--font-mono` to those family names in
  `@theme`. If a family is unavailable on Bunny, keep it out of `bunny()` and
  let the token fall back to its system stack.
- Keep the existing `@layer base` reset and the starter kit's `@source`,
  `tw-animate-css`, dark `@custom-variant` lines.

## 2. shadcn Components

Add `sheet` and `badge` to `resources/js/components/ui/` (via shadcn CLI, or
hand-authored to match sibling components). These are the only two the landing
shell needs that the starter kit lacks.

## 3. Shared Shell — `resources/js/`

Each unit has one purpose and a small, well-defined interface:

- `lib/navigation.ts` — typed `NAV_ITEMS` single source of truth + `isRoute`,
  `isVisible`, `isCta` helpers. Hrefs resolve through **Wayfinder** route
  helpers rather than raw strings. Adding a page = append one entry.
- `layouts/site-layout.tsx` — **persistent** Inertia layout composing
  `SiteHeader` + `{children}` + `SiteFooter`. Attached to pages via
  `Page.layout = (page) => <SiteLayout>{page}</SiteLayout>` so the header's
  scroll state survives client-side visits.
- `components/site/` :
  - `site-header.tsx` — sticky, transparent→solid on scroll (`useState` +
    passive scroll listener). Composes desktop nav, desktop actions, mobile nav,
    theme toggle.
  - `site-footer.tsx` — brand, quick links (from `NAV_ITEMS`), hours.
  - `desktop-nav.tsx` / `desktop-actions.tsx` — inline links + CTA at `md+`.
  - `mobile-nav.tsx` — hamburger → `Sheet` with the same items.
  - `nav-link.tsx` — renders one `NavItem`; `link` vs `cta`; active state via
    `usePage().url`; Inertia `<Link>` for routes.
  - `theme-toggle.tsx` — Sun/Moon button calling `updateAppearance` from the
    existing `useAppearance` hook.

## 4. Landing Primitives + Sections — `components/site/landing/`

- Primitives:
  - `section.tsx` — consistent vertical rhythm, max-width, horizontal padding,
    `scroll-mt` for anchors.
  - `image-slot.tsx` — renders a responsive `<img>` when `src` is given
    (explicit dimensions, `loading`, `sizes`), else a labelled placeholder box.
  - `eyebrow.tsx` — uppercase mono label with accent dot.
  - `page-header.tsx` — reused by Phase 2 content pages (built now, shared).
- Sections (ported near-verbatim, `next/link`→Inertia `<Link>`,
  `next/image`→`image-slot`, drop `"use client"`):
  `hero.tsx`, `services.tsx`, `showreel.tsx`, `about.tsx`, `cta-band.tsx`.

## 5. Routing — Laravel

- `routes/web.php`:
  - `GET /` → `Inertia::render('site/home')` (named `home`).
  - `GET /booking` → `Inertia::render('site/booking')` (named `booking`).
- Run Wayfinder generation so `@/routes` exposes typed `home()` / `booking()`.
- `resources/js/pages/site/home.tsx` composes the landing sections and attaches
  `SiteLayout` as its persistent layout; `resources/js/pages/site/booking.tsx`
  is a minimal "coming soon" placeholder using the same layout.
- The existing starter-kit `/` (welcome) is replaced by the marketing home; the
  authenticated app remains under its current routes.

## 6. Assets

Copy `hero-image.png`, `about-image.png`, `cta-image.png` from the source
project's `public/assets/` into this project's `public/assets/`.

## 7. Accessibility & Quality Bar

- Semantic landmarks (`header`/`main`/`nav`/`footer`/`section` +
  `aria-labelledby`); keyboard-accessible sheet with focus trap + Esc close
  (shadcn `Sheet` provides this).
- Sufficient contrast in light and dark; respect `prefers-reduced-motion` for
  hover/scale transitions.
- Theme-token colors only — no hardcoded hex/rgb.

## 8. Verification

- `larakube npm run build` succeeds (Vite manifest includes `/` and `/booking`).
- `larakube php artisan test --compact` — a Pest feature test asserting `/` and
  `/booking` return 200 and render the expected Inertia components.
- Typecheck + ESLint pass; Pint clean on any PHP touched.

## Out of Scope (Phase 1)

All content sub-pages, the `services` data layer, and real booking logic
(Phases 2–3). No CMS, no forms/persistence, no real scheduling.

## Success Criteria

- `/` renders the full landing page (Hero, Services, Showreel, About, CtaBand)
  in light and dark mode, mobile-first.
- Header is transparent at top, solid+blurred on scroll; mobile sheet works;
  theme toggle flips light/dark via the existing appearance system.
- All CTAs route to `/booking`; nav is driven by a single typed config with
  Wayfinder-verified hrefs.
- Build, typecheck, lint, and the Pest smoke test all pass.
