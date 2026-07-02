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
