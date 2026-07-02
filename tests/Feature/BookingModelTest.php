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
