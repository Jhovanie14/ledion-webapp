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
