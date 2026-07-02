import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { booking, home } from '@/routes';
import { formatPeso, SERVICE_TYPE_LABELS, type BookingRecord } from '@/lib/booking';

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-1">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

/** Only the fields exposed by the public confirmation endpoint (no customer PII). */
type ConfirmationBooking = Pick<
    BookingRecord,
    'reference' | 'service_type' | 'scheduled_date' | 'scheduled_time' | 'estimated_total'
>;

export default function BookingConfirmation({ booking: record }: { booking: ConfirmationBooking }) {
    // scheduled_date is a "Y-m-d" string; anchor to local noon to avoid TZ drift.
    const dateLabel = new Date(`${record.scheduled_date}T12:00:00`).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <Head title="Booking confirmed — Ledion Autocare" />
            <main className="mx-auto flex min-h-[70svh] max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
                <CheckCircle2 className="size-14 text-primary" aria-hidden="true" />
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Booking confirmed!</h1>
                <p className="text-muted-foreground">
                    Thanks for booking with Ledion Autocare. We&apos;ll be in touch to confirm the details, and a
                    confirmation email is on its way.
                </p>

                <div className="w-full rounded-2xl border border-border p-5 text-left text-sm">
                    <Row label="Reference" value={record.reference} />
                    <Row label="Service type" value={SERVICE_TYPE_LABELS[record.service_type]} />
                    <Row label="Schedule" value={`${dateLabel} · ${record.scheduled_time}`} />
                    <div className="mt-2 border-t border-border pt-2">
                        <Row label="Estimated total" value={formatPeso(record.estimated_total)} />
                    </div>
                </div>

                <p className="text-sm text-muted-foreground">
                    Payment is collected in-shop, or handed to our team after your home service.
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline">
                        <Link href={booking().url}>Book another</Link>
                    </Button>
                    <Button asChild>
                        <Link href={home().url}>Back to home</Link>
                    </Button>
                </div>
            </main>
        </>
    );
}
