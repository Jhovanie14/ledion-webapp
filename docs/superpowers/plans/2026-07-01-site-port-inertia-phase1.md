# Ledion `(site)` Port — Phase 1 (Foundation + Landing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Next.js marketing landing page + shared site shell into this Laravel + Inertia app, copying the visual identity while adopting Inertia/Laravel idioms (persistent layout, Wayfinder routes, responsive `<img>`, existing appearance system).

**Architecture:** A single `SiteLayout` (registered in the central `app.tsx` layout switch for all `site/*` pages) composes a scroll-aware `SiteHeader` and `SiteFooter`. The landing page (`resources/js/pages/site/home.tsx`) is assembled from focused presentational sections in `resources/js/components/site/landing/`. Navigation is a single typed config; hrefs resolve through Wayfinder named routes. A `/booking` placeholder page keeps every CTA resolvable.

**Tech Stack:** Laravel 13, Inertia v3, React 19 (react-compiler), Tailwind v4, shadcn (new-york), lucide-react, Wayfinder, Pest v4, `bunny()` self-hosted fonts, `larakube` command wrapper.

## Global Constraints

- Use theme tokens only (`bg-background`, `text-foreground`, `text-primary`, `bg-card`, `border-border`, `text-muted-foreground`, `font-heading`, `font-mono`, etc.) — **no hardcoded hex/rgb colors**. Theme lives in `resources/css/app.css`.
- Mobile-first: base styles target mobile; layer desktop with `md:`/`lg:` prefixes.
- TypeScript strict: **no `any`, no type assertions** in navigation logic.
- All React runs client-side under Inertia — **do not** add `"use client"` directives.
- Use Inertia `Link` from `@inertiajs/react` for internal navigation (never `next/link`). Use the existing `Button`/`Card`/`Sheet` from `@/components/ui/*`. Icons from `lucide-react`.
- Route hrefs come from Wayfinder named routes in `@/routes` — no hardcoded URL strings in nav config.
- Run all Artisan commands through `larakube` with `--no-interaction`; run npm through `larakube npm`.
- Verification per task: `larakube npm run build` and (where noted) `larakube php artisan test --compact` must pass. Run `larakube php vendor/bin/pint --dirty --format agent` after any PHP change.
- Copy is placeholder marketing text, grouped per-section for easy editing.

---

### Task 1: Theme tokens + self-hosted fonts

**Files:**
- Modify: `resources/css/app.css`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: Tailwind theme utilities `font-heading`, `font-mono`, radius scale `rounded-3xl`/`rounded-4xl`, and the purple brand tokens (`text-primary`, `bg-primary`, etc.) consumed by every later task.

- [ ] **Step 1: Replace the `@theme` font + radius section and add brand tokens**

In `resources/css/app.css`, replace the `--font-sans` declaration and radius lines inside `@theme { ... }` with the following (keep all existing `--color-*` mappings below it unchanged):

```css
@theme {
    --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --font-heading: 'Bricolage Grotesque', var(--font-sans);
    --font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) * 1.4);
    --radius-2xl: calc(var(--radius) * 1.8);
    --radius-3xl: calc(var(--radius) * 2.2);
    --radius-4xl: calc(var(--radius) * 2.6);
```

Leave the rest of the `@theme` block (all `--color-*: var(--...)` lines) exactly as-is.

- [ ] **Step 2: Replace the light `:root` token values**

Replace the `:root { ... }` block's values with the source brand palette (purple primary):

```css
:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.52 0.2 302);
    --primary-foreground: oklch(0.98 0.01 308);
    --secondary: oklch(0.967 0.001 286.375);
    --secondary-foreground: oklch(0.21 0.006 285.885);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.97 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --destructive-foreground: oklch(0.985 0 0);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.6 0.16 302);
    --chart-1: oklch(0.811 0.111 293.571);
    --chart-2: oklch(0.606 0.25 292.717);
    --chart-3: oklch(0.541 0.281 293.009);
    --chart-4: oklch(0.491 0.27 292.581);
    --chart-5: oklch(0.432 0.232 292.759);
    --radius: 0.625rem;
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.591 0.293 322.896);
    --sidebar-primary-foreground: oklch(0.977 0.017 320.058);
    --sidebar-accent: oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.708 0 0);
}
```

- [ ] **Step 3: Replace the `.dark` token values**

