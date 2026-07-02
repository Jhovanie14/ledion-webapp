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
