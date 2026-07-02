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
