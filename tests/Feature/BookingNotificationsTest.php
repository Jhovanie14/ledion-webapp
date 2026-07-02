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
