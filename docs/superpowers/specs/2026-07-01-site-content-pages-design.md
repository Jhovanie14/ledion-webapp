# Ledion `(site)` Port — Phase 2 (Content Pages + Services Data Layer) Design

**Date:** 2026-07-01
**Status:** Approved (design), pending implementation plan
**Predecessor:** Phase 1 (foundation + landing) — shipped on `feat/site-port-inertia`.

## Overview

Port the remaining marketing pages from the Next.js `(site)` route group into
this Laravel + Inertia app, reusing the Phase 1 shell and primitives. Same
principle as Phase 1: copy the visual identity, optimize for Inertia/Laravel
idioms. This phase is content-driven and **backend-free** — no persistence, no
email, no real scheduling (those belong to Phase 3, the booking flow).

## Decisions (confirmed)

1. **Sequencing:** Phase 2 (content pages) is built and shipped before Phase 3
   (booking flow). Each is its own spec → plan → build cycle.
2. **Services data layer:** ported as a typed TS config
   (`resources/js/lib/services.ts`), not a database, in this phase. It moves to
   an Eloquent model in Phase 3 when booking must reference real services.
3. **Contact form:** presentational only — acknowledges submission client-side.
   Real submission (email/DB) is deferred.
4. **Service detail slug resolution:** the page resolves the slug client-side
   from the TS config; an unknown slug renders an in-page "service not found"
   with a link back — not an HTTP 404. Real route-model-binding + 404 arrive
   with the DB in Phase 3.

## Scope

**In scope:** seven content pages, the services data layer, two new shadcn
components, two ported shared components, their Laravel routes + Wayfinder
helpers, the expanded nav, and Pest feature tests.

**Out of scope:** the booking flow / `BookingStepper` (Phase 3), any backend
persistence or email, real service images (placeholders only), a database for
services.

## Services Data Layer — `resources/js/lib/services.ts`

Port `lib/services.ts` verbatim (adjusting only the import path for `LucideIcon`
if needed). Contents:

- `type ServiceCategory = "protection" | "detailing" | "wash" | "maintenance"`,
  plus `ServicePackage`, `ServicePricing`, `ProcessStep`, `Service`, `Bundle`.
- `CATEGORIES` — 4 categories with `id`/`label`/`description`.
- `SERVICES` — 12 services, each with `slug`, `title`, `category`, `icon`
  (Lucide component), `tagline`, `description`, `features[]`, `process[]`
  (3 steps), `pricing` (`from`, optional `unit`/`packages`/`note`), `related[]`.
- `BUNDLES` — 3 bundles (one `featured`).
- Helpers: `getServiceBySlug(slug)`, `getServicesByCategory(category)`,
  `serviceSlugs()`.
- Prices are PHP peso placeholders (`₱`), editable in this one file.

This is the single source of truth for the Services, Service detail, and
Pricing pages.

## New shadcn Components

- `accordion` — for the FAQ page.
- `textarea` — for the contact form.

(`input`, `label`, `card`, `button`, and the Phase 1 `PageHeader`, `ImageSlot`,
`Section` already exist and are reused.)

## Ported Shared Components — `resources/js/components/site/`

- `pricing.tsx` — renders the `BUNDLES` as tiered cards (featured tier
  highlighted), each CTA routing to `/booking`.
- `contact-form.tsx` — presentational form (name, email, subject, message)
  using `Input`/`Label`/`Textarea`/`Button`; on submit it swaps to a local
  "thanks" acknowledgement (`useState`), no network call.

## Pages — `resources/js/pages/site/`

All render inside the existing persistent `SiteLayout` (registered via the
`site/*` case in `app.tsx`). Each uses the shared `PageHeader`.

1. `about.tsx` — story (image + copy), 4 value cards, 4-stat strip, Book CTA.
2. `services/index.tsx` — for each `CATEGORY`, a heading + a responsive grid of
   service cards (icon, title, tagline, "From ₱…", link to detail).
