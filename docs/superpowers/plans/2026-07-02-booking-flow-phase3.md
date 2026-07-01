# Ledion `(site)` Port — Phase 3 (Booking Flow) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the booking wizard into this Laravel + Inertia app and back it with a real `Booking` model — persist the booking, issue a real reference, redirect to a shareable confirmation page, send a queued customer email + staff notification, and add an authenticated admin bookings list/detail.

**Architecture:** A public 5-step client-side stepper (`BookingStepper`) assembles `BookingState` and, on confirm, `router.post`s a flat payload to `BookingController@store`. The controller validates via `StoreBookingRequest`, persists a `Booking` (denormalized item snapshot, server-computed total, unique `LA-XXXXX` reference), dispatches a queued `BookingConfirmationMail` + `NewBookingNotification`, and redirects to `GET /booking/{reference}` which renders the confirmation from the DB. An admin area (`/bookings`, `/bookings/{id}`) under the existing `auth`+`verified` group lists and shows bookings.

**Tech Stack:** Laravel 13, Inertia v3, React 19, Tailwind v4, shadcn (new-york), react-day-picker (new), lucide-react, Wayfinder, Pest v4, Redis queue + Horizon, `larakube` wrapper.

## Global Constraints

- Run all larakube commands through WSL: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube <cmd>'`. The source project is readable from WSL at `/mnt/d/dev/ledion-project/`. The k8s cluster is up. If `larakube npm run build` fails with `EACCES ... public/build/assets`, clear the stale root-owned dir once with `docker run --rm -v "$(pwd)/public/build:/build" alpine rm -rf /build/assets`, then re-run.
- Edit files via the UNC path `//wsl.localhost/Ubuntu/home/primary/projects/ledion-webapp/`. Run git from there (safe.directory already configured). Do NOT commit the pre-existing `artisan` working-tree change nor the pre-existing `resources/js/lib/services.ts` working-tree change; do NOT commit anything under `resources/js/routes/` or `resources/js/actions/` (gitignored — Wayfinder regenerates them).
- Run `larakube php vendor/bin/pint --dirty --format agent` after any PHP change, before committing.
- PHP: curly braces always; constructor property promotion; explicit return types + param type hints; PHPDoc array shapes; TitleCase enum-ish string values are lower_snake here to match the source (`in_shop`, `home_service`).
- Frontend: theme tokens only (no hardcoded hex); mobile-first; no `"use client"` directives; internal nav via Inertia `Link`/`router` from `@inertiajs/react` (never `next/*`); page `<title>` via Inertia `<Head>`.
- Booking is a **guest** flow (no auth required); link to `user_id` only when a user is signed in. The admin area is gated solely by the existing `auth`+`verified` middleware (no role system yet).
- Server **trusts the item snapshot's** slug/title/price (services aren't in the DB yet — Phase 4); it validates item *shape* and recomputes `estimated_total` itself. Never trust a client-sent total.
- Peso prices (`₱`) and the six time slots are preserved from source; the slots live in BOTH `config/booking.php` (validation) and `resources/js/lib/booking.ts` (`TIME_SLOTS`, UI) and must be kept in sync.

---

### Task 1: Database layer — migration, `Booking` model, factory

**Files:**
- Create: `database/migrations/2026_07_02_000000_create_bookings_table.php` (use the artisan-generated timestamp name — see Step 1)
- Create: `app/Models/Booking.php`
- Create: `database/factories/BookingFactory.php`
- Test: `tests/Feature/BookingModelTest.php`

**Interfaces:**
- Produces: `App\Models\Booking` with `$fillable` (reference, user_id, service_type, status, scheduled_date, scheduled_time, customer_name, customer_email, customer_phone, customer_address, car_year, car_make, car_model, items, estimated_total), casts `items`→array & `scheduled_date`→`date:Y-m-d`, `user()` belongsTo, static `generateUniqueReference(): string`. `BookingFactory`. Consumed by Tasks 2, 3, 4.

- [ ] **Step 1: Generate the migration + model + factory scaffolding**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan make:model Booking -mf --no-interaction'`
Expected: creates `app/Models/Booking.php`, a `database/migrations/*_create_bookings_table.php`, and `database/factories/BookingFactory.php`.

- [ ] **Step 2: Write the migration**

Replace the generated migration's `up()` body so `Schema::create('bookings', ...)` reads:

```php
Schema::create('bookings', function (Blueprint $table) {
    $table->id();
    $table->string('reference')->unique();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('service_type');
    $table->string('status')->default('pending');
    $table->date('scheduled_date');
    $table->string('scheduled_time');
    $table->string('customer_name');
    $table->string('customer_email');
    $table->string('customer_phone');
    $table->string('customer_address')->nullable();
    $table->string('car_year');
    $table->string('car_make');
    $table->string('car_model');
    $table->json('items');
    $table->unsignedInteger('estimated_total')->default(0);
    $table->timestamps();
});
```

- [ ] **Step 3: Write the `Booking` model**

Replace `app/Models/Booking.php` with:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'service_type',
        'status',
        'scheduled_date',
        'scheduled_time',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'car_year',
        'car_make',
        'car_model',
        'items',
        'estimated_total',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date:Y-m-d',
            'items' => 'array',
            'estimated_total' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a unique, human-friendly booking reference (e.g. "LA-A1B2C").
     */
    public static function generateUniqueReference(): string
    {
        do {
            $reference = 'LA-'.Str::upper(Str::random(5));
        } while (static::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
```

- [ ] **Step 4: Write the factory**

Replace `database/factories/BookingFactory.php` with:

```php
<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // A future weekday (never Sunday), matching the schedule rules.
        $date = Carbon::today()->addDays(fake()->numberBetween(1, 21));
        if ($date->isSunday()) {
            $date->addDay();
        }

        return [
            'reference' => 'LA-'.Str::upper(Str::random(5)),
            'user_id' => null,
            'service_type' => fake()->randomElement(['in_shop', 'home_service']),
            'status' => 'pending',
            'scheduled_date' => $date->format('Y-m-d'),
            'scheduled_time' => fake()->randomElement(['09:00 AM', '10:30 AM', '01:30 PM', '03:00 PM']),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->numerify('0917 ### ####'),
            'customer_address' => null,
            'car_year' => (string) fake()->numberBetween(2005, 2024),
            'car_make' => fake()->randomElement(['Toyota', 'Honda', 'Ford', 'Mitsubishi']),
            'car_model' => fake()->randomElement(['Vios', 'Civic', 'Ranger', 'Montero']),
            'items' => [
                ['kind' => 'service', 'slug' => 'carwash', 'title' => 'Carwash', 'price' => '₱150'],
            ],
            'estimated_total' => 150,
        ];
    }
}
```

- [ ] **Step 5: Write the model test**

Save as `tests/Feature/BookingModelTest.php`:

```php
<?php

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a booking casts items to an array and the date to Y-m-d', function () {
    $booking = Booking::factory()->create([
        'scheduled_date' => '2026-08-10',
        'items' => [['kind' => 'service', 'slug' => 'carwash', 'title' => 'Carwash', 'price' => '₱150']],
    ]);

    $fresh = $booking->fresh();

    expect($fresh->items)->toBeArray()->toHaveCount(1);
    expect($fresh->items[0]['slug'])->toBe('carwash');
    expect($fresh->scheduled_date->format('Y-m-d'))->toBe('2026-08-10');
});

