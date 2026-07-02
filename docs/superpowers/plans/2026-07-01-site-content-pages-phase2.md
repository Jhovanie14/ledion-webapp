# Ledion `(site)` Port — Phase 2 (Content Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the seven marketing content pages (about, services index, service detail, pricing, gallery, faq, contact) + the services TS data layer into this Laravel + Inertia app, reusing the Phase 1 shell/primitives.

**Architecture:** A single typed `resources/js/lib/services.ts` drives the Services, Service-detail, and Pricing pages. Seven Inertia pages under `resources/js/pages/site/` render inside the existing persistent `SiteLayout`. Two ported shared components (`Pricing`, `ContactForm`) and two new shadcn components (`accordion`, `textarea`). Laravel routes + Wayfinder helpers back the nav; the expanded `NAV_ITEMS` is the single nav source of truth.

**Tech Stack:** Laravel 13, Inertia v3, React 19, Tailwind v4, shadcn (new-york), lucide-react, Wayfinder, Pest v4, `larakube` wrapper.

## Global Constraints

- Use theme tokens only — no hardcoded hex/rgb. Mobile-first. No `"use client"` directives (all Inertia React is client-side).
- Internal navigation: Inertia `Link` from `@inertiajs/react` (never `next/link`); responsive images via the existing `ImageSlot` (never `next/image`). Page `<title>`/description via Inertia `<Head>` (never Next `metadata`).
- **Nav config** hrefs come from Wayfinder named-route helpers in `@/routes`. **Within page bodies**, static cross-page links use Wayfinder helpers (`booking()`, `contact()`, `faq()`); dynamic per-service links use template strings `` `/services/${slug}` `` (the source pattern) — do NOT invent a Wayfinder dynamic-route API.
- Reuse Phase 1 primitives from `@/components/site/landing/`: `PageHeader`, `ImageSlot`, `Section`, `Eyebrow`. Reuse `@/components/ui/{card,button,badge,input,label}`.
- Run all larakube commands through WSL: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube <cmd>'`. The k8s cluster is up. If `larakube npm run build` fails with `EACCES ... public/build/assets`, clear the stale root-owned dir once with `docker run --rm -v "$(pwd)/public/build:/build" alpine rm -rf /build/assets`, then re-run.
- Edit files via the UNC path `//wsl.localhost/Ubuntu/home/primary/projects/ledion-webapp/`. Run git from there (safe.directory already configured). Do NOT commit the pre-existing `artisan` working-tree change, nor anything under `resources/js/routes/` or `resources/js/actions/` (gitignored — Wayfinder regenerates them).
- Run `larakube php vendor/bin/pint --dirty --format agent` after any PHP change.
- Copy is placeholder marketing text; PHP peso prices (`₱`) preserved from source.

---

### Task 1: Services data layer

**Files:**
- Create: `resources/js/lib/services.ts`

**Interfaces:**
- Produces: types `ServiceCategory`, `ServicePackage`, `ServicePricing`, `ProcessStep`, `Service`, `Bundle`; consts `CATEGORIES`, `SERVICES` (12 items), `BUNDLES` (3 items); functions `getServiceBySlug(slug: string): Service | undefined`, `getServicesByCategory(category: ServiceCategory): Service[]`, `serviceSlugs(): string[]`. Consumed by Tasks 5, 7, 8.

- [ ] **Step 1: Copy the data module verbatim from the source project**

The source file is a self-contained TS module whose only import is `lucide-react` (which resolves in this project). Copy it byte-for-byte:

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && cp /mnt/d/dev/ledion-project/lib/services.ts resources/js/lib/services.ts && head -20 resources/js/lib/services.ts'`

Expected: file created; first lines show the `lucide-react` import block and `ServiceCategory` type.

- [ ] **Step 2: Confirm no path edits are needed**

The file imports only `from "lucide-react"` and uses no `@/` alias. Verify there are no other imports:

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && grep -n "^import\|from \"@/" resources/js/lib/services.ts'`
Expected: exactly one import line, `from "lucide-react"`. If any `@/` import appears, stop and report.

