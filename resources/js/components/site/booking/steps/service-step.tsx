import { Check, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BUNDLES, CATEGORIES, getServicesByCategory } from '@/lib/services';
import { cartTotal, formatPeso, isItemSelected, type CartItem } from '@/lib/booking';

type Props = {
    items: CartItem[];
    onToggle: (item: CartItem) => void;
};

function SelectableRow({
    selected,
    title,
    subtitle,
    price,
    onToggle,
}: {
    selected: boolean;
    title: string;
    subtitle: string;
    price: string;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            className={cn(
                'flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
                selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            )}
        >
            <div className="min-w-0">
                <p className="font-medium">{title}</p>
                <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-medium">From {price}</span>
                <span
                    className={cn(
                        'flex size-7 items-center justify-center rounded-full border',
                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
                    )}
                >
                    {selected ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                </span>
            </div>
        </button>
    );
}

export function ServiceStep({ items, onToggle }: Props) {
    const total = cartTotal(items);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Choose your services</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add one or more services and bundles. Final price is confirmed based on your vehicle.
                </p>
            </div>

            <section>
                <h3 className="text-sm font-medium text-muted-foreground">Bundles</h3>
                <div className="mt-3 flex flex-col gap-3">
                    {BUNDLES.map((bundle) => (
                        <SelectableRow
                            key={bundle.slug}
                            selected={isItemSelected(items, 'bundle', bundle.slug)}
                            title={bundle.name}
                            subtitle={bundle.description}
                            price={bundle.price}
                            onToggle={() => onToggle({ kind: 'bundle', slug: bundle.slug, title: bundle.name, price: bundle.price })}
                        />
                    ))}
                </div>
            </section>

            {CATEGORIES.map((category) => (
                <section key={category.id}>
                    <h3 className="text-sm font-medium text-muted-foreground">{category.label}</h3>
                    <div className="mt-3 flex flex-col gap-3">
                        {getServicesByCategory(category.id).map((service) => (
                            <SelectableRow
                                key={service.slug}
                                selected={isItemSelected(items, 'service', service.slug)}
                                title={service.title}
                                subtitle={service.tagline}
                                price={service.pricing.from}
                                onToggle={() =>
                                    onToggle({ kind: 'service', slug: service.slug, title: service.title, price: service.pricing.from })
                                }
                            />
                        ))}
                    </div>
                </section>
            ))}

            <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/95 p-4 backdrop-blur">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{items.length} selected</Badge>
                    <span className="text-sm text-muted-foreground">Estimated from</span>
                </div>
                <span className="text-lg font-semibold">{formatPeso(total)}</span>
            </div>
        </div>
    );
}
