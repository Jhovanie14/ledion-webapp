# Phase 3 — Booking Flow (Design)

**Branch:** `feat/site-port-inertia`
**Date:** 2026-07-01
**Status:** Approved, ready for implementation plan

## Summary

Port the Next.js marketing site's booking wizard into the Laravel 13 + Inertia v3 + React 19
app, and optimize it beyond the source's client-only mock: submit through Inertia to a real
Laravel backend that persists a `Booking`, issues a real unique reference, and redirects to a
shareable confirmation page. Add a queued customer confirmation email, a queued staff
notification, and an authenticated admin bookings list + detail.

The source flow is a 5-step wizard (Type → Service → Schedule → Details → Review) plus a
Confirmation screen. All step state lives client-side; only the final "Confirm booking" action
hits the server.

## Scope

**In scope**

- Public booking stepper (5 steps) rendered on `/booking`.
- Real `Booking` persistence with a server-generated unique reference.
- Shareable confirmation page at `/booking/{reference}` loaded from the database.
- Queued customer confirmation email.
- Queued staff notification to a configured shop address.
- Authenticated admin bookings **list + detail**.

**Out of scope (deferred)**

- Migrating the services data layer to Eloquent `Service`/`Bundle` models, route-model-binding
  for `/services/{slug}`, and the real 404 there → **Phase 4**. Bookings store a denormalized
  snapshot of chosen items instead of foreign keys.
- Role-based authorization. The admin area is gated by the existing `auth` + `verified`
  middleware (any verified user). Role granularity is a later concern.
- Contact form real submission (still deferred from Phase 2).
- Payments — none are collected online; payment happens in-shop or on home-service delivery.

## Naming decisions (carried from planning)

- `BookingWizard` → **`BookingStepper`**
- `Stepper` (progress bar) → **`StepIndicator`**

## Data model — `bookings` table

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `reference` | string, **unique**, indexed | server-generated `LA-XXXXX`, retried on collision |
| `user_id` | nullable FK → `users`, nullOnDelete | set when a signed-in user books; guest otherwise |
| `service_type` | string | `in_shop` \| `home_service` |
| `status` | string, default `pending` | `pending` / `confirmed` / `completed` / `cancelled` (admin lifecycle) |
| `scheduled_date` | date | |
| `scheduled_time` | string | slot label, e.g. `09:00 AM` |
| `customer_name` | string | |
| `customer_email` | string | |
| `customer_phone` | string | |
| `customer_address` | string, nullable | required only for home service |
| `car_year` | string | kept as string (source uses free text) |
| `car_make` | string | |
| `car_model` | string | |
| `items` | json | array of `{ kind, slug, title, price }` snapshots |
| `estimated_total` | unsigned integer | pesos; recomputed server-side from item prices |
| `created_at` / `updated_at` | timestamps | |

**`Booking` model**

- Casts: `items` → `array`, `scheduled_date` → `date`.
- `$fillable` for all customer/car/schedule/type/items/total/reference/user_id/status fields.
- `user()` belongsTo relationship (nullable).
- The public show route binds on the `reference` column via an explicit `{booking:reference}`
  segment; the admin routes keep the default `id` binding (`{booking}`). The model's
  `getRouteKeyName()` is left as the default so the two bindings don't collide.
- `BookingFactory` producing realistic PH data (peso prices, valid non-Sunday future dates,
  a slot from the allowed list, 1–3 item snapshots).

**Reference generation**