- [ ] **Step 3: Verify the build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add resources/js/lib/services.ts
git commit -m "feat: add site services data layer (typed config)"
```

---

### Task 2: Add `accordion` and `textarea` shadcn components

**Files:**
- Create: `resources/js/components/ui/accordion.tsx`
- Create: `resources/js/components/ui/textarea.tsx`

**Interfaces:**
- Produces: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` (Task 8 FAQ); `Textarea` (Task 5 contact form).

- [ ] **Step 1: Generate the components**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npx shadcn@latest add accordion textarea --yes'`
Expected: creates `resources/js/components/ui/accordion.tsx` and `textarea.tsx` (new-york style).

If the CLI is interactive/non-TTY and fails, hand-author both to match sibling components: read `resources/js/components/ui/dialog.tsx` (Radix pattern, for accordion) and `resources/js/components/ui/input.tsx` (for textarea), using `@/lib/utils`'s `cn`. `accordion` must export `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`; `textarea` must export `Textarea`.

- [ ] **Step 2: Verify build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS. Confirm both files exist with the required exports.

- [ ] **Step 3: Commit**

```bash
git add resources/js/components/ui/accordion.tsx resources/js/components/ui/textarea.tsx
git commit -m "chore: add accordion and textarea shadcn components"
```

---

### Task 3: Routes + Wayfinder generation + feature test (TDD)

**Files:**
- Modify: `routes/web.php`
- Test: `tests/Feature/SiteContentPagesTest.php`

**Interfaces:**
- Produces: named routes `services` (`GET /services`), `services.show` (`GET /services/{slug}`), `pricing`, `gallery`, `about`, `faq`, `contact`; Wayfinder helpers `services`, `pricing`, `gallery`, `about`, `faq`, `contact` in `@/routes` (consumed by Tasks 4–8).

- [ ] **Step 1: Write the failing feature test**

```php
<?php

use function Pest\Laravel\get;

beforeEach(function () {
    // Page components are added in later tasks; assert only the server-side
    // Inertia component contract for now. The override is removed in Task 8.
    config(['inertia.testing.ensure_pages_exist' => false]);
});

dataset('content pages', [
    ['/services', 'site/services/index'],
    ['/pricing', 'site/pricing'],
    ['/gallery', 'site/gallery'],
    ['/about', 'site/about'],
    ['/faq', 'site/faq'],
    ['/contact', 'site/contact'],
]);

test('content pages render', function (string $url, string $component) {
    get($url)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component($component));
})->with('content pages');

test('the service detail page renders for a known slug', function () {
    get('/services/ceramic-coating')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/services/show')
            ->where('slug', 'ceramic-coating'));
});
```

Save as `tests/Feature/SiteContentPagesTest.php`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter=SiteContentPagesTest'`
Expected: FAIL — routes not defined (404).

- [ ] **Step 3: Add the routes**

In `routes/web.php`, add these below the existing `/booking` route (ensure `use Inertia\Inertia;` is already present at the top — it is from Phase 1):

```php
Route::get('/services', function () {
    return Inertia::render('site/services/index');
})->name('services');

Route::get('/services/{slug}', function (string $slug) {
    return Inertia::render('site/services/show', ['slug' => $slug]);
})->name('services.show');

Route::get('/pricing', function () {
    return Inertia::render('site/pricing');
})->name('pricing');

Route::get('/gallery', function () {
    return Inertia::render('site/gallery');
})->name('gallery');

Route::get('/about', function () {
    return Inertia::render('site/about');
})->name('about');

Route::get('/faq', function () {
    return Inertia::render('site/faq');
})->name('faq');

Route::get('/contact', function () {
    return Inertia::render('site/contact');
})->name('contact');
```

- [ ] **Step 4: Generate Wayfinder helpers**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan wayfinder:generate'`
Expected: regenerates `resources/js/routes/*` so `import { services, pricing, gallery, about, faq, contact } from '@/routes'` resolves.

- [ ] **Step 5: Run the test to verify it passes**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter=SiteContentPagesTest'`
Expected: PASS (7 assertions: 6 dataset rows + the detail slug).