```css
.dark {
    --background: oklch(0 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.165 0 0);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.165 0 0);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.58 0.21 302);
    --primary-foreground: oklch(0.985 0.01 308);
    --secondary: oklch(0.23 0.006 286.033);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.2 0 0);
    --muted-foreground: oklch(0.72 0 0);
    --accent: oklch(0.23 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --destructive-foreground: oklch(0.985 0 0);
    --border: oklch(1 0 0 / 8%);
    --input: oklch(1 0 0 / 12%);
    --ring: oklch(0.58 0.18 302);
    --chart-1: oklch(0.811 0.111 293.571);
    --chart-2: oklch(0.606 0.25 292.717);
    --chart-3: oklch(0.541 0.281 293.009);
    --chart-4: oklch(0.491 0.27 292.581);
    --chart-5: oklch(0.432 0.232 292.759);
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.667 0.295 322.15);
    --sidebar-primary-foreground: oklch(0.977 0.017 320.058);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.556 0 0);
}
```

- [ ] **Step 4: Self-host the three fonts via `bunny()`**

In `vite.config.ts`, replace the single `fonts: [ ... ]` array inside the `laravel({ ... })` plugin with:

```ts
            fonts: [
                bunny('Inter', { weights: [400, 500, 600] }),
                bunny('Bricolage Grotesque', { weights: [400, 500, 600, 700] }),
                bunny('Geist Mono', { weights: [400, 500] }),
            ],
```

- [ ] **Step 5: Verify the build (fonts resolve, CSS compiles)**

Run: `larakube npm run build`
Expected: PASS. If the build errors resolving `Geist Mono` on Bunny, remove the `bunny('Geist Mono', ...)` line only — the `--font-mono` token already falls back to `ui-monospace` — and re-run the build to PASS.

- [ ] **Step 6: Commit**

```bash
git add resources/css/app.css vite.config.ts
git commit -m "feat: adopt purple brand theme and self-hosted site fonts"
```

---

### Task 2: Add `sheet` and `badge` shadcn components

**Files:**
- Create: `resources/js/components/ui/sheet.tsx`
- Create: `resources/js/components/ui/badge.tsx`

**Interfaces:**
- Produces: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle` (used by Task 5 mobile nav); `Badge` (available for later phases).

- [ ] **Step 1: Generate the components**

Run: `larakube npx shadcn@latest add sheet badge --yes`
Expected: creates `resources/js/components/ui/sheet.tsx` and `resources/js/components/ui/badge.tsx` in new-york style.

If the CLI is unavailable/interactive in this environment, hand-author both files by copying the current shadcn new-york `sheet` and `badge` sources (they depend only on `@radix-ui`/`class-variance-authority`/`@/lib/utils`, all already present).

- [ ] **Step 2: Verify they compile**

Run: `larakube npm run build`
Expected: PASS. Confirm both files exist and export `Sheet`/`SheetContent`/`SheetHeader`/`SheetTitle`/`SheetTrigger` and `Badge`.

- [ ] **Step 3: Commit**

```bash
git add resources/js/components/ui/sheet.tsx resources/js/components/ui/badge.tsx
git commit -m "chore: add sheet and badge shadcn components"
```

---

### Task 3: Typed navigation config

**Files:**
- Create: `resources/js/lib/navigation.ts`

**Interfaces:**
- Consumes: Wayfinder named routes `home`, `booking` from `@/routes` (created in Task 7; this task compiles against the existing `@/routes` barrel and the two are added there once routes exist — see Task 7 note).
- Produces:
  - `type NavItem = { label: string; href: string; variant?: "link" | "cta"; visibility?: "all" | "desktop" | "mobile" }`
  - `const NAV_ITEMS: readonly NavItem[]`
  - `function isVisible(item: NavItem, surface: "desktop" | "mobile"): boolean`
  - `function isCta(item: NavItem): boolean`

- [ ] **Step 1: Create the config + helpers**

```ts
// resources/js/lib/navigation.ts
import { booking } from '@/routes';

export type NavItem = {
    /** Visible text for the link. */
    label: string;
    /** Resolved URL string (from a Wayfinder route helper). */
    href: string;
    /** "cta" renders as a primary button; defaults to "link". */
    variant?: 'link' | 'cta';
    /** Which surfaces show this item; defaults to "all". */
    visibility?: 'all' | 'desktop' | 'mobile';
};

/**
 * Single source of truth for site navigation. Add a page by appending one
 * entry — desktop and mobile navs both update. Hrefs come from Wayfinder
 * named routes so a renamed/removed route is a compile error.
 *
 * NOTE: In Phase 1 only Book Now targets a real page. Content links
 * (Services, Pricing, ...) are added in Phase 2 when those routes exist.
 */
export const NAV_ITEMS: readonly NavItem[] = [
    { label: 'Book Now', href: booking().url, variant: 'cta' },
];