- Format `LA-` + 5 uppercase base36 characters (matches the source's shape).
- Generated server-side in a loop that re-rolls on a uniqueness collision against the
  `reference` column.

## Backend

### Routes (`routes/web.php`) — Wayfinder helpers, controllers via `make:controller`

Public (no auth):

- `GET  /booking` → `BookingController@create` — renders `site/booking`.
- `POST /booking` → `BookingController@store` — validate → persist → generate reference →
  dispatch confirmation mail + staff notification → **redirect** to the show route.
- `GET  /booking/{booking:reference}` → `BookingController@show` — renders
  `site/booking-confirmation` with the booking; unknown reference → real **404**.

Admin (`auth`, `verified` middleware group):

- `GET  /bookings` → `Admin\BookingController@index` — paginated list, newest first.
- `GET  /bookings/{booking}` → `Admin\BookingController@show` — full detail (items, car,
  customer, schedule, status).

The existing dashboard route stays; a sidebar nav link to **Bookings** is added.

### `StoreBookingRequest`

- `service_type` — required, `in:in_shop,home_service`.
- `items` — required array, `min:1`.
- `items.*.kind` — required, `in:service,bundle`.
- `items.*.slug` — required string.
- `items.*.title` — required string.
- `items.*.price` — required string (display price, e.g. `₱8,000`).
- `scheduled_date` — required, `date`, `after_or_equal:today`, plus a custom **NotSunday** rule.
- `scheduled_time` — required, `in:` the slots from `config('booking.time_slots')`.
- `customer_name` — required string.
- `customer_email` — required email.
- `customer_phone` — required string.
- `customer_address` — `required_if:service_type,home_service`, else nullable.
- `car_year` / `car_make` / `car_model` — required strings.

The controller recomputes `estimated_total` server-side by parsing the submitted item prices
(strip non-digits, sum). It does **not** trust a client-sent total.

### Config — `config/booking.php`

```php
return [
    // Mirrors the TS TIME_SLOTS used by the Schedule step (kept in sync manually).
    'time_slots' => ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'],
    // Recipient for the staff "new booking" notification.
    'notification_email' => env('BOOKING_NOTIFICATION_EMAIL', 'bookings@ledion.test'),
];
```

### Known tradeoff — trusting the item snapshot

Because the services catalog still lives only in the TypeScript config (`resources/js/lib/services.ts`),
the server validates the **shape** of each item but cannot yet verify that a `slug` exists or
that the `price` is authentic. Prices are explicit estimates ("Final price is confirmed based on
your vehicle"), no payment is taken, so this is acceptable for now. When services move to Eloquent
in Phase 4, `StoreBookingRequest` can validate slugs and derive authoritative prices server-side.

## Frontend

### `resources/js/lib/booking.ts`

Port the source types and helpers:

- Types: `ServiceType`, `CartItemKind`, `CartItem`, `CustomerInfo`, `CarInfo`, `BookingState`.
- Constants: `SERVICE_TYPE_LABELS`, `TIME_SLOTS`.
- Helpers: `emptyBookingState`, `parsePrice`, `formatPeso`, `cartTotal`, `isItemSelected`.
- **Drop** `generateReference` — the server owns reference generation now.

### Components — `resources/js/components/site/booking/`

- `booking-stepper.tsx` (renamed from `BookingWizard`)
  - Same 5-step orchestration and `isStepValid` gating.
  - Keeps the smooth scroll-to-top-on-step-change behavior.
  - **Confirm** submits the assembled payload via Inertia `router.post` to the `booking.store`
    Wayfinder route (serializing `scheduled_date` to `YYYY-MM-DD`), showing a submitting state on
    the button and disabling re-submit. On success the server redirect renders the confirmation
    page. On a 422 it surfaces an inline error on the Review step.
- `step-indicator.tsx` (renamed from `Stepper`) — unchanged visual behavior.
- `steps/service-type-step.tsx`
- `steps/service-step.tsx` — reads `CATEGORIES`, `getServicesByCategory`, `BUNDLES` from the
  existing `resources/js/lib/services.ts`.
- `steps/schedule-step.tsx` — uses the new shadcn `Calendar`.
- `steps/details-step.tsx` — **fixes** the source's stray `className="border border-bord"` on the
  year input.
- `steps/review-step.tsx`

The Confirmation screen becomes a **page**, not a step component (we redirect to it).

### New UI dependency — shadcn `Calendar`

Add the shadcn `calendar` component and its `react-day-picker` dependency (approved). The Schedule
step disables past dates and Sundays, matching the source.

### Pages

- `resources/js/pages/site/booking.tsx` — page header (reusing the existing site page-header
  pattern used by about/pricing) + `<BookingStepper/>`. Uses `SiteLayout`.
- `resources/js/pages/site/booking-confirmation.tsx` — renders from the server `booking` prop
  (reference, service type, schedule, items, customer, car). Uses `SiteLayout`. "Book another"
  links back to `/booking`; "Back to home" links to `/`.
- `resources/js/pages/bookings/index.tsx` — admin table (reference, date/time, customer, type,
  estimated total, status), paginated newest-first. Uses `AppLayout` with breadcrumbs.
- `resources/js/pages/bookings/show.tsx` — admin detail (full booking incl. items/car/customer).
  Uses `AppLayout` with breadcrumbs.

## Notifications

- `BookingConfirmationMail` — queued, markdown mail to the customer's email. Includes reference,
  service type, schedule, and a "we'll be in touch / payment collected in-shop or on delivery" note.
- `NewBookingNotification` — queued, mail channel, sent on-demand to
  `config('booking.notification_email')` with the booking summary and a link to the admin detail.

Redis queue + Horizon are already configured. Tests use `Mail::fake()` / `Notification::fake()`.

## Testing (Pest feature tests)

`BookingTest` (public):

- Valid payload persists a booking, assigns a unique `LA-` reference, redirects to the show route,
  and dispatches both the confirmation mail and the staff notification.
- `estimated_total` is computed server-side from item prices.
- A signed-in user's booking sets `user_id`; a guest's leaves it null.
- Validation failures each return 422: no items, invalid `service_type`, a Sunday date, a past
  date, a disallowed time slot, missing `customer_address` for home service.
- Confirmation `show` renders the correct reference; an unknown reference returns 404.

`Admin/BookingIndexTest`:

- Guests are redirected from `/bookings`; a verified user sees the list.
- The list contains persisted bookings; the detail page renders a single booking.

Update `SitePagesTest` / `SiteContentPagesTest` as needed now that `/booking` is served by a
controller (still returns 200 and renders `site/booking`).

## File boundaries

Each step component owns one screen and communicates through props (value + onChange), as in the
source. `booking-stepper.tsx` is the only stateful orchestrator and the only component that talks
to the server. `lib/booking.ts` holds pure state helpers with no rendering. The backend splits
public booking (`BookingController`) from admin (`Admin\BookingController`), and validation lives
in `StoreBookingRequest`.
