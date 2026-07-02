import { cartTotal, formatPeso, SERVICE_TYPE_LABELS, type BookingState } from '@/lib/booking';

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-1 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border p-5">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="mt-3">{children}</div>
        </div>
    );
}

export function ReviewStep({ state }: { state: BookingState }) {
    const { serviceType, items, date, timeSlot, customer, car } = state;
    const dateLabel = date
        ? date.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold tracking-tight">Review your booking</h2>

            <Block title="Service type">
                <p className="font-medium">{serviceType ? SERVICE_TYPE_LABELS[serviceType] : '—'}</p>
            </Block>

            <Block title="Services">
                <ul className="flex flex-col gap-1">
                    {items.map((item) => (
                        <li key={`${item.kind}-${item.slug}`} className="flex justify-between gap-4 text-sm">
                            <span>
                                {item.title}
                                {item.kind === 'bundle' ? ' (bundle)' : ''}
                            </span>
                            <span className="font-medium">From {item.price}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Estimated total</span>
                    <span className="font-semibold">{formatPeso(cartTotal(items))}</span>
                </div>
            </Block>

            <Block title="Schedule">
                <Row label="Date" value={dateLabel} />
                <Row label="Time" value={timeSlot ?? '—'} />
            </Block>

            <Block title="Your details">
                <Row label="Name" value={customer.fullName} />
                <Row label="Email" value={customer.email} />
                <Row label="Phone" value={customer.phone} />
                {serviceType === 'home_service' && <Row label="Address" value={customer.address} />}
            </Block>

            <Block title="Vehicle">
                <Row label="Vehicle" value={`${car.year} ${car.make} ${car.model}`.trim()} />
            </Block>

            <p className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                Payment is collected in-shop, or handed to our team after your home service. No payment is required now.
            </p>
        </div>
    );
}