test('generateUniqueReference returns an LA- prefixed 8-character code', function () {
    $reference = Booking::generateUniqueReference();

    expect($reference)->toStartWith('LA-')->toHaveLength(8);
});

test('the reference column is unique', function () {
    Booking::factory()->create(['reference' => 'LA-ABCDE']);

    Booking::factory()->create(['reference' => 'LA-ABCDE']);
})->throws(Illuminate\Database\QueryException::class);
```

- [ ] **Step 6: Run the migration test + the model test**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter=BookingModelTest'`
Expected: PASS (3 tests). RefreshDatabase runs the new migration.

- [ ] **Step 7: Pint + commit**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php vendor/bin/pint --dirty --format agent'`

```bash
git add app/Models/Booking.php database/migrations database/factories/BookingFactory.php tests/Feature/BookingModelTest.php
git commit -m "feat: add booking model, migration, and factory"
```

---

### Task 2: Confirmation mail + staff notification (queued)

**Files:**
- Create: `app/Mail/BookingConfirmationMail.php`
- Create: `resources/views/mail/booking-confirmation.blade.php`
- Create: `app/Notifications/NewBookingNotification.php`
- Test: `tests/Feature/BookingNotificationsTest.php`

**Interfaces:**
- Produces: `App\Mail\BookingConfirmationMail(Booking $booking)` (ShouldQueue, markdown `mail.booking-confirmation`); `App\Notifications\NewBookingNotification(Booking $booking)` (ShouldQueue, `mail` channel). Consumed by Task 3's controller.

- [ ] **Step 1: Generate the mailable + notification**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan make:mail BookingConfirmationMail --markdown=mail.booking-confirmation --no-interaction && larakube php artisan make:notification NewBookingNotification --no-interaction'`
Expected: creates `app/Mail/BookingConfirmationMail.php`, `resources/views/mail/booking-confirmation.blade.php`, `app/Notifications/NewBookingNotification.php`.

- [ ] **Step 2: Write the mailable**

Replace `app/Mail/BookingConfirmationMail.php` with:

```php
<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Ledion Autocare booking ('.$this->booking->reference.')',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.booking-confirmation',
        );
    }
}
```

- [ ] **Step 3: Write the mail template**

Replace `resources/views/mail/booking-confirmation.blade.php` with:

```blade
<x-mail::message>
# Booking confirmed

Thanks for booking with Ledion Autocare, {{ $booking->customer_name }}. We'll be in touch to confirm the details.

**Reference:** {{ $booking->reference }}
**Service type:** {{ $booking->service_type === 'home_service' ? 'Home Service' : 'In-Shop Service' }}
**Schedule:** {{ $booking->scheduled_date->format('F j, Y') }} · {{ $booking->scheduled_time }}

<x-mail::table>
| Service | Estimated |
|:------- | ---------:|
@foreach ($booking->items as $item)
| {{ $item['title'] }}{{ $item['kind'] === 'bundle' ? ' (bundle)' : '' }} | From {{ $item['price'] }} |
@endforeach
</x-mail::table>

**Estimated total:** ₱{{ number_format($booking->estimated_total) }}

Payment is collected in-shop, or handed to our team after your home service. No payment is required now.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

- [ ] **Step 4: Write the staff notification**

Replace `app/Notifications/NewBookingNotification.php` with:

```php
<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewBookingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New booking: '.$this->booking->reference)
            ->line($this->booking->customer_name.' booked a '.
                ($this->booking->service_type === 'home_service' ? 'home service' : 'in-shop service').'.')
            ->line('Schedule: '.$this->booking->scheduled_date->format('F j, Y').' · '.$this->booking->scheduled_time)
            ->line('Estimated total: ₱'.number_format($this->booking->estimated_total))
            ->action('View booking', url('/bookings/'.$this->booking->id));
    }
}
```

- [ ] **Step 5: Write the render/dispatch test**

Save as `tests/Feature/BookingNotificationsTest.php`:

```php
<?php

use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Notifications\NewBookingNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the confirmation mail renders the reference and items', function () {
    $booking = Booking::factory()->create([
        'reference' => 'LA-TEST1',
        'items' => [['kind' => 'service', 'slug' => 'carwash', 'title' => 'Carwash', 'price' => '₱150']],
    ]);

    $rendered = (new BookingConfirmationMail($booking))->render();

    expect($rendered)->toContain('LA-TEST1');
    expect($rendered)->toContain('Carwash');
});

test('the staff notification builds a mail message with the reference', function () {
    $booking = Booking::factory()->create(['reference' => 'LA-TEST2']);

    $mail = (new NewBookingNotification($booking))->toMail(new stdClass);

    expect($mail->subject)->toContain('LA-TEST2');
});
```

- [ ] **Step 6: Run the test**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter=BookingNotificationsTest'`
Expected: PASS (2 tests).

- [ ] **Step 7: Pint + commit**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php vendor/bin/pint --dirty --format agent'`

```bash
git add app/Mail/BookingConfirmationMail.php resources/views/mail/booking-confirmation.blade.php app/Notifications/NewBookingNotification.php tests/Feature/BookingNotificationsTest.php
git commit -m "feat: add booking confirmation mail and staff notification"
```

---

### Task 3: Public booking backend — config, rule, request, controller, routes (TDD)

**Files:**
- Create: `config/booking.php`
- Create: `app/Rules/NotSunday.php`
- Create: `app/Http/Requests/StoreBookingRequest.php`
- Create: `app/Http/Controllers/BookingController.php`
- Modify: `routes/web.php`
- Modify: `tests/Feature/SitePagesTest.php`
- Test: `tests/Feature/BookingTest.php`

**Interfaces:**
- Produces: named routes `booking` (`GET /booking`), `booking.store` (`POST /booking`), `booking.show` (`GET /booking/{booking:reference}`); Wayfinder action helper `@/actions/App/Http/Controllers/BookingController` with `.store.url()` (consumed by Task 7) and named-route helper `booking` (already exists). Confirmation page receives `booking: BookingRecord` (Task 8).

- [ ] **Step 1: Write the failing feature test**

Save as `tests/Feature/BookingTest.php`:

```php
<?php

use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Models\User;
use App\Notifications\NewBookingNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

uses(RefreshDatabase::class);

/**
 * @return array<string, mixed>
 */
function validBookingPayload(array $overrides = []): array
{
    $monday = Carbon::today()->next(Carbon::MONDAY)->format('Y-m-d');

    return array_merge([
        'service_type' => 'in_shop',
        'items' => [
            ['kind' => 'service', 'slug' => 'ceramic-coating', 'title' => 'Ceramic Coating', 'price' => '₱8,000'],
            ['kind' => 'bundle', 'slug' => 'full-detail', 'title' => 'Full Detail', 'price' => '₱3,000'],
        ],
        'scheduled_date' => $monday,
        'scheduled_time' => '09:00 AM',
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '0917 123 4567',
        'customer_address' => null,
        'car_year' => '2020',
        'car_make' => 'Toyota',
        'car_model' => 'Vios',
    ], $overrides);
}

test('the booking page renders', function () {
    get('/booking')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('site/booking'));
});

test('a valid booking is persisted, gets a reference, and redirects to the confirmation', function () {
    Mail::fake();
    Notification::fake();

    $response = post('/booking', validBookingPayload());

    $booking = Booking::sole();
    expect($booking->reference)->toStartWith('LA-');
    expect($booking->estimated_total)->toBe(11000); // 8,000 + 3,000, server-computed
    expect($booking->user_id)->toBeNull();

    $response->assertRedirect('/booking/'.$booking->reference);

    Mail::assertQueued(BookingConfirmationMail::class);
    Notification::assertSentOnDemand(NewBookingNotification::class);
});

test('a signed-in user is linked to their booking', function () {
    Mail::fake();
    Notification::fake();

    actingAs(User::factory()->create());
    post('/booking', validBookingPayload());

    expect(Booking::sole()->user_id)->not->toBeNull();
});

test('home service requires an address', function () {
    post('/booking', validBookingPayload([
        'service_type' => 'home_service',
        'customer_address' => '',
    ]))->assertInvalid('customer_address');
});

test('booking validation rejects bad input', function (array $payload, string $field) {
    post('/booking', validBookingPayload($payload))->assertInvalid($field);
})->with([
    'no items' => [['items' => []], 'items'],
    'bad service type' => [['service_type' => 'teleport'], 'service_type'],
    'past date' => [['scheduled_date' => Carbon::yesterday()->format('Y-m-d')], 'scheduled_date'],
    'sunday date' => [['scheduled_date' => Carbon::today()->next(Carbon::SUNDAY)->format('Y-m-d')], 'scheduled_date'],
    'bad time slot' => [['scheduled_time' => '11:11 PM'], 'scheduled_time'],
    'missing name' => [['customer_name' => ''], 'customer_name'],
]);

test('the confirmation page renders a known booking', function () {
    $booking = Booking::factory()->create(['reference' => 'LA-SHOW1']);

    get('/booking/LA-SHOW1')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/booking-confirmation')
            ->where('booking.reference', 'LA-SHOW1'));
});

test('an unknown reference 404s', function () {
    get('/booking/LA-NOPE0')->assertNotFound();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter=BookingTest'`
Expected: FAIL — `POST /booking` route missing (405/404).

- [ ] **Step 3: Write the config file**

Save as `config/booking.php`:

```php
<?php

return [
    /*
     * Bookable time slots. Mirrors the TS `TIME_SLOTS` used by the Schedule
     * step (resources/js/lib/booking.ts) — keep the two lists in sync.
     */
    'time_slots' => ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'],

    /*
     * Recipient for the "new booking" staff notification.
     */
    'notification_email' => env('BOOKING_NOTIFICATION_EMAIL', 'bookings@ledion.test'),
];
```

- [ ] **Step 4: Write the NotSunday rule**

Save as `app/Rules/NotSunday.php`:

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Carbon;

class NotSunday implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (Carbon::parse($value)->isSunday()) {
            $fail('We are closed on Sundays. Please pick another day.');
        }
    }
}
```

- [ ] **Step 5: Write the form request**

Save as `app/Http/Requests/StoreBookingRequest.php`:

```php
<?php

namespace App\Http\Requests;

use App\Rules\NotSunday;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'service_type' => ['required', Rule::in(['in_shop', 'home_service'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.kind' => ['required', Rule::in(['service', 'bundle'])],
            'items.*.slug' => ['required', 'string'],
            'items.*.title' => ['required', 'string'],
            'items.*.price' => ['required', 'string'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today', new NotSunday],
            'scheduled_time' => ['required', Rule::in(config('booking.time_slots'))],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'customer_address' => ['nullable', 'required_if:service_type,home_service', 'string', 'max:500'],
            'car_year' => ['required', 'string', 'max:10'],
            'car_make' => ['required', 'string', 'max:100'],
            'car_model' => ['required', 'string', 'max:100'],
        ];
    }
}
```

- [ ] **Step 6: Write the controller**

Save as `app/Http/Controllers/BookingController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Notifications\NewBookingNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('site/booking');
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $total = collect($data['items'])
            ->sum(fn (array $item): int => $this->parsePrice($item['price']));

        $booking = Booking::create([
            ...$data,
            'reference' => Booking::generateUniqueReference(),
            'user_id' => $request->user()?->id,
            'status' => 'pending',
            'estimated_total' => $total,
        ]);

        Mail::to($booking->customer_email)->send(new BookingConfirmationMail($booking));
        Notification::route('mail', config('booking.notification_email'))
            ->notify(new NewBookingNotification($booking));

        return to_route('booking.show', $booking);
    }

    public function show(Booking $booking): Response
    {
        return Inertia::render('site/booking-confirmation', [
            'booking' => $booking,
        ]);
    }

    /**
     * Strip peso formatting to an integer, e.g. "₱8,000" -> 8000.
     */
    private function parsePrice(string $price): int
    {
        return (int) preg_replace('/[^\d]/', '', $price);
    }
}
```

- [ ] **Step 7: Wire the routes**

In `routes/web.php`, replace the existing placeholder block:

```php
Route::get('/booking', function () {
    return Inertia::render('site/booking');
})->name('booking');
```

with:

```php
Route::get('/booking', [BookingController::class, 'create'])->name('booking');
Route::post('/booking', [BookingController::class, 'store'])->name('booking.store');
Route::get('/booking/{booking:reference}', [BookingController::class, 'show'])->name('booking.show');
```

Add the import at the top of `routes/web.php` (next to the existing `use` lines):

```php
use App\Http\Controllers\BookingController;
```

(`use Inertia\Inertia;` stays — it's still used by other routes.)

- [ ] **Step 8: Generate Wayfinder helpers**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan wayfinder:generate'`
Expected: regenerates `resources/js/actions/App/Http/Controllers/BookingController.ts` (so `BookingController.store.url()` resolves in Task 7).

- [ ] **Step 9: Update the old SitePagesTest expectation**

`tests/Feature/SitePagesTest.php` still asserts a "placeholder page". Replace its second test with:

```php
test('the booking page renders', function () {
    get('/booking')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('site/booking'));
});
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter="BookingTest|SitePagesTest"'`
Expected: PASS. `BookingTest` covers store+reference+total+redirect+dispatch, the six validation rows, home-service address, confirmation show, and the 404.

- [ ] **Step 11: Pint + commit**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php vendor/bin/pint --dirty --format agent'`

```bash
git add config/booking.php app/Rules/NotSunday.php app/Http/Requests/StoreBookingRequest.php app/Http/Controllers/BookingController.php routes/web.php tests/Feature/BookingTest.php tests/Feature/SitePagesTest.php
git commit -m "feat: add booking submission backend with confirmation"
```

---

### Task 4: Admin bookings backend — list + detail (TDD)

**Files:**
- Create: `app/Http/Controllers/Admin/BookingController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Admin/BookingIndexTest.php`

**Interfaces:**
- Produces: named routes `bookings.index` (`GET /bookings`), `bookings.show` (`GET /bookings/{booking}`), both behind `auth`+`verified`; Wayfinder helper `@/routes/bookings` (`index`, `show`) consumed by Task 9. `bookings/index` receives `bookings` (a length-aware paginator of `Booking`); `bookings/show` receives `booking: Booking`.

