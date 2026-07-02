<x-mail::message>
# Booking confirmed

Thanks for booking with Ledion Autocare, {{ $booking->customer_name }}. We'll be in touch to confirm the details.

**Reference:** {{ $booking->reference }}
**Service type:** {{ $booking->service_type === 'home_service' ? 'Home Service' : 'In-Shop Service' }}
**Schedule:** {{ $booking->scheduled_date->format('F j, Y') }} · {{ $booking->scheduled_time }}

<x-mail::table>
| Service | Estimated |
|:------- | ---------:|
@foreach ($booking->items as $item)
| {{ $item['title'] }}{{ $item['kind'] === 'bundle' ? ' (bundle)' : '' }} | From {{ $item['price'] }} |
@endforeach
</x-mail::table>

**Estimated total:** ₱{{ number_format($booking->estimated_total) }}

Payment is collected in-shop, or handed to our team after your home service. No payment is required now.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
