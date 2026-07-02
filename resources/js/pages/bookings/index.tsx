import { Head, Link } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import { show } from '@/routes/bookings';
import { formatPeso, SERVICE_TYPE_LABELS, type BookingRecord } from '@/lib/booking';

type Paginator<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

export default function BookingsIndex({ bookings }: { bookings: Paginator<BookingRecord> }) {
    return (
        <>
            <Head title="Bookings" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>

                {bookings.data.length === 0 ? (
                    <p className="text-muted-foreground">No bookings yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                                <tr>
                                    <th className="p-3 font-medium">Reference</th>
                                    <th className="p-3 font-medium">Schedule</th>
                                    <th className="p-3 font-medium">Customer</th>
                                    <th className="p-3 font-medium">Type</th>
                                    <th className="p-3 text-right font-medium">Est. total</th>
                                    <th className="p-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.data.map((record) => (
                                    <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                        <td className="p-3 font-medium">
                                            <Link href={show(record.id).url} className="hover:text-primary">
                                                {record.reference}
                                            </Link>
                                        </td>
                                        <td className="p-3">
                                            {record.scheduled_date} · {record.scheduled_time}
                                        </td>
                                        <td className="p-3">{record.customer_name}</td>
                                        <td className="p-3">{SERVICE_TYPE_LABELS[record.service_type]}</td>
                                        <td className="p-3 text-right">{formatPeso(record.estimated_total)}</td>
                                        <td className="p-3">
                                            <Badge variant="secondary">{record.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {bookings.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {bookings.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                className={`rounded-md border px-3 py-1 text-sm ${
                                    link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                                } ${link.url ? '' : 'pointer-events-none opacity-50'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

BookingsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Bookings', href: '/bookings' },
    ],
};