- [ ] **Step 1: Write the failing test**

Save as `tests/Feature/Admin/BookingIndexTest.php`:

```php
<?php

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

test('guests cannot see the admin bookings list', function () {
    get('/bookings')->assertRedirect('/login');
});

test('a verified user sees the bookings list', function () {
    Booking::factory()->create(['reference' => 'LA-ADM01']);

    actingAs(User::factory()->create())
        ->get('/bookings')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('bookings/index')
            ->has('bookings.data', 1)
            ->where('bookings.data.0.reference', 'LA-ADM01'));
});

test('a verified user can view a single booking', function () {
    $booking = Booking::factory()->create(['reference' => 'LA-ADM02']);

    actingAs(User::factory()->create())
        ->get('/bookings/'.$booking->id)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('bookings/show')
            ->where('booking.reference', 'LA-ADM02'));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter=BookingIndexTest'`
Expected: FAIL — routes missing.

- [ ] **Step 3: Write the admin controller**

Save as `app/Http/Controllers/Admin/BookingController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('bookings/index', [
            'bookings' => Booking::query()->latest()->paginate(20),
        ]);
    }

    public function show(Booking $booking): Response
    {
        return Inertia::render('bookings/show', [
            'booking' => $booking,
        ]);
    }
}
```

- [ ] **Step 4: Add the admin routes**

In `routes/web.php`, add inside the existing `Route::middleware(['auth', 'verified'])->group(function () { ... });` block (alongside the `dashboard` route):

```php
Route::get('/bookings', [\App\Http\Controllers\Admin\BookingController::class, 'index'])->name('bookings.index');
Route::get('/bookings/{booking}', [\App\Http\Controllers\Admin\BookingController::class, 'show'])->name('bookings.show');
```

- [ ] **Step 5: Generate Wayfinder helpers**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan wayfinder:generate'`
Expected: regenerates `resources/js/routes/bookings/index.ts` so `import { index, show } from '@/routes/bookings'` resolves (Task 9).

- [ ] **Step 6: Run the tests to verify they pass**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter=BookingIndexTest'`
Expected: PASS (3 tests).

- [ ] **Step 7: Pint + commit**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php vendor/bin/pint --dirty --format agent'`

```bash
git add app/Http/Controllers/Admin/BookingController.php routes/web.php tests/Feature/Admin/BookingIndexTest.php
git commit -m "feat: add admin bookings list and detail backend"
```

---

### Task 5: Add the shadcn `Calendar` component (+ react-day-picker)

**Files:**
- Create: `resources/js/components/ui/calendar.tsx`
- Modify: `package.json` / `package-lock.json` (react-day-picker added by the CLI)

**Interfaces:**
- Produces: `Calendar` from `@/components/ui/calendar` (consumed by Task 7's schedule step).

- [ ] **Step 1: Generate the component**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npx shadcn@latest add calendar --yes'`
Expected: creates `resources/js/components/ui/calendar.tsx` and installs `react-day-picker` (+ `date-fns` if pulled). If the CLI reports a missing `button` dependency it will reuse the existing one.

- [ ] **Step 2: Verify the build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS. Confirm `resources/js/components/ui/calendar.tsx` exists and exports `Calendar`, and that `react-day-picker` now appears in `package.json` dependencies.

- [ ] **Step 3: Commit**

```bash
git add resources/js/components/ui/calendar.tsx package.json package-lock.json
git commit -m "chore: add shadcn calendar component (react-day-picker)"
```

---

### Task 6: Port the booking domain module (`lib/booking.ts`)

**Files:**
- Create: `resources/js/lib/booking.ts`

**Interfaces:**
- Produces: types `ServiceType`, `CartItemKind`, `CartItem`, `CustomerInfo`, `CarInfo`, `BookingState`, `BookingRecord`; consts `SERVICE_TYPE_LABELS`, `TIME_SLOTS`; helpers `emptyBookingState()`, `parsePrice()`, `formatPeso()`, `cartTotal()`, `isItemSelected()`, `formatDateInput()`. Consumed by Tasks 7, 8, 9. (No `generateReference` — the server owns it.)

- [ ] **Step 1: Write the module**

Save as `resources/js/lib/booking.ts`:

```ts
export type ServiceType = 'in_shop' | 'home_service';

export type CartItemKind = 'service' | 'bundle';

export type CartItem = {
    kind: CartItemKind;
    slug: string;
    title: string;
    /** Display price string, e.g. "₱8,000". */
    price: string;
};

export type CustomerInfo = {
    fullName: string;
    email: string;
    phone: string;
    /** Required only for home service. */
    address: string;
};

export type CarInfo = {
    year: string;
    make: string;
    model: string;
};

export type BookingState = {
    serviceType: ServiceType | null;
    items: CartItem[];
    date: Date | null;
    timeSlot: string | null;
    customer: CustomerInfo;
    car: CarInfo;
};

/** A persisted booking as returned by the server (see App\Models\Booking). */
export type BookingRecord = {
    id: number;
    reference: string;
    service_type: ServiceType;
    status: string;
    scheduled_date: string; // "Y-m-d"
    scheduled_time: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string | null;
    car_year: string;
    car_make: string;
    car_model: string;
    items: CartItem[];
    estimated_total: number;
    created_at: string;
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
    in_shop: 'In-Shop Service',
    home_service: 'Home Service',
};

export const TIME_SLOTS = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '01:30 PM',
    '03:00 PM',
    '04:30 PM',
] as const;

export function emptyBookingState(): BookingState {
    return {
        serviceType: null,
        items: [],
        date: null,
        timeSlot: null,
        customer: { fullName: '', email: '', phone: '', address: '' },
        car: { year: '', make: '', model: '' },
    };
}

/** Strip the currency formatting to a number, e.g. "₱8,000" -> 8000. */
export function parsePrice(price: string): number {
    const digits = price.replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
}

export function formatPeso(amount: number): string {
    return `₱${amount.toLocaleString('en-PH')}`;
}

/** Sum of the selected items' starting prices (an estimate). */
export function cartTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + parsePrice(item.price), 0);
}

export function isItemSelected(items: CartItem[], kind: CartItemKind, slug: string): boolean {
    return items.some((item) => item.kind === kind && item.slug === slug);
}

/** Serialize a Date to a local "Y-m-d" string for the server payload. */
export function formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
```

- [ ] **Step 2: Verify the build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add resources/js/lib/booking.ts
git commit -m "feat: add booking domain module (types + helpers)"
```

---

### Task 7: Port the stepper + step components

**Files:**
- Create: `resources/js/components/site/booking/step-indicator.tsx`
- Create: `resources/js/components/site/booking/steps/service-type-step.tsx`
- Create: `resources/js/components/site/booking/steps/service-step.tsx`
- Create: `resources/js/components/site/booking/steps/schedule-step.tsx`
- Create: `resources/js/components/site/booking/steps/details-step.tsx`
- Create: `resources/js/components/site/booking/steps/review-step.tsx`
- Create: `resources/js/components/site/booking/booking-stepper.tsx`

**Interfaces:**
- Consumes: `@/lib/booking` (Task 6), `@/lib/services` (existing), `@/components/ui/{button,badge,card,input,label,calendar}`, `@/lib/utils` `cn`, `router` from `@inertiajs/react`, `@/actions/App/Http/Controllers/BookingController` (Task 3), `lucide-react`.
- Produces: `BookingStepper` (default-less named export) consumed by Task 8.

- [ ] **Step 1: `StepIndicator`** (renamed from source `Stepper`)

Save as `resources/js/components/site/booking/step-indicator.tsx`:

```tsx
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

type StepIndicatorProps = {
    steps: string[];
    current: number;
};

export function StepIndicator({ steps, current }: StepIndicatorProps) {
    return (
        <ol className="flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((label, index) => {
                const status = index < current ? 'done' : index === current ? 'active' : 'upcoming';
                return (
                    <li key={label} className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                                    status === 'done' && 'border-primary bg-primary text-primary-foreground',
                                    status === 'active' && 'border-primary text-primary',
                                    status === 'upcoming' && 'border-border text-muted-foreground',
                                )}
                                aria-current={status === 'active' ? 'step' : undefined}
                            >
                                {status === 'done' ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                            </span>
                            <span
                                className={cn(
                                    'hidden text-sm font-medium sm:inline',
                                    status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                                )}
                            >
                                {label}
                            </span>
                        </div>
                        {index < steps.length - 1 && <span className="h-px w-6 bg-border sm:w-10" aria-hidden="true" />}
                    </li>
                );
            })}
        </ol>
    );
}
```

- [ ] **Step 2: `ServiceTypeStep`**

Save as `resources/js/components/site/booking/steps/service-type-step.tsx`:

```tsx
import { Home, Store } from 'lucide-react';

