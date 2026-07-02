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