/** Whether an item should render on the given surface. */
export function isVisible(item: NavItem, surface: 'desktop' | 'mobile'): boolean {
    const visibility = item.visibility ?? 'all';
    return visibility === 'all' || visibility === surface;
}

/** True for call-to-action items (rendered as a button, kept out of the link row). */
export function isCta(item: NavItem): boolean {
    return item.variant === 'cta';
}
```

- [ ] **Step 2: Verify (deferred)**

This file imports `booking` from `@/routes`, generated in Task 7. It will not typecheck until Task 7 runs Wayfinder. Do **not** run the build here; it is verified at the end of Task 7. Proceed to Task 4.

- [ ] **Step 3: Commit**

```bash
git add resources/js/lib/navigation.ts
git commit -m "feat: add typed site navigation config"
```

---

### Task 4: Landing primitives (Section, ImageSlot, Eyebrow, PageHeader)

**Files:**
- Create: `resources/js/components/site/landing/section.tsx`
- Create: `resources/js/components/site/landing/image-slot.tsx`
- Create: `resources/js/components/site/landing/eyebrow.tsx`
- Create: `resources/js/components/site/landing/page-header.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; `ImageIcon` from `lucide-react`.
- Produces:
  - `function Section(props: { id?: string; className?: string; children: React.ReactNode } & Pick<React.HTMLAttributes<HTMLElement>, "aria-labelledby">)`
  - `function ImageSlot(props: { label?: string; className?: string; src?: string; alt?: string; priority?: boolean; sizes?: string; imageClassName?: string; width?: number; height?: number })`
  - `function Eyebrow(props: { children: React.ReactNode; className?: string })`
  - `function PageHeader(props: { title: string; description?: string })`

- [ ] **Step 1: Section wrapper**

```tsx
// resources/js/components/site/landing/section.tsx
import { cn } from '@/lib/utils';

type SectionProps = {
    id?: string;
    className?: string;
    children: React.ReactNode;
} & Pick<React.HTMLAttributes<HTMLElement>, 'aria-labelledby'>;

export function Section({ id, className, children, ...rest }: SectionProps) {
    return (
        <section id={id} className={cn('scroll-mt-16 py-20 lg:py-28', className)} {...rest}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </section>
    );
}
```

- [ ] **Step 2: ImageSlot (responsive `<img>`, no `next/image`)**

```tsx
// resources/js/components/site/landing/image-slot.tsx
import { ImageIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type ImageSlotProps = {
    label?: string;
    className?: string;
    /** When provided, a real image is rendered instead of the placeholder. */
    src?: string;
    /** Accessible description; falls back to `label`. */
    alt?: string;
    /** Above-the-fold images load eagerly; others lazy-load. */
    priority?: boolean;
    /** Responsive sizes hint. */
    sizes?: string;
    /** Override object-fit, e.g. "object-contain". Defaults to cover. */
    imageClassName?: string;
    /** Intrinsic dimensions to reserve space and avoid layout shift. */
    width?: number;
    height?: number;
};

export function ImageSlot({
    label = 'Image',
    className,
    src,
    alt,
    priority,
    sizes = '100vw',
    imageClassName,
    width,
    height,
}: ImageSlotProps) {
    if (src) {
        return (
            <div className={cn('relative overflow-hidden rounded-2xl bg-muted', className)}>
                <img
                    src={src}
                    alt={alt ?? label}
                    width={width}
                    height={height}
                    sizes={sizes}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={priority ? 'high' : 'auto'}
                    className={cn('size-full object-cover', imageClassName)}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground',
                className,
            )}
            role="img"
            aria-label={`${label} placeholder`}
        >
            <span className="flex items-center gap-2 text-sm">
                <ImageIcon className="size-4" />
                {label}
            </span>
        </div>
    );
}
```

- [ ] **Step 3: Eyebrow**

```tsx
// resources/js/components/site/landing/eyebrow.tsx
import { cn } from '@/lib/utils';

/** Uppercase mono label with an accent dot — a structural signpost. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase',
                className,
            )}
        >
            <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
            {children}
        </span>
    );
}
```

- [ ] **Step 4: PageHeader (shared with Phase 2)**

```tsx
// resources/js/components/site/landing/page-header.tsx
type PageHeaderProps = {
    title: string;
    description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <section className="relative overflow-hidden border-b border-border">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
                <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
                )}
            </div>
        </section>
    );
}
```

- [ ] **Step 5: Verify**

Run: `larakube npm run build`
Expected: PASS (these files have no unresolved imports).

- [ ] **Step 6: Commit**