import { cn } from '@/lib/utils';
import { type ServiceType } from '@/lib/booking';

const OPTIONS: { value: ServiceType; title: string; description: string; icon: typeof Store }[] = [
    { value: 'in_shop', title: 'In-Shop Service', description: 'Bring your car to our fully equipped studio.', icon: Store },
    { value: 'home_service', title: 'Home Service', description: 'Our mobile team comes to your location.', icon: Home },
];

type Props = {
    value: ServiceType | null;
    onChange: (value: ServiceType) => void;
};

export function ServiceTypeStep({ value, onChange }: Props) {
    return (
        <fieldset>
            <legend className="text-xl font-semibold tracking-tight">How would you like to be served?</legend>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {OPTIONS.map(({ value: optionValue, title, description, icon: Icon }) => {
                    const selected = value === optionValue;
                    return (
                        <button
                            key={optionValue}
                            type="button"
                            onClick={() => onChange(optionValue)}
                            aria-pressed={selected}
                            className={cn(
                                'flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
                                selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                            )}
                        >
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Icon className="size-6" />
                            </div>
                            <div>
                                <p className="font-medium">{title}</p>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
```

- [ ] **Step 3: `ServiceStep`**

Save as `resources/js/components/site/booking/steps/service-step.tsx`:

```tsx
import { Check, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BUNDLES, CATEGORIES, getServicesByCategory } from '@/lib/services';
import { cartTotal, formatPeso, isItemSelected, type CartItem } from '@/lib/booking';

type Props = {
    items: CartItem[];
    onToggle: (item: CartItem) => void;
};

function SelectableRow({
    selected,
    title,
    subtitle,
    price,
    onToggle,
}: {
    selected: boolean;
    title: string;
    subtitle: string;
    price: string;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            className={cn(
                'flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
                selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            )}
        >
            <div className="min-w-0">
                <p className="font-medium">{title}</p>
                <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-medium">From {price}</span>
                <span
                    className={cn(
                        'flex size-7 items-center justify-center rounded-full border',
                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
                    )}
                >
                    {selected ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                </span>
            </div>
        </button>
    );
}

export function ServiceStep({ items, onToggle }: Props) {
    const total = cartTotal(items);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Choose your services</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add one or more services and bundles. Final price is confirmed based on your vehicle.
                </p>
            </div>

            <section>
                <h3 className="text-sm font-medium text-muted-foreground">Bundles</h3>
                <div className="mt-3 flex flex-col gap-3">
                    {BUNDLES.map((bundle) => (
                        <SelectableRow
                            key={bundle.slug}
                            selected={isItemSelected(items, 'bundle', bundle.slug)}
                            title={bundle.name}
                            subtitle={bundle.description}
                            price={bundle.price}
                            onToggle={() => onToggle({ kind: 'bundle', slug: bundle.slug, title: bundle.name, price: bundle.price })}
                        />
                    ))}
                </div>
            </section>

            {CATEGORIES.map((category) => (
                <section key={category.id}>
                    <h3 className="text-sm font-medium text-muted-foreground">{category.label}</h3>
                    <div className="mt-3 flex flex-col gap-3">
                        {getServicesByCategory(category.id).map((service) => (
                            <SelectableRow
                                key={service.slug}
                                selected={isItemSelected(items, 'service', service.slug)}
                                title={service.title}
                                subtitle={service.tagline}
                                price={service.pricing.from}
                                onToggle={() =>
                                    onToggle({ kind: 'service', slug: service.slug, title: service.title, price: service.pricing.from })
                                }
                            />
                        ))}
                    </div>
                </section>
            ))}

            <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/95 p-4 backdrop-blur">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{items.length} selected</Badge>
                    <span className="text-sm text-muted-foreground">Estimated from</span>
                </div>
                <span className="text-lg font-semibold">{formatPeso(total)}</span>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: `ScheduleStep`**

Save as `resources/js/components/site/booking/steps/schedule-step.tsx`:

```tsx
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TIME_SLOTS } from '@/lib/booking';

type Props = {
    date: Date | null;
    timeSlot: string | null;
    onDateChange: (date: Date | undefined) => void;
    onSlotChange: (slot: string) => void;
};

export function ScheduleStep({ date, timeSlot, onDateChange, onSlotChange }: Props) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl">Date &amp; time</CardTitle>
                <CardDescription>We&apos;re open Monday–Saturday. Sundays and past dates are unavailable.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="rounded-md border border-border p-3">
                        <p className="mb-3 text-sm font-medium">Select a date</p>
                        <Calendar
                            mode="single"
                            selected={date ?? undefined}
                            onSelect={onDateChange}
                            disabled={[{ before: today }, { dayOfWeek: [0] }]}
                            className="w-full"
                        />
                    </div>

                    <div className="rounded-md border border-border p-4">
                        <p className="text-sm font-medium">Select a time</p>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            {TIME_SLOTS.map((slot) => {
                                const selected = timeSlot === slot;
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => onSlotChange(slot)}
                                        disabled={!date}
                                        aria-pressed={selected}
                                        className={cn(
                                            'rounded-md border p-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
                                            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50',
                                        )}
                                    >
                                        {slot}
                                    </button>
                                );
                            })}
                        </div>
                        {!date && <p className="mt-3 text-sm text-muted-foreground">Select a date first.</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
```

- [ ] **Step 5: `DetailsStep`** (source typo `border border-bord` removed)

Save as `resources/js/components/site/booking/steps/details-step.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type CarInfo, type CustomerInfo, type ServiceType } from '@/lib/booking';

type Props = {
    serviceType: ServiceType | null;
    customer: CustomerInfo;
    car: CarInfo;
    onCustomerChange: (patch: Partial<CustomerInfo>) => void;
    onCarChange: (patch: Partial<CarInfo>) => void;
};

export function DetailsStep({ serviceType, customer, car, onCustomerChange, onCarChange }: Props) {
    const isHome = serviceType === 'home_service';

    return (
        <div className="flex flex-col gap-6">
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-xl">Your details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="fullName">Full name</Label>
                            <Input
                                id="fullName"
                                value={customer.fullName}
                                onChange={(event) => onCustomerChange({ fullName: event.target.value })}
                                placeholder="Jane Doe"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Phone number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={customer.phone}
                                onChange={(event) => onCustomerChange({ phone: event.target.value })}
                                placeholder="0917 123 4567"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={customer.email}
                                onChange={(event) => onCustomerChange({ email: event.target.value })}
                                placeholder="jane@example.com"
                                required
                            />
                        </div>
                        {isHome && (
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor="address">Service address</Label>
                                <Input
                                    id="address"
                                    value={customer.address}
                                    onChange={(event) => onCustomerChange({ address: event.target.value })}
                                    placeholder="Where should we come to?"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-xl">Vehicle details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                inputMode="numeric"
                                value={car.year}
                                onChange={(event) => onCarChange({ year: event.target.value })}
                                placeholder="2020"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="make">Make</Label>
                            <Input
                                id="make"
                                value={car.make}
                                onChange={(event) => onCarChange({ make: event.target.value })}
                                placeholder="Toyota"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                value={car.model}
                                onChange={(event) => onCarChange({ model: event.target.value })}
                                placeholder="Vios"
                                required
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
```

- [ ] **Step 6: `ReviewStep`**

Save as `resources/js/components/site/booking/steps/review-step.tsx`:

```tsx
import { cartTotal, formatPeso, SERVICE_TYPE_LABELS, type BookingState } from '@/lib/booking';

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-1 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="mt-3">{children}</div>
        </div>
    );
}

export function ReviewStep({ state }: { state: BookingState }) {
    const { serviceType, items, date, timeSlot, customer, car } = state;
    const dateLabel = date
        ? date.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold tracking-tight">Review your booking</h2>

            <Block title="Service type">
                <p className="font-medium">{serviceType ? SERVICE_TYPE_LABELS[serviceType] : '—'}</p>
            </Block>

            <Block title="Services">
                <ul className="flex flex-col gap-1">
                    {items.map((item) => (
                        <li key={`${item.kind}-${item.slug}`} className="flex justify-between gap-4 text-sm">
                            <span>
                                {item.title}
                                {item.kind === 'bundle' ? ' (bundle)' : ''}
                            </span>
                            <span className="font-medium">From {item.price}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Estimated total</span>
                    <span className="font-semibold">{formatPeso(cartTotal(items))}</span>
                </div>
            </Block>

            <Block title="Schedule">
                <Row label="Date" value={dateLabel} />
                <Row label="Time" value={timeSlot ?? '—'} />
            </Block>

            <Block title="Your details">
                <Row label="Name" value={customer.fullName} />
                <Row label="Email" value={customer.email} />
                <Row label="Phone" value={customer.phone} />
                {serviceType === 'home_service' && <Row label="Address" value={customer.address} />}
            </Block>

            <Block title="Vehicle">
                <Row label="Vehicle" value={`${car.year} ${car.make} ${car.model}`.trim()} />
            </Block>

            <p className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                Payment is collected in-shop, or handed to our team after your home service. No payment is required now.
            </p>
        </div>
    );
}
```

- [ ] **Step 7: `BookingStepper`** (orchestrator; Inertia submit replaces the fake reference)

Save as `resources/js/components/site/booking/booking-stepper.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';

import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import BookingController from '@/actions/App/Http/Controllers/BookingController';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/site/booking/step-indicator';
import { ServiceTypeStep } from '@/components/site/booking/steps/service-type-step';
import { ServiceStep } from '@/components/site/booking/steps/service-step';
import { ScheduleStep } from '@/components/site/booking/steps/schedule-step';
import { DetailsStep } from '@/components/site/booking/steps/details-step';
import { ReviewStep } from '@/components/site/booking/steps/review-step';
import {
    emptyBookingState,
    formatDateInput,
    isItemSelected,
    type BookingState,
    type CarInfo,
    type CartItem,
    type CustomerInfo,
} from '@/lib/booking';

const STEPS = ['Type', 'Service', 'Schedule', 'Details', 'Review'];

function isStepValid(step: number, state: BookingState): boolean {
    switch (step) {
        case 0:
            return state.serviceType !== null;
        case 1:
            return state.items.length > 0;
        case 2:
            return state.date !== null && state.timeSlot !== null;
        case 3: {
            const { fullName, email, phone, address } = state.customer;
            const { year, make, model } = state.car;
            const baseValid =
                fullName.trim() !== '' &&
                email.includes('@') &&
                phone.trim() !== '' &&
                year.trim() !== '' &&
                make.trim() !== '' &&
                model.trim() !== '';
            const addressValid = state.serviceType === 'home_service' ? address.trim() !== '' : true;
            return baseValid && addressValid;
        }
        default:
            return true;
    }
}

export function BookingStepper() {
    const [state, setState] = useState<BookingState>(emptyBookingState);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const topRef = useRef<HTMLDivElement>(null);

    const canProceed = isStepValid(step, state);

    // Scroll to the top of the stepper AFTER the new step renders. Skip first mount.
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const id = requestAnimationFrame(() => {
            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return () => cancelAnimationFrame(id);
    }, [step]);

    function toggleItem(item: CartItem) {
        setState((prev) => ({
            ...prev,
            items: isItemSelected(prev.items, item.kind, item.slug)
                ? prev.items.filter((existing) => !(existing.kind === item.kind && existing.slug === item.slug))
                : [...prev.items, item],
        }));
    }

    function updateCustomer(patch: Partial<CustomerInfo>) {
        setState((prev) => ({ ...prev, customer: { ...prev.customer, ...patch } }));
    }

    function updateCar(patch: Partial<CarInfo>) {
        setState((prev) => ({ ...prev, car: { ...prev.car, ...patch } }));
    }

    function next() {
        if (canProceed) {
            setStep((current) => Math.min(current + 1, STEPS.length - 1));
        }
    }

    function back() {
        setStep((current) => Math.max(current - 1, 0));
    }

    function submit() {
        if (!canProceed || submitting) {
            return;
        }
        setSubmitError(null);
        router.post(
            BookingController.store.url(),
            {
                service_type: state.serviceType,
                items: state.items,
                scheduled_date: state.date ? formatDateInput(state.date) : null,
                scheduled_time: state.timeSlot,
                customer_name: state.customer.fullName,
                customer_email: state.customer.email,
                customer_phone: state.customer.phone,
                customer_address: state.customer.address,
                car_year: state.car.year,
                car_make: state.car.make,
                car_model: state.car.model,
            },
            {
                onStart: () => setSubmitting(true),
                onFinish: () => setSubmitting(false),
                onError: () => setSubmitError('Something went wrong. Please review your details and try again.'),
            },
        );
    }

    return (
        <div ref={topRef} className="scroll-mt-24">
            <div className="flex flex-col gap-10">
                <StepIndicator steps={STEPS} current={step} />

                <div>
                    {step === 0 && (
                        <ServiceTypeStep
                            value={state.serviceType}
                            onChange={(serviceType) => setState((prev) => ({ ...prev, serviceType }))}
                        />
                    )}
                    {step === 1 && <ServiceStep items={state.items} onToggle={toggleItem} />}
                    {step === 2 && (
                        <ScheduleStep
                            date={state.date}
                            timeSlot={state.timeSlot}
                            onDateChange={(date) => setState((prev) => ({ ...prev, date: date ?? null }))}
                            onSlotChange={(timeSlot) => setState((prev) => ({ ...prev, timeSlot }))}
                        />
                    )}
                    {step === 3 && (
                        <DetailsStep
                            serviceType={state.serviceType}
                            customer={state.customer}
                            car={state.car}
                            onCustomerChange={updateCustomer}
                            onCarChange={updateCar}
                        />
                    )}
                    {step === 4 && <ReviewStep state={state} />}
                </div>

                {submitError && <p className="text-sm text-destructive">{submitError}</p>}

                <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
                    <Button variant="outline" onClick={back} disabled={step === 0 || submitting}>
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                        <Button onClick={next} disabled={!canProceed}>
                            Next
                            <ArrowRight className="size-4" />
                        </Button>
                    ) : (
                        <Button onClick={submit} disabled={submitting}>
                            {submitting ? 'Confirming…' : 'Confirm booking'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 8: Verify the build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS. (`BookingController.store.url()` resolves from the Task 3 Wayfinder generation; `Calendar` from Task 5; `@/lib/booking` from Task 6.)

- [ ] **Step 9: Commit**

```bash
git add resources/js/components/site/booking
git commit -m "feat: port booking stepper and step components"
```

---

### Task 8: Booking page + confirmation page

**Files:**
- Modify: `resources/js/pages/site/booking.tsx` (overwrite the placeholder)
- Create: `resources/js/pages/site/booking-confirmation.tsx`

**Interfaces:**
- Consumes: `BookingStepper` (Task 7), `PageHeader` from `@/components/site/landing/page-header`, `@/lib/booking` (`BookingRecord`, `SERVICE_TYPE_LABELS`, `formatPeso`), `Head`/`Link` from `@inertiajs/react`, `booking` from `@/routes`, `home` from `@/routes`, `Button`, `CheckCircle2` from `lucide-react`.
- The confirmation page receives `booking: BookingRecord` from `BookingController@show`.

- [ ] **Step 1: Booking page (overwrite placeholder)**

Replace `resources/js/pages/site/booking.tsx` with:

```tsx
import { Head } from '@inertiajs/react';

import { BookingStepper } from '@/components/site/booking/booking-stepper';
import { PageHeader } from '@/components/site/landing/page-header';

export default function Booking() {
    return (
        <>
            <Head title="Book an Appointment — Ledion Autocare" />
            <main>
                <PageHeader
                    title="Book an Appointment"
                    description="In-shop or home service — pick your services, choose a time, and you're set."
                />
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                    <BookingStepper />
                </div>
            </main>
        </>
    );
}
```

- [ ] **Step 2: Confirmation page**

Save as `resources/js/pages/site/booking-confirmation.tsx`:

```tsx
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { booking, home } from '@/routes';
import { formatPeso, SERVICE_TYPE_LABELS, type BookingRecord } from '@/lib/booking';

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

export default function BookingConfirmation({ booking: record }: { booking: BookingRecord }) {
    // scheduled_date is a "Y-m-d" string; anchor to local noon to avoid TZ drift.
    const dateLabel = new Date(`${record.scheduled_date}T12:00:00`).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <Head title="Booking confirmed — Ledion Autocare" />
            <main className="mx-auto flex min-h-[70svh] max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
                <CheckCircle2 className="size-14 text-primary" aria-hidden="true" />
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Booking confirmed!</h1>
                <p className="text-muted-foreground">
                    Thanks for booking with Ledion Autocare. We&apos;ll be in touch to confirm the details, and a
                    confirmation email is on its way.
                </p>

                <div className="w-full rounded-2xl border border-border p-5 text-left text-sm">
                    <Row label="Reference" value={record.reference} />
                    <Row label="Service type" value={SERVICE_TYPE_LABELS[record.service_type]} />
                    <Row label="Schedule" value={`${dateLabel} · ${record.scheduled_time}`} />
                    <div className="mt-2 border-t border-border pt-2">
                        <Row label="Estimated total" value={formatPeso(record.estimated_total)} />
                    </div>
                </div>

                <p className="text-sm text-muted-foreground">
                    Payment is collected in-shop, or handed to our team after your home service.
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline">
                        <Link href={booking().url}>Book another</Link>
                    </Button>
                    <Button asChild>
                        <Link href={home().url}>Back to home</Link>
                    </Button>
                </div>
            </main>
        </>
    );
}
```

- [ ] **Step 3: Verify the build + the full booking feature test with pages present**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter="BookingTest|SitePagesTest"'`
Expected: PASS — the `site/booking` and `site/booking-confirmation` components now resolve.

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/site/booking.tsx resources/js/pages/site/booking-confirmation.tsx
git commit -m "feat: wire booking stepper page and confirmation page"
```

---

### Task 9: Admin bookings pages + sidebar link

**Files:**
- Create: `resources/js/pages/bookings/index.tsx`
- Create: `resources/js/pages/bookings/show.tsx`
- Modify: `resources/js/components/app-sidebar.tsx`

**Interfaces:**
- Consumes: `AppLayout` via the `Page.layout = { breadcrumbs }` convention (see `resources/js/pages/dashboard.tsx`); `index`/`show` from `@/routes/bookings` (Task 4); `@/lib/booking` (`BookingRecord`, `SERVICE_TYPE_LABELS`, `formatPeso`); `Head`/`Link` from `@inertiajs/react`; `Badge`, `Button`; `NavItem` type + `CalendarCheck` icon for the sidebar.
- `index` receives `bookings` = a paginator `{ data: BookingRecord[]; links: {...}[]; ... }`; `show` receives `booking: BookingRecord`.

- [ ] **Step 1: Admin index page**

Save as `resources/js/pages/bookings/index.tsx`:

```tsx
import { Head, Link } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import { show } from '@/routes/bookings';
import { formatPeso, SERVICE_TYPE_LABELS, type BookingRecord } from '@/lib/booking';

type Paginator<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

export default function BookingsIndex({ bookings }: { bookings: Paginator<BookingRecord> }) {
    return (
        <>
            <Head title="Bookings" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>

                {bookings.data.length === 0 ? (
                    <p className="text-muted-foreground">No bookings yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                                <tr>
                                    <th className="p-3 font-medium">Reference</th>
                                    <th className="p-3 font-medium">Schedule</th>
                                    <th className="p-3 font-medium">Customer</th>
                                    <th className="p-3 font-medium">Type</th>
                                    <th className="p-3 text-right font-medium">Est. total</th>
                                    <th className="p-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.data.map((record) => (
                                    <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                        <td className="p-3 font-medium">
                                            <Link href={show(record.id).url} className="hover:text-primary">
                                                {record.reference}
                                            </Link>
                                        </td>
                                        <td className="p-3">
                                            {record.scheduled_date} · {record.scheduled_time}
                                        </td>
                                        <td className="p-3">{record.customer_name}</td>
                                        <td className="p-3">{SERVICE_TYPE_LABELS[record.service_type]}</td>
                                        <td className="p-3 text-right">{formatPeso(record.estimated_total)}</td>
                                        <td className="p-3">
                                            <Badge variant="secondary">{record.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {bookings.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {bookings.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                className={`rounded-md border px-3 py-1 text-sm ${
                                    link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                                } ${link.url ? '' : 'pointer-events-none opacity-50'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

BookingsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Bookings', href: '/bookings' },
    ],
};
```

- [ ] **Step 2: Admin detail page**

Save as `resources/js/pages/bookings/show.tsx`:

```tsx
import { Head } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import { index } from '@/routes/bookings';
import { formatPeso, SERVICE_TYPE_LABELS, type BookingRecord } from '@/lib/booking';

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
            <span className="text-sm">{value || '—'}</span>
        </div>
    );
}

export default function BookingShow({ booking }: { booking: BookingRecord }) {
    return (
        <>
            <Head title={`Booking ${booking.reference}`} />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{booking.reference}</h1>
                    <Badge variant="secondary">{booking.status}</Badge>
                </div>

                <div className="grid gap-6 rounded-xl border border-border p-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Service type" value={SERVICE_TYPE_LABELS[booking.service_type]} />
                    <Field label="Date" value={booking.scheduled_date} />
                    <Field label="Time" value={booking.scheduled_time} />
                    <Field label="Customer" value={booking.customer_name} />
                    <Field label="Email" value={booking.customer_email} />
                    <Field label="Phone" value={booking.customer_phone} />
                    <Field label="Address" value={booking.customer_address ?? ''} />
                    <Field label="Vehicle" value={`${booking.car_year} ${booking.car_make} ${booking.car_model}`.trim()} />
                    <Field label="Estimated total" value={formatPeso(booking.estimated_total)} />
                </div>

                <div className="rounded-xl border border-border p-5">
                    <h2 className="text-sm font-medium text-muted-foreground">Services</h2>
                    <ul className="mt-3 flex flex-col gap-1">
                        {booking.items.map((item) => (
                            <li key={`${item.kind}-${item.slug}`} className="flex justify-between gap-4 text-sm">
                                <span>
                                    {item.title}
                                    {item.kind === 'bundle' ? ' (bundle)' : ''}
                                </span>
                                <span className="font-medium">From {item.price}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

BookingShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Bookings', href: index().url },
    ],
};
```

- [ ] **Step 3: Add the sidebar nav link**

In `resources/js/components/app-sidebar.tsx`, add the `index` route import and a `CalendarCheck` icon, then add an item to `mainNavItems`. The import block already imports `dashboard` from `@/routes`; add:

```ts
import { index as bookingsIndex } from '@/routes/bookings';
```

Add `CalendarCheck` to the existing `lucide-react` import, and add this object to the `mainNavItems` array (after the Dashboard item):

```ts
    {
        title: 'Bookings',
        href: bookingsIndex(),
        icon: CalendarCheck,
    },
```

- [ ] **Step 4: Verify the build + admin tests**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact --filter=BookingIndexTest'`
Expected: PASS — `bookings/index` and `bookings/show` components now resolve.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/bookings resources/js/components/app-sidebar.tsx
git commit -m "feat: add admin bookings pages and sidebar link"
```

---

### Task 10: Full verification + manual-check note

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run build'`
Expected: PASS.

- [ ] **Step 2: Full test suite**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube php artisan test --compact'`
Expected: PASS — all prior tests plus `BookingModelTest`, `BookingNotificationsTest`, `BookingTest`, `Admin/BookingIndexTest` green.

- [ ] **Step 3: Lint (optional but recommended)**

Run: `wsl -d Ubuntu -e bash -lc 'cd ~/projects/ledion-webapp && larakube npm run lint'`
Expected: PASS or only pre-existing warnings. Fix anything introduced by this phase.

- [ ] **Step 4: Manual visual check (human — do NOT perform yourself)**

Note in the report that this is pending. The human should run `larakube composer run dev`, then walk the full flow at `/booking`: pick a service type, add services/bundles, choose a non-Sunday date + time, fill details (test the home-service address requirement), review, and confirm — verifying the redirect to `/booking/LA-XXXXX`, the confirmation content, the queued email (Horizon/Mailpit), and the admin list/detail at `/bookings` in light + dark.

---

## Self-Review Notes

- **Spec coverage:** `bookings` table + `Booking` model + reference generation (Task 1) ✓; queued confirmation email + staff notification (Task 2) ✓; config + NotSunday rule + StoreBookingRequest + public controller (create/store/show) + routes + server-computed total + real 404 (Task 3) ✓; guest flow with optional `user_id` link (Task 3) ✓; admin list + detail behind auth+verified (Task 4) ✓; shadcn Calendar + react-day-picker (Task 5) ✓; `lib/booking.ts` port dropping `generateReference` (Task 6) ✓; `BookingStepper`/`StepIndicator` renames + typo fix + Inertia submit + all five step components (Task 7) ✓; booking page + shareable confirmation page (Task 8) ✓; admin pages + sidebar link (Task 9) ✓; full verification + manual-check note (Task 10) ✓.
- **Build order:** backend routes + Wayfinder generation (Tasks 3, 4) precede every frontend task that imports `@/actions/...BookingController` or `@/routes/bookings` (Tasks 7, 9); Calendar (Task 5) and `lib/booking.ts` (Task 6) precede the components (Task 7). Every frontend task ends with a green `larakube npm run build`.
- **Type consistency:** `BookingState`, `CartItem`, `CustomerInfo`, `CarInfo`, `BookingRecord`, `SERVICE_TYPE_LABELS`, `TIME_SLOTS`, `formatPeso`, `cartTotal`, `isItemSelected`, `formatDateInput`, `emptyBookingState` are defined in Task 6 and consumed with matching signatures in Tasks 7–9. The `router.post` payload keys (`service_type`, `items`, `scheduled_date`, `scheduled_time`, `customer_*`, `car_*`) in Task 7 exactly match `StoreBookingRequest` rules and the `Booking` `$fillable` in Tasks 1 & 3. `CartItem` (`kind`/`slug`/`title`/`price`) matches the JSON snapshot validated by `items.*.*` and stored in the `items` column. The admin `Paginator<BookingRecord>` shape matches Laravel's `paginate()` Inertia serialization asserted in Task 4 (`bookings.data`).
- **Reference & binding:** the public show route binds on `{booking:reference}` (shareable, real 404); the admin routes use default `id` binding (`{booking}`); `getRouteKeyName()` is left default so the two never collide.
- **Trusted snapshot tradeoff:** server validates item *shape* only and recomputes `estimated_total` from submitted prices (Task 3) — documented as a Phase-4 follow-up when services move to Eloquent.
- **No placeholders:** every code step contains complete, runnable code; ported components are transcribed from the source with the agreed renames, the `border border-bord` typo removed, and the confirmation extracted from a step into its own page.
```