- [ ] **Step 6: Pint + commit**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php vendor/bin/pint --dirty --format agent'`

```bash
git add routes/web.php tests/Feature/SiteContentPagesTest.php
git commit -m "feat: add site content routes with feature test"
```

---

### Task 4: Expand the navigation config

**Files:**
- Modify: `resources/js/lib/navigation.ts`

**Interfaces:**
- Consumes: Wayfinder helpers `services`, `pricing`, `gallery`, `about`, `faq`, `contact`, `booking` from `@/routes`.
- Produces: the updated `NAV_ITEMS` consumed by the existing `desktop-nav`, `mobile-nav`, `site-footer`.

- [ ] **Step 1: Replace the imports and `NAV_ITEMS`**

Edit `resources/js/lib/navigation.ts` — replace the `import { booking } from '@/routes';` line and the `NAV_ITEMS` array with:

```ts
import { about, booking, contact, faq, gallery, pricing, services } from '@/routes';
```

```ts
export const NAV_ITEMS: readonly SiteNavItem[] = [
    { label: 'Services', href: services().url },
    { label: 'Pricing', href: pricing().url },
    { label: 'Gallery', href: gallery().url },
    { label: 'About', href: about().url },
    { label: 'FAQ', href: faq().url },
    { label: 'Contact', href: contact().url },
    { label: 'Book Now', href: booking().url, variant: 'cta' },
];
```

Leave `SiteNavItem`, `isVisible`, and `isCta` unchanged.

- [ ] **Step 2: Verify build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS — all seven helpers resolve; the header/footer now render the full link set.

- [ ] **Step 3: Commit**

```bash
git add resources/js/lib/navigation.ts
git commit -m "feat: expand site nav with content page links"
```

---

### Task 5: Ported shared components (Pricing, ContactForm)

**Files:**
- Create: `resources/js/components/site/pricing.tsx`
- Create: `resources/js/components/site/contact-form.tsx`

**Interfaces:**
- Consumes: `BUNDLES` from `@/lib/services`; `Section`, `Eyebrow` from `@/components/site/landing/*`; `Badge`, `Button`, `Card*`, `Input`, `Label`, `Textarea` from `@/components/ui/*`; `booking` from `@/routes`; `Link` from `@inertiajs/react`.
- Produces: `function Pricing({ viewAllHref }: { viewAllHref?: string })`; `function ContactForm()`.

- [ ] **Step 1: Pricing (bundles)**

```tsx
// resources/js/components/site/pricing.tsx
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

import { Eyebrow } from '@/components/site/landing/eyebrow';
import { Section } from '@/components/site/landing/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BUNDLES } from '@/lib/services';
import { booking } from '@/routes';

export function Pricing({ viewAllHref }: { viewAllHref?: string } = {}) {
    return (
        <Section aria-labelledby="pricing-heading">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <Eyebrow>Packages</Eyebrow>
                <h2
                    id="pricing-heading"
                    className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                >
                    Bundle &amp; save
                </h2>
                <p className="mt-4 text-muted-foreground">
                    Bundle our services and save — or price any service individually.
                </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {BUNDLES.map((bundle) => (
                    <div key={bundle.slug} className={cn('relative', bundle.featured && 'lg:scale-105')}>
                        {bundle.featured && (
                            <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">Most popular</Badge>
                        )}
                        <Card
                            className={cn(
                                'flex h-full flex-col',
                                bundle.featured ? 'ring-2 ring-primary' : 'transition-colors hover:ring-foreground/20',
                            )}
                        >
                            <CardHeader>
                                <CardTitle className="text-xl">{bundle.name}</CardTitle>
                                <CardDescription>{bundle.description}</CardDescription>
                                <div className="mt-2 font-heading text-4xl font-semibold">{bundle.price}</div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="flex flex-col gap-3">
                                    {bundle.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <Check className="size-4 text-primary" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" variant={bundle.featured ? 'default' : 'outline'}>
                                    <Link href={booking().url}>Book {bundle.name}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
            {viewAllHref && (
                <div className="mt-10 text-center">
                    <Button asChild variant="outline">
                        <Link href={viewAllHref}>See full pricing</Link>
                    </Button>
                </div>
            )}
        </Section>
    );
}
```

