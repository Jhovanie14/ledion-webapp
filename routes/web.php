<?php

use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('site/home');
})->name('home');

Route::get('/booking', [BookingController::class, 'create'])->name('booking');
Route::post('/booking', [BookingController::class, 'store'])->name('booking.store');
Route::get('/booking/{booking:reference}', [BookingController::class, 'show'])->name('booking.show');

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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