```bash
git add resources/js/components/site/landing/section.tsx resources/js/components/site/landing/image-slot.tsx resources/js/components/site/landing/eyebrow.tsx resources/js/components/site/landing/page-header.tsx
git commit -m "feat: add site landing primitives"
```

---

### Task 5: Site shell (theme toggle, nav, header, footer, layout) + layout registration

**Files:**
- Create: `resources/js/components/site/theme-toggle.tsx`
- Create: `resources/js/components/site/nav-link.tsx`
- Create: `resources/js/components/site/desktop-nav.tsx`
- Create: `resources/js/components/site/desktop-actions.tsx`
- Create: `resources/js/components/site/mobile-nav.tsx`
- Create: `resources/js/components/site/site-header.tsx`
- Create: `resources/js/components/site/site-footer.tsx`
- Create: `resources/js/layouts/site-layout.tsx`
- Modify: `resources/js/app.tsx`

**Interfaces:**
- Consumes: `NAV_ITEMS`, `isVisible`, `isCta`, `NavItem` (Task 3); `Section`-siblings not needed here; `Button` from `@/components/ui/button`; `Sheet*` from `@/components/ui/sheet` (Task 2); `useAppearance` from `@/hooks/use-appearance`; `Link`, `usePage` from `@inertiajs/react`; `home` from `@/routes` (Task 7).
- Produces: `function ThemeToggle()`, `function NavLink({ item, onNavigate?, className? })`, `function DesktopNav()`, `function DesktopActions()`, `function MobileNav()`, `function SiteHeader()`, `function SiteFooter()`, `default function SiteLayout({ children })`.

- [ ] **Step 1: ThemeToggle (reuses existing appearance system)**

```tsx
// resources/js/components/site/theme-toggle.tsx
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
        >
            <Sun className="hidden dark:block" />
            <Moon className="block dark:hidden" />
        </Button>
    );
}
```

- [ ] **Step 2: NavLink (active state via `usePage().url`)**

```tsx
// resources/js/components/site/nav-link.tsx
import { Link, usePage } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/navigation';

export type NavLinkProps = {
    item: NavItem;
    /** Called after a click — used to close the mobile sheet. */
    onNavigate?: () => void;
    className?: string;
};

export function NavLink({ item, onNavigate, className }: NavLinkProps) {
    const { href, label, variant = 'link' } = item;
    const { url } = usePage();

    if (variant === 'cta') {
        return (
            <Button asChild size="lg" className={className} onClick={onNavigate}>
                <Link href={href}>{label}</Link>
            </Button>
        );
    }

    // Active on the linked route or a nested page under it (e.g. /services/detailing).
    const isActive = url === href || url.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                isActive && 'text-foreground',
                className,
            )}
        >
            {label}
        </Link>
    );
}
```

- [ ] **Step 3: DesktopNav + DesktopActions**

```tsx
// resources/js/components/site/desktop-nav.tsx
import { NavLink } from '@/components/site/nav-link';
import { NAV_ITEMS, isCta, isVisible } from '@/lib/navigation';

export function DesktopNav() {
    return (
        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex" aria-label="Primary">
            {NAV_ITEMS.filter((item) => !isCta(item) && isVisible(item, 'desktop')).map((item) => (
                <NavLink key={item.href} item={item} />
            ))}
        </nav>
    );
}
```

```tsx
// resources/js/components/site/desktop-actions.tsx
import { NavLink } from '@/components/site/nav-link';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { NAV_ITEMS, isCta, isVisible } from '@/lib/navigation';

export function DesktopActions() {
    return (
        <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {NAV_ITEMS.filter((item) => isCta(item) && isVisible(item, 'desktop')).map((item) => (
                <NavLink key={item.href} item={item} />
            ))}
        </div>
    );
}
```

- [ ] **Step 4: MobileNav (Sheet)**

```tsx
// resources/js/components/site/mobile-nav.tsx
import { useState } from 'react';
import { Menu } from 'lucide-react';

import { NavLink } from '@/components/site/nav-link';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NAV_ITEMS, isCta, isVisible } from '@/lib/navigation';

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open menu">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                    <SheetHeader>
                        <SheetTitle className="text-left">Ledion Autocare</SheetTitle>
                    </SheetHeader>
                    <nav className="mt-6 flex flex-col gap-1 px-4" aria-label="Mobile primary">
                        {NAV_ITEMS.filter((item) => isVisible(item, 'mobile')).map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                onNavigate={close}
                                className={isCta(item) ? 'mt-2 w-full' : 'py-2 text-base'}
                            />
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
```

- [ ] **Step 5: SiteHeader (sticky, transparent → solid on scroll)**