- [ ] **Step 2: ContactForm (presentational)**

```tsx
// resources/js/components/site/contact-form.tsx
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // No backend yet — acknowledge the submission locally.
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/40 p-8 text-center">
                <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-medium">Thanks for reaching out!</h3>
                <p className="text-sm text-muted-foreground">
                    We&apos;ve received your message and will get back to you shortly.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required placeholder="Jane Doe" />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="How can we help?" />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required rows={5} placeholder="Tell us about your vehicle and what you need…" />
            </div>
            <Button type="submit" size="lg" className="sm:self-start">
                Send message
            </Button>
        </form>
    );
}
```

- [ ] **Step 3: Verify build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add resources/js/components/site/pricing.tsx resources/js/components/site/contact-form.tsx
git commit -m "feat: add pricing and contact-form site components"
```

---

### Task 6: About + Gallery pages

**Files:**
- Create: `resources/js/pages/site/about.tsx`
- Create: `resources/js/pages/site/gallery.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `ImageSlot` from `@/components/site/landing/*`; `Card*`, `Button` from `@/components/ui/*`; `Head`, `Link` from `@inertiajs/react`; `booking` from `@/routes`; icons from `lucide-react`.

- [ ] **Step 1: About page**

```tsx
// resources/js/pages/site/about.tsx
import { Head, Link } from '@inertiajs/react';
import { Award, Clock, Heart, Leaf } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { PageHeader } from '@/components/site/landing/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { booking } from '@/routes';

const VALUES = [
    { icon: Award, title: 'Craftsmanship', description: 'Certified detailers and proven techniques on every job.' },
    { icon: Heart, title: 'Care', description: 'We treat every vehicle as if it were our own.' },
    { icon: Leaf, title: 'Eco-conscious', description: 'Premium products that are kinder to your car and the planet.' },
    { icon: Clock, title: 'Reliability', description: 'On time, every time — at our studio or your door.' },
];

const STATS = [
    { value: '10+', label: 'Years experience' },
    { value: '5,000+', label: 'Cars detailed' },
    { value: '4.9★', label: 'Average rating' },
    { value: '100%', label: 'Satisfaction focus' },
];

export default function About() {
    return (
        <>
            <Head title="About Ledion Autocare" />
            <main>
                <PageHeader title="About Ledion Autocare" description="Detailing obsessed, since day one." />
                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <ImageSlot label="Our studio" className="aspect-[4/3] w-full" />
                        <div className="flex flex-col gap-4">
                            <h2 className="text-3xl font-semibold tracking-tight">Our story</h2>
                            <p className="text-muted-foreground">
                                Ledion Autocare was founded on a simple belief: every car deserves meticulous,
                                professional care. What started as a passion for perfection has grown into a trusted name
                                in auto detailing, surface protection, and maintenance.
                            </p>
                            <p className="text-muted-foreground">
                                Whether you visit our fully equipped studio or book our mobile team, we bring the same
                                obsessive attention to detail to every vehicle.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="border-t border-border bg-muted/40">
                    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-semibold tracking-tight">What we stand for</h2>
                        </div>
                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {VALUES.map(({ icon: Icon, title, description }) => (
                                <Card key={title} className="rounded-2xl">
                                    <CardHeader>
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon className="size-6" />
                                        </div>
                                        <CardTitle className="text-lg">{title}</CardTitle>
                                        <CardDescription>{description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <dt className="text-4xl font-semibold">{stat.value}</dt>
                                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-12 text-center">
                        <Button asChild size="lg">
                            <Link href={booking().url}>Book your detail</Link>
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}
```

- [ ] **Step 2: Gallery page**

