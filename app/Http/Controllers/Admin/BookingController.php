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