```tsx
// resources/js/components/site/site-header.tsx
import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

import { DesktopActions } from '@/components/site/desktop-actions';
import { DesktopNav } from '@/components/site/desktop-nav';
import { MobileNav } from '@/components/site/mobile-nav';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export function SiteHeader() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full transition-colors duration-300',
                scrolled
                    ? 'border-b border-border bg-background/80 backdrop-blur-md'
                    : 'border-b border-transparent bg-transparent',
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 items-center">
                    <Link href={home().url} className="text-lg font-semibold tracking-tight">
                        Ledion<span className="text-primary"> Autocare</span>
                    </Link>
                </div>
                <DesktopNav />
                <div className="flex flex-1 items-center justify-end gap-2">
                    <DesktopActions />
                    <MobileNav />
                </div>
            </div>
        </header>
    );
}
```

- [ ] **Step 6: SiteFooter**

```tsx
// resources/js/components/site/site-footer.tsx
import { Link } from '@inertiajs/react';

import { NAV_ITEMS } from '@/lib/navigation';

export function SiteFooter() {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
                <div>
                    <p className="text-lg font-semibold tracking-tight">
                        Ledion<span className="text-primary"> Autocare</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Premium auto detailing, surface protection, and maintenance.
                    </p>
                </div>
                <div>
                    <h3 className="text-sm font-medium">Quick links</h3>
                    <ul className="mt-3 flex flex-col gap-2">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-sm font-medium">Hours</h3>
                    <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                        <li>Mon–Fri: 8am – 6pm</li>
                        <li>Saturday: 9am – 4pm</li>
                        <li>Sunday: Closed</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-border">
                <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
                    © {new Date().getFullYear()} Ledion Autocare. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
```

- [ ] **Step 7: SiteLayout (persistent)**

```tsx
// resources/js/layouts/site-layout.tsx
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SiteHeader />
            {children}
            <SiteFooter />
        </>
    );
}
```

- [ ] **Step 8: Register the layout for `site/*` pages**

In `resources/js/app.tsx`, add the import and a switch case. Add near the other layout imports:

```tsx
import SiteLayout from '@/layouts/site-layout';
```

Then in the `layout: (name) => { switch (true) { ... } }`, add this case **above** `case name === 'welcome':`:

```tsx
            case name.startsWith('site/'):
                return SiteLayout;
```

- [ ] **Step 9: Verify (deferred to Task 7)**

These files import `home`/`booking` via `@/routes` (through `SiteHeader` and `navigation.ts`), generated in Task 7. Do not build yet. Proceed to Task 6.

- [ ] **Step 10: Commit**

```bash
git add resources/js/components/site/ resources/js/layouts/site-layout.tsx resources/js/app.tsx
git commit -m "feat: add persistent site shell (header, footer, nav, layout)"
```

---

### Task 6: Landing sections (Hero, Services, Showreel, About, CtaBand)

**Files:**
- Create: `resources/js/components/site/landing/hero.tsx`
- Create: `resources/js/components/site/landing/services.tsx`
- Create: `resources/js/components/site/landing/showreel.tsx`
- Create: `resources/js/components/site/landing/about.tsx`
- Create: `resources/js/components/site/landing/cta-band.tsx`

**Interfaces:**
- Consumes: `Section`, `ImageSlot` (Task 4); `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter` from `@/components/ui/card`; `Link` from `@inertiajs/react`; `booking`, `services` route helpers — **but `services` route does not exist in Phase 1**, so "Learn more" and "Book now" links point at `booking().url`; icons `ArrowUpRight`, `Play`, `Crosshair`, `Gem`, `ShieldCheck` from `lucide-react`.
- Produces: `function Hero()`, `function Services()`, `function Showreel()`, `function About()`, `function CtaBand()`.

- [ ] **Step 1: Hero**

```tsx
// resources/js/components/site/landing/hero.tsx
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { booking } from '@/routes';

export function Hero() {
    return (
        <section className="relative overflow-hidden" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl px-4 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
                <h1
                    id="hero-heading"
                    className="font-heading text-4xl leading-[0.95] font-semibold tracking-tight text-balance uppercase sm:text-5xl lg:text-7xl"
                >
                    Drive with{' '}
                    <span className="bg-gradient-to-r from-muted-foreground to-primary bg-clip-text text-transparent">
                        perfection
                    </span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-lg text-balance text-muted-foreground">
                    Experience the prestige of a professionally detailed car radiating elegance and
                    refinement at every turn.
                </p>
                <div className="mt-8 flex justify-center">
                    <Link
                        href={booking().url}
                        className="group inline-flex items-center gap-2 text-base font-medium text-foreground transition-opacity hover:opacity-75"
                    >
                        Book now
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            </div>

            {/* full-bleed car image — its dark background blends into the page */}
            <div className="relative w-full pb-12">
                <ImageSlot
                    src="/assets/hero-image.png"
                    alt="Silver luxury car detailed to a showroom shine, reflected on a wet floor"
                    priority
                    sizes="100vw"
                    className="aspect-[16/9] w-full rounded-none border-0 bg-background"
                />
            </div>
        </section>
    );
}
```

