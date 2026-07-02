<?php

namespace App\Http\Requests;

use App\Rules\NotSunday;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'service_type' => ['required', Rule::in(['in_shop', 'home_service'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.kind' => ['required', Rule::in(['service', 'bundle'])],
            'items.*.slug' => ['required', 'string'],
            'items.*.title' => ['required', 'string'],
            'items.*.price' => ['required', 'string'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today', new NotSunday],
            'scheduled_time' => ['required', Rule::in(config('booking.time_slots'))],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'customer_address' => ['nullable', 'required_if:service_type,home_service', 'string', 'max:500'],
            'car_year' => ['required', 'string', 'max:10'],
            'car_make' => ['required', 'string', 'max:100'],
            'car_model' => ['required', 'string', 'max:100'],
        ];
    }
}
