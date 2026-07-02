import { Head } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import { index } from '@/routes/bookings';
import { formatPeso, SERVICE_TYPE_LABELS, type BookingRecord } from '@/lib/booking';

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
            <span className="text-sm">{value || '—'}</span>
        </div>
    );
}

export default function BookingShow({ booking }: { booking: BookingRecord }) {
    return (
        <>
            <Head title={`Booking ${booking.reference}`} />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{booking.reference}</h1>
                    <Badge variant="secondary">{booking.status}</Badge>
                </div>

                <div className="grid gap-6 rounded-xl border border-border p-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Service type" value={SERVICE_TYPE_LABELS[booking.service_type]} />
                    <Field label="Date" value={booking.scheduled_date} />
                    <Field label="Time" value={booking.scheduled_time} />
                    <Field label="Customer" value={booking.customer_name} />
                    <Field label="Email" value={booking.customer_email} />
                    <Field label="Phone" value={booking.customer_phone} />
                    <Field label="Address" value={booking.customer_address ?? ''} />
                    <Field label="Vehicle" value={`${booking.car_year} ${booking.car_make} ${booking.car_model}`.trim()} />
                    <Field label="Estimated total" value={formatPeso(booking.estimated_total)} />
                </div>

                <div className="rounded-xl border border-border p-5">
                    <h2 className="text-sm font-medium text-muted-foreground">Services</h2>
                    <ul className="mt-3 flex flex-col gap-1">
                        {booking.items.map((item) => (
                            <li key={`${item.kind}-${item.slug}`} className="flex justify-between gap-4 text-sm">
                                <span>
                                    {item.title}
                                    {item.kind === 'bundle' ? ' (bundle)' : ''}
                                </span>
                                <span className="font-medium">From {item.price}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

BookingShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Bookings', href: index().url },
    ],
};