- [ ] **Step 2: Services**

```tsx
// resources/js/components/site/landing/services.tsx
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { Section } from '@/components/site/landing/section';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { booking } from '@/routes';

const SERVICES = [
    { title: 'Entry level detail', description: 'Treat your car to a thorough hand wash and premium wax application.' },
    { title: 'Maintenance detail', description: 'Keep your finish protected with a periodic exterior protection treatment.' },
    { title: 'Full detail', description: 'A complete inside-and-out treatment, leaving no detail overlooked.' },
];

export function Services() {
    return (
        <Section id="services" aria-labelledby="services-heading">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                Luxury car detailing
            </p>
            <hr className="mt-4 border-border" />
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <h2
                    id="services-heading"
                    className="max-w-xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                >
                    Love in every detail
                </h2>
                <p className="max-w-sm text-muted-foreground">
                    Immerse yourself in luxury with our bespoke detailing packages, tailored to your
                    car&rsquo;s unique needs.
                </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
                {SERVICES.map(({ title, description }) => (
                    <Card key={title} className="group overflow-hidden transition-colors hover:ring-foreground/20">
                        <ImageSlot
                            label={title}
                            className="aspect-[4/3] w-full rounded-none border-0 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                        <CardHeader>
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription className="text-base">{description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link
                                href={booking().url}
                                className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
                            >
                                Learn more
                                <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </Section>
    );
}
```

- [ ] **Step 3: Showreel**

```tsx
// resources/js/components/site/landing/showreel.tsx
import { Play } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';

export function Showreel() {
    return (
        <section aria-labelledby="showreel-heading" className="px-4 py-12 sm:px-6 lg:px-8">
            <h2 id="showreel-heading" className="sr-only">
                Watch our showreel
            </h2>
            <div className="relative mx-auto aspect-[16/9] max-w-7xl overflow-hidden rounded-3xl border border-border sm:aspect-[21/9]">
                <ImageSlot
                    label="Detailing showreel"
                    className="absolute inset-0 size-full rounded-none border-0 bg-gradient-to-br from-muted to-card"
                />
                <div className="absolute inset-0 bg-background/30" aria-hidden="true" />
                <button
                    type="button"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                    <span className="flex size-16 items-center justify-center rounded-full border border-foreground/60 backdrop-blur-sm sm:size-20">
                        <Play className="size-6 translate-x-0.5 fill-current sm:size-7" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium">Play showreel</span>
                </button>
            </div>
        </section>
    );
}
```

- [ ] **Step 4: About**

```tsx
// resources/js/components/site/landing/about.tsx
import { Link } from '@inertiajs/react';
import { ArrowUpRight, Crosshair, Gem, ShieldCheck } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { Section } from '@/components/site/landing/section';
import { booking } from '@/routes';

const FEATURES = [
    { icon: Crosshair, title: 'Precise work', description: 'We uphold the highest standards of professionalism when servicing your vehicle.' },
    { icon: Gem, title: 'Premium products and services', description: "Ensure your car's longevity with a periodic exterior protection treatment." },
    { icon: ShieldCheck, title: 'High-level security and privacy', description: 'We understand the importance of privacy and security for our clientele.' },
];

export function About() {
    return (
        <Section id="about" aria-labelledby="about-heading">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
                <div className="flex flex-col gap-8 lg:pr-16">
                    <h2
                        id="about-heading"
                        className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                    >
                        We will take good care of your car
                    </h2>
                    <ImageSlot
                        src="/assets/about-image.png"
                        alt="Detailed luxury car"
                        sizes="(min-width: 1024px) 40rem, 100vw"
                        className="aspect-[4/3] w-full rounded-3xl"
                    />
                </div>

                <div className="flex flex-col justify-between lg:border-l lg:border-border lg:pl-16">
                    <ul className="flex flex-col">
                        {FEATURES.map(({ icon: Icon, title, description }) => (
                            <li key={title} className="flex gap-4 border-b border-border py-6 first:pt-0">
                                <Icon className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden="true" />
                                <div>
                                    <h3 className="font-medium">{title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href={booking().url}
                        className="group mt-8 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
                    >
                        Book now
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </Section>
    );
}
```