3. `services/show.tsx` — detail page for one service: `PageHeader`, overview
   (image + description), features list, 3-step process, pricing packages (or a
   single "from" price), related-services cards, and a Book CTA. Receives the
   `slug` as an Inertia prop; looks it up via `getServiceBySlug`; renders an
   in-page "service not found" fallback for an unknown slug.
4. `pricing.tsx` — `PageHeader`, the `Pricing` bundles component, and a
   per-category price table (`CATEGORIES` × `getServicesByCategory`) linking
   each row to its service detail, plus FAQ/contact links and a Book CTA.
5. `gallery.tsx` — `PageHeader` + category sections, each a grid of square
   `ImageSlot` placeholders.
6. `faq.tsx` — `PageHeader` + a single-collapsible `Accordion` of Q&A + a
   "contact us" CTA.
7. `contact.tsx` — `PageHeader` + contact details (address/phone/email/hours),
   a map `ImageSlot`, and the `ContactForm`.

## Routing (Laravel) — `routes/web.php`

Add named routes, each `Inertia::render`:

- `GET /services` → `site/services/index` (name `services`)
- `GET /services/{slug}` → `site/services/show` with `['slug' => $slug]`
  (name `services.show`)
- `GET /pricing` → `site/pricing` (name `pricing`)
- `GET /gallery` → `site/gallery` (name `gallery`)
- `GET /about` → `site/about` (name `about`)
- `GET /faq` → `site/faq` (name `faq`)
- `GET /contact` → `site/contact` (name `contact`)

Run Wayfinder generation so `@/routes` exposes typed helpers
(`services`, `services.show`, `pricing`, `gallery`, `about`, `faq`, `contact`).

## Navigation

Expand `resources/js/lib/navigation.ts` `NAV_ITEMS` to (order matches the
source): Services, Pricing, Gallery, About, FAQ, Contact (links) + Book Now
(CTA). Hrefs come from the new Wayfinder helpers. `nav-link.tsx`'s existing
`isCurrentOrParentUrl` correctly marks `/services` active on
`/services/{slug}`. No `Home` (`/`) entry is added, so the Phase 1 latent
"`/` matches everything" active-nav note is not triggered.

## Accessibility & Quality Bar

- Reuse Phase 1 semantics: `PageHeader` provides the page `h1`; sections use
  `aria-labelledby`; the `Accordion` is keyboard-accessible (shadcn/Radix).
- Theme tokens only — no hardcoded hex/rgb. Mobile-first. No `"use client"`.
  Inertia `Link` (never `next/link`); responsive `<img>` via `ImageSlot`.
- Contact form inputs are label-associated; the "thanks" state is announced by
  replacing the form region.

## Testing

- A Pest feature test asserting each of the seven routes returns 200 with its
  expected Inertia component name.
- Service detail: assert a known slug (e.g. `ceramic-coating`) returns 200 and
  component `site/services/show`.
- Build (`larakube npm run build`) passes; typecheck + lint clean; Pint clean
  on touched PHP.

## Success Criteria

- All seven pages render in light and dark mode, mobile-first, reusing the
  Phase 1 shell.
- Services and Pricing pages are driven entirely by `resources/js/lib/services.ts`;
  editing that one file updates both.
- Every nav link resolves via Wayfinder; every Book CTA routes to `/booking`.
- Build, typecheck, lint, and the Pest feature tests pass.

## Follow-ups (Phase 3 and beyond)

- Move the services data layer to an Eloquent `Service`/`Bundle` model with a
  seeder; convert `/services/{slug}` to route-model-binding with a real 404.
- Wire the contact form to a real submission (email or DB).
- Build the booking flow: rename `BookingWizard` → `BookingStepper` (progress
  bar → `StepIndicator`), submit via Inertia to a controller that persists a
  `Booking` and issues a real reference.
