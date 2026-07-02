<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewBookingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New booking: '.$this->booking->reference)
            ->line($this->booking->customer_name.' booked a '.
                ($this->booking->service_type === 'home_service' ? 'home service' : 'in-shop service').'.')
            ->line('Schedule: '.$this->booking->scheduled_date->format('F j, Y').' · '.$this->booking->scheduled_time)
            ->line('Estimated total: ₱'.number_format($this->booking->estimated_total))
            ->action('View booking', url('/bookings/'.$this->booking->id));
    }
}