- [ ] **Step 5: CtaBand**

```tsx
// resources/js/components/site/landing/cta-band.tsx
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { booking } from '@/routes';

export function CtaBand() {
    return (
        <section aria-labelledby="cta-heading" className="px-4 py-20 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border">
                <ImageSlot
                    src="/assets/cta-image.png"
                    alt="Detailed black luxury car reflected on a wet floor"
                    sizes="(min-width: 1280px) 80rem, 100vw"
                    className="absolute inset-0 size-full rounded-none border-0 bg-background"
                />
                <div
                    className="absolute inset-0 bg-gradient-to-l from-background via-background/80 to-transparent"
                    aria-hidden="true"
                />

                <div className="relative ml-auto flex max-w-xl flex-col items-start gap-6 p-10 sm:p-14 lg:p-20">
                    <h2
                        id="cta-heading"
                        className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                    >
                        Book your luxury car detailing today
                    </h2>
                    <p className="text-muted-foreground">
                        Pick your services, choose a time, and you&rsquo;re set — in-shop or at your door.
                    </p>
                    <Link
                        href={booking().url}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
                    >
                        Book now
                        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 6: Verify (deferred to Task 7)**

These import `booking` from `@/routes` (Task 7). Do not build yet. Proceed to Task 7.

- [ ] **Step 7: Commit**

```bash
git add resources/js/components/site/landing/hero.tsx resources/js/components/site/landing/services.tsx resources/js/components/site/landing/showreel.tsx resources/js/components/site/landing/about.tsx resources/js/components/site/landing/cta-band.tsx
git commit -m "feat: add landing page sections"
```

---

### Task 7: Routes + Wayfinder generation + feature test (TDD)

**Files:**
- Modify: `routes/web.php`
- Test: `tests/Feature/SitePagesTest.php`

**Interfaces:**
- Consumes: nothing from JS (server-side).
- Produces: named routes `home` (`GET /`) and `booking` (`GET /booking`); Wayfinder helpers `home`, `booking` in `@/routes` that all prior JS tasks import.

- [ ] **Step 1: Write the failing feature test**

```php
<?php

use function Pest\Laravel\get;

test('the marketing home page renders', function () {
    get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('site/home'));
});

test('the booking placeholder page renders', function () {
    get('/booking')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('site/booking'));
});
```

Save as `tests/Feature/SitePagesTest.php`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `larakube php artisan test --compact --filter=SitePagesTest`
Expected: FAIL — `/` currently renders `welcome` (or the routes/components differ).

- [ ] **Step 3: Replace the `/` route and add `/booking` in `routes/web.php`**

Find the existing home route (renders `welcome`) and replace it; add the booking route beside it:

```php
Route::get('/', function () {
    return Inertia::render('site/home');
})->name('home');

