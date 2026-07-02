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

test('the public confirmation does not expose customer PII', function () {
    Booking::factory()->create([
        'reference' => 'LA-PII01',
        'customer_email' => 'secret@example.com',
        'customer_phone' => '0917 000 0000',
        'customer_address' => '123 Secret St',
    ]);

    get('/booking/LA-PII01')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/booking-confirmation')
            ->where('booking.reference', 'LA-PII01')
            ->missing('booking.customer_email')
            ->missing('booking.customer_phone')
            ->missing('booking.customer_address'));
});

test('an unknown reference 404s', function () {
    get('/booking/LA-NOPE0')->assertNotFound();
});