```tsx
// resources/js/pages/site/gallery.tsx
import { Head } from '@inertiajs/react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { PageHeader } from '@/components/site/landing/page-header';

const CATEGORIES = [
    { name: 'Exterior Detailing', items: ['Full exterior wash', 'Paint correction', 'Gloss finish', 'Wheel restoration'] },
    { name: 'Interior Detailing', items: ['Interior shampoo', 'Leather conditioning', 'Dashboard restore', 'Odor removal'] },
    { name: 'Surface Protection', items: ['Ceramic coating', 'Paint protection film', 'Glass coating', 'Trim sealing'] },
];

export default function Gallery() {
    return (
        <>
            <Head title="Our Work — Ledion Autocare" />
            <main>
                <PageHeader title="Our Work" description="A glimpse of the results our team delivers, day in and day out." />
                <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    {CATEGORIES.map((category) => (
                        <section key={category.name}>
                            <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
                            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {category.items.map((item) => (
                                    <ImageSlot key={item} label={item} className="aspect-square w-full" />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </>
    );
}
```

- [ ] **Step 3: Verify build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/site/about.tsx resources/js/pages/site/gallery.tsx
git commit -m "feat: add about and gallery pages"
```

---

### Task 7: Services index + Service detail pages

**Files:**
- Create: `resources/js/pages/site/services/index.tsx`
- Create: `resources/js/pages/site/services/show.tsx`

**Interfaces:**
- Consumes: `CATEGORIES`, `getServicesByCategory`, `getServiceBySlug`, type `Service` from `@/lib/services`; `PageHeader`, `ImageSlot`; `Card*`, `Button`; `Head`, `Link` from `@inertiajs/react`; icons `ArrowRight`, `Check`, `ImageIcon` from `lucide-react`.
- The `show` page receives `slug: string` as an Inertia prop (from the `services.show` route).

- [ ] **Step 1: Services index**

```tsx
// resources/js/pages/site/services/index.tsx
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ImageIcon } from 'lucide-react';

import { PageHeader } from '@/components/site/landing/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, getServicesByCategory } from '@/lib/services';