Route::get('/booking', function () {
    return Inertia::render('site/booking');
})->name('booking');
```

Ensure `use Inertia\Inertia;` is present at the top of `routes/web.php` (add it if missing).

- [ ] **Step 4: Generate Wayfinder route helpers**

Run: `larakube php artisan wayfinder:generate`
Expected: regenerates `resources/js/routes/index.ts` so `import { home, booking } from '@/routes'` resolves.

- [ ] **Step 5: Run the feature test to verify it passes**

Run: `larakube php artisan test --compact --filter=SitePagesTest`
Expected: PASS (server returns the correct Inertia component name even before the page files render client-side).

- [ ] **Step 6: Pint**

Run: `larakube php vendor/bin/pint --dirty --format agent`
Expected: no style issues remain.

- [ ] **Step 7: Commit**

```bash
git add routes/web.php resources/js/routes/index.ts tests/Feature/SitePagesTest.php
git commit -m "feat: add site home and booking routes with feature test"
```

---

### Task 8: Assemble pages + assets + full verification

**Files:**
- Create: `resources/js/pages/site/home.tsx`
- Create: `resources/js/pages/site/booking.tsx`
- Create: `public/assets/hero-image.png`, `public/assets/about-image.png`, `public/assets/cta-image.png` (copied)

**Interfaces:**
- Consumes: all section components (Task 6); `Head`, `Link` from `@inertiajs/react`; `Button` from `@/components/ui/button`; `home` from `@/routes`. Layout is applied automatically via the `site/*` case registered in Task 5.
- Produces: the two rendered Inertia pages that satisfy Task 7's feature test at the client level and the build.

- [ ] **Step 1: Copy the image assets**

Run:

```bash
mkdir -p public/assets
cp /d/dev/ledion-project/public/assets/hero-image.png public/assets/hero-image.png
cp /d/dev/ledion-project/public/assets/about-image.png public/assets/about-image.png
cp /d/dev/ledion-project/public/assets/cta-image.png public/assets/cta-image.png
```

Expected: three files present under `public/assets/`.

- [ ] **Step 2: Landing page**

```tsx
// resources/js/pages/site/home.tsx
import { Head } from '@inertiajs/react';

import { About } from '@/components/site/landing/about';
import { CtaBand } from '@/components/site/landing/cta-band';
import { Hero } from '@/components/site/landing/hero';
import { Services } from '@/components/site/landing/services';
import { Showreel } from '@/components/site/landing/showreel';

export default function Home() {
    return (
        <>
            <Head title="Premium Auto Detailing & Protection">
                <meta
                    name="description"
                    content="Book premium auto detailing, surface protection, and maintenance — in-shop or home service with Ledion Autocare."
                />
            </Head>
            <main>
                <Hero />
                <Services />
                <Showreel />
                <About />
                <CtaBand />
            </main>
        </>
    );
}
```

- [ ] **Step 3: Booking placeholder page**

```tsx
// resources/js/pages/site/booking.tsx
import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { home } from '@/routes';

export default function Booking() {
    return (
        <>
            <Head title="Booking" />
            <main className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Booking</h1>
                <p className="text-muted-foreground">
                    Online booking with calendar scheduling is coming soon. Choose in-shop or home service and
                    pick your time — right here.
                </p>
                <Button asChild variant="outline">
                    <Link href={home().url}>Back to home</Link>
                </Button>
            </main>
        </>
    );
}
```

- [ ] **Step 4: Full build + typecheck + lint**

Run: `larakube npm run build`
Expected: PASS — all `@/routes` imports resolve, no unused/missing symbols.

Run (if the project defines them; skip a missing script): `larakube npm run lint`
Expected: PASS.

- [ ] **Step 5: Run the full feature test suite for these pages**

Run: `larakube php artisan test --compact --filter=SitePagesTest`
Expected: PASS (both pages 200 + correct component).

- [ ] **Step 6: Manual visual check**

Ask the user to run `larakube composer run dev` (or confirm the dev server) and verify at the site root:
- Mobile (<768px): hamburger opens the Sheet with Book Now + theme toggle.
- Desktop (≥768px): centered nav area, Book Now button + theme toggle on the right.
- Header transparent at top, gains border + blur on scroll.
- Hero, Services, Showreel, About, CtaBand render; images load from `/assets/*`.
- Light and dark mode both look correct (toggle flips the whole app).

- [ ] **Step 7: Commit**

```bash
git add resources/js/pages/site/home.tsx resources/js/pages/site/booking.tsx public/assets/hero-image.png public/assets/about-image.png public/assets/cta-image.png
git commit -m "feat: assemble landing page and booking placeholder"
```

---

## Self-Review Notes

- **Spec coverage:** Theme+fonts (Task 1) ✓; sheet/badge (Task 2) ✓; typed nav via Wayfinder (Task 3) ✓; primitives Section/ImageSlot/Eyebrow/PageHeader (Task 4) ✓; persistent SiteLayout + header/footer/nav/theme-toggle reusing `useAppearance` (Task 5) ✓; landing sections Hero/Services/Showreel/About/CtaBand (Task 6) ✓; Laravel routes + Wayfinder + Pest test (Task 7) ✓; pages + assets + full verification (Task 8) ✓. Global theme scope ✓ (Task 1 edits shared `:root`/`.dark`). Responsive `<img>` optimization ✓ (Task 4 ImageSlot). No `"use client"` ✓.
- **Build-order caveat (intentional):** Tasks 3, 5, 6 import `@/routes` helpers (`home`, `booking`) that Wayfinder generates in Task 7, so their build verification is explicitly deferred to Task 7/8 rather than run in-task. This keeps each task's code complete while acknowledging the one cross-task dependency. If executing strictly one-commit-at-a-time with a green build gate, run Tasks 3–7 as a group before the first build.
- **Type consistency:** `NavItem`/`isVisible`/`isCta` defined in Task 3, consumed with matching signatures in Task 5. `NavLinkProps` derives from `NavItem`. `ImageSlot` prop shape defined in Task 4, used with `src`/`alt`/`priority`/`sizes`/`className` in Task 6. `home()`/`booking()` return objects with `.url` (Wayfinder), used consistently.
- **Nav scope note:** Phase 1 `NAV_ITEMS` contains only the Book Now CTA (content routes don't exist yet). `DesktopNav` renders an empty link row until Phase 2 appends Services/Pricing/etc. — intentional, not a gap.
- **No placeholders:** every code step contains complete, runnable code.
```