export default function ServicesIndex() {
    return (
        <>
            <Head title="Our Services — Ledion Autocare" />
            <main>
                <PageHeader
                    title="Our Services"
                    description="Everything your car needs, from a quick wash to full paint protection — explore each service in detail."
                />
                <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    {CATEGORIES.map((category) => (
                        <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                            <div className="max-w-2xl">
                                <h2 id={`cat-${category.id}`} className="text-2xl font-semibold tracking-tight">
                                    {category.label}
                                </h2>
                                <p className="mt-2 text-muted-foreground">{category.description}</p>
                            </div>
                            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {getServicesByCategory(category.id).map((service) => {
                                    const Icon = service.icon;
                                    return (
                                        <Link
                                            key={service.slug}
                                            href={`/services/${service.slug}`}
                                            className="group rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                                        >
                                            <Card className="h-full rounded-2xl transition-colors group-hover:border-primary">
                                                <div className="-mt-(--card-spacing) flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground/60 transition-colors group-hover:bg-muted/70">
                                                    <ImageIcon className="size-8" aria-hidden />
                                                    <span className="sr-only">{service.title} image coming soon</span>
                                                </div>
                                                <CardHeader>
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                        <Icon className="size-6" />
                                                    </div>
                                                    <CardTitle className="text-lg">{service.title}</CardTitle>
                                                    <CardDescription>{service.tagline}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">
                                                        From <span className="font-medium text-foreground">{service.pricing.from}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                                                        Details
                                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </>
    );
}
```

- [ ] **Step 2: Service detail (client-side slug lookup + in-page not-found)**

```tsx
// resources/js/pages/site/services/show.tsx
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { PageHeader } from '@/components/site/landing/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getServiceBySlug, type Service } from '@/lib/services';

export default function ServiceShow({ slug }: { slug: string }) {
    const service = getServiceBySlug(slug);

    if (!service) {
        return (
            <>
                <Head title="Service not found — Ledion Autocare" />
                <main className="mx-auto flex min-h-[60svh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">Service not found</h1>
                    <p className="text-muted-foreground">
                        We couldn&apos;t find that service. Browse our full range instead.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/services">View all services</Link>
                    </Button>
                </main>
            </>
        );
    }

    const related = service.related
        .map((relatedSlug) => getServiceBySlug(relatedSlug))
        .filter((item): item is Service => item !== undefined);

    return (
        <>
            <Head title={`${service.title} — Ledion Autocare`} />
            <main>
                <PageHeader title={service.title} description={service.tagline} />

                <div className="mx-auto flex max-w-7xl flex-col gap-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <section className="grid items-center gap-12 lg:grid-cols-2">
                        <ImageSlot label={service.title} className="aspect-[4/3] w-full" />
                        <div className="flex flex-col gap-5">
                            <h2 className="text-3xl font-semibold tracking-tight">Overview</h2>
                            <p className="text-muted-foreground">{service.description}</p>
                            <ul className="flex flex-col gap-3">
                                {service.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                        <Check className="size-4 text-primary" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div>
                                <Button asChild size="lg">
                                    <Link href="/booking">Book this service</Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="process-heading">
                        <h2 id="process-heading" className="text-2xl font-semibold tracking-tight">How it works</h2>
                        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
                            {service.process.map((step, index) => (
                                <li key={step.title} className="flex flex-col gap-2">
                                    <span className="text-4xl font-semibold text-primary/30">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-lg font-medium">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section aria-labelledby="detail-pricing-heading">
                        <h2 id="detail-pricing-heading" className="text-2xl font-semibold tracking-tight">Pricing</h2>
                        {service.pricing.packages ? (
                            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                                {service.pricing.packages.map((pkg) => (
                                    <Card key={pkg.name} className="flex flex-col rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                            <div className="mt-2 text-3xl font-semibold">{pkg.price}</div>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <ul className="flex flex-col gap-3">
                                                {pkg.features.map((feature) => (
                                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                                        <Check className="size-4 text-primary" aria-hidden="true" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild className="w-full" variant="outline">
                                                <Link href="/booking">Book {pkg.name}</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-wrap items-baseline gap-2">
                                <span className="text-muted-foreground">Starting at</span>
                                <span className="text-3xl font-semibold">{service.pricing.from}</span>
                                {service.pricing.unit && (
                                    <span className="text-sm text-muted-foreground">{service.pricing.unit}</span>
                                )}
                            </div>
                        )}
                        {service.pricing.note && (
                            <p className="mt-4 text-sm text-muted-foreground">{service.pricing.note}</p>
                        )}
                    </section>

                    {related.length > 0 && (
                        <section aria-labelledby="related-heading">
                            <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">Related services</h2>
                            <div className="mt-8 grid gap-6 md:grid-cols-3">
                                {related.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.slug}
                                            href={`/services/${item.slug}`}
                                            className="group rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                                        >
                                            <Card className="h-full rounded-2xl transition-colors group-hover:border-primary">
                                                <CardHeader>
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                        <Icon className="size-6" />
                                                    </div>
                                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                                    <CardDescription>{item.tagline}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                                                        View
                                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}
```

- [ ] **Step 3: Verify build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/site/services/index.tsx resources/js/pages/site/services/show.tsx
git commit -m "feat: add services index and service detail pages"
```

---

### Task 8: Pricing + FAQ + Contact pages, then strengthen the test + full verification

**Files:**
- Create: `resources/js/pages/site/pricing.tsx`
- Create: `resources/js/pages/site/faq.tsx`
- Create: `resources/js/pages/site/contact.tsx`
- Modify: `tests/Feature/SiteContentPagesTest.php`

**Interfaces:**
- Consumes: `Pricing`, `ContactForm` from `@/components/site/*`; `CATEGORIES`, `getServicesByCategory` from `@/lib/services`; `PageHeader`, `ImageSlot`; `Accordion*`, `Button`; `Head`, `Link`; `booking`, `contact`, `faq` from `@/routes`; icons.

- [ ] **Step 1: Pricing page**

```tsx
// resources/js/pages/site/pricing.tsx
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { Pricing } from '@/components/site/pricing';
import { PageHeader } from '@/components/site/landing/page-header';
import { Button } from '@/components/ui/button';
import { CATEGORIES, getServicesByCategory } from '@/lib/services';
import { booking, contact, faq } from '@/routes';

export default function PricingPage() {
    return (
        <>
            <Head title="Pricing — Ledion Autocare" />
            <main>
                <PageHeader
                    title="Pricing"
                    description="Bundle and save, or pick exactly the service you need. Starting prices below — final quotes depend on vehicle size and condition."
                />

                <Pricing />

                <section className="border-t border-border bg-muted/40" aria-labelledby="price-list-heading">
                    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 id="price-list-heading" className="text-3xl font-semibold tracking-tight">
                                Per-service pricing
                            </h2>
                            <p className="mt-4 text-muted-foreground">All services, grouped by category.</p>
                        </div>

                        <div className="mt-12 flex flex-col gap-12">
                            {CATEGORIES.map((category) => (
                                <div key={category.id}>
                                    <h3 className="text-xl font-semibold tracking-tight">{category.label}</h3>
                                    <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-background">
                                        {getServicesByCategory(category.id).map((service) => (
                                            <li
                                                key={service.slug}
                                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                                            >
                                                <div className="min-w-0">
                                                    <Link href={`/services/${service.slug}`} className="font-medium hover:text-primary">
                                                        {service.title}
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground">{service.tagline}</p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        From <span className="font-semibold text-foreground">{service.pricing.from}</span>
                                                        {service.pricing.unit ? ` ${service.pricing.unit}` : ''}
                                                    </span>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/services/${service.slug}`}>
                                                            Details
                                                            <ArrowRight className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <p className="mt-12 text-center text-sm text-muted-foreground">
                            Need help choosing?{' '}
                            <Link href={faq().url} className="font-medium text-primary hover:underline">
                                Read our FAQ
                            </Link>{' '}
                            or{' '}
                            <Link href={contact().url} className="font-medium text-primary hover:underline">
                                contact us
                            </Link>
                            .
                        </p>
                        <div className="mt-8 text-center">
                            <Button asChild size="lg">
                                <Link href={booking().url}>Book Now</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
```

- [ ] **Step 2: FAQ page**

```tsx
// resources/js/pages/site/faq.tsx
import { Head, Link } from '@inertiajs/react';

import { PageHeader } from '@/components/site/landing/page-header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { contact } from '@/routes';

const FAQS = [
    {
        question: "What's the difference between in-shop and home service?",
        answer: 'In-shop service is performed at our fully equipped studio, ideal for deep details and ceramic coatings. Home service brings our mobile team to your driveway for convenience — both deliver the same professional results.',
    },
    {
        question: 'How long does a detail take?',
        answer: "It depends on the package and your vehicle's condition. An Essential detail typically takes 1–2 hours, while a Signature package with paint correction and ceramic coating can take a full day.",
    },
    {
        question: 'Do I need to do anything to prepare my car?',
        answer: "Just remove any personal belongings you'd like to keep. We handle the rest — there's no need to pre-wash or vacuum beforehand.",
    },
    {
        question: 'How long does ceramic coating last?',
        answer: "With proper care, our ceramic coatings can protect your paint for several years. We'll walk you through simple maintenance to keep it performing at its best.",
    },
    {
        question: 'What areas do you serve for home service?',
        answer: "We cover most of the metro area. When you book, you'll be able to confirm whether your address is within our service range.",
    },
    {
        question: 'How do I pay and book?',
        answer: 'Booking is done online — choose your service, in-shop or home, and a time that works for you. Payment details are confirmed at the time of service.',
    },
];

export default function Faq() {
    return (
        <>
            <Head title="FAQ — Ledion Autocare" />
            <main>
                <PageHeader title="Frequently Asked Questions" description="Everything you need to know before you book." />
                <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <Accordion type="single" collapsible className="w-full">
                        {FAQS.map((item, index) => (
                            <AccordionItem key={item.question} value={`item-${index}`}>
                                <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground">Still have a question?</p>
                        <Button asChild variant="outline" className="mt-4">
                            <Link href={contact().url}>Contact us</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </>
    );
}
```

- [ ] **Step 3: Contact page**

```tsx
// resources/js/pages/site/contact.tsx
import { Head } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { ContactForm } from '@/components/site/contact-form';
import { ImageSlot } from '@/components/site/landing/image-slot';
import { PageHeader } from '@/components/site/landing/page-header';

const DETAILS = [
    { icon: MapPin, label: 'Address', value: '123 Detailing Ave, Your City' },
    { icon: Phone, label: 'Phone', value: '(555) 012-3456' },
    { icon: Mail, label: 'Email', value: 'hello@ledionautocare.com' },
    { icon: Clock, label: 'Hours', value: 'Mon–Fri 8am–6pm · Sat 9am–4pm' },
];

export default function Contact() {
    return (
        <>
            <Head title="Contact — Ledion Autocare" />
            <main>
                <PageHeader title="Contact Us" description="Questions, quotes, or bookings — we'd love to hear from you." />
                <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
                    <div className="flex flex-col gap-8">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">Get in touch</h2>
                            <ul className="mt-6 flex flex-col gap-5">
                                {DETAILS.map(({ icon: Icon, label, value }) => (
                                    <li key={label} className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon className="size-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{label}</p>
                                            <p className="text-sm text-muted-foreground">{value}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <ImageSlot label="Map" className="aspect-video w-full" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Send a message</h2>
                        <div className="mt-6">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
```

- [ ] **Step 4: Strengthen the feature test**

Now that every page component exists, remove the override so the test also verifies the page files resolve. In `tests/Feature/SiteContentPagesTest.php`, delete the entire `beforeEach(function () { ... });` block (the `config(['inertia.testing.ensure_pages_exist' => false]);` one).

- [ ] **Step 5: Full build + full test suite**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact'`
Expected: PASS — `SiteContentPagesTest` (7 assertions) green with `ensure_pages_exist` enforced, plus the full suite still green.

- [ ] **Step 6: Manual visual check (human)**

Do NOT perform this yourself. Note in the report that it is pending: the human should run `larakube composer run dev` and verify `/services`, `/services/ceramic-coating`, `/pricing`, `/gallery`, `/about`, `/faq`, `/contact` in light + dark, plus nav links and active states.

- [ ] **Step 7: Commit**

```bash
git add resources/js/pages/site/pricing.tsx resources/js/pages/site/faq.tsx resources/js/pages/site/contact.tsx tests/Feature/SiteContentPagesTest.php
git commit -m "feat: add pricing, faq, and contact pages"
```

---

## Self-Review Notes

- **Spec coverage:** services data layer (Task 1) ✓; accordion + textarea (Task 2) ✓; routes + Wayfinder + Pest test (Task 3) ✓; nav expansion (Task 4) ✓; Pricing + ContactForm ported (Task 5) ✓; about + gallery (Task 6) ✓; services index + detail with client-side slug lookup + in-page not-found (Task 7) ✓; pricing + faq + contact (Task 8) ✓; presentational contact form ✓; test strengthened once pages exist (Task 8) ✓.
- **Build-order:** routes + Wayfinder (Task 3) run before every task that imports `@/routes` content helpers (4–8), so every task builds green in order — no deferred builds this phase (unlike Phase 1).
- **Type consistency:** `Service`/`Bundle`/`getServiceBySlug`/`getServicesByCategory`/`CATEGORIES`/`BUNDLES` defined in Task 1, consumed with matching signatures in Tasks 5, 7, 8. `Pricing`'s optional `viewAllHref` prop matches its call sites (used without args on the pricing page). The `show` page's `{ slug: string }` prop matches the `services.show` route's `['slug' => $slug]`.
- **Link strategy:** nav + static cross-page links use Wayfinder helpers (`services()`, `booking()`, `contact()`, `faq()`); dynamic per-service links use `` `/services/${slug}` `` template strings (source pattern) — no Wayfinder dynamic-route API is assumed.
- **No placeholders:** every code step contains complete, runnable code; the data layer is a verbatim `cp` of a self-contained source file whose only dependency (`lucide-react`) resolves here.
