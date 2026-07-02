import { Home, Store } from 'lucide-react';

import { cn } from '@/lib/utils';
import { type ServiceType } from '@/lib/booking';

const OPTIONS: { value: ServiceType; title: string; description: string; icon: typeof Store }[] = [
    { value: 'in_shop', title: 'In-Shop Service', description: 'Bring your car to our fully equipped studio.', icon: Store },
    { value: 'home_service', title: 'Home Service', description: 'Our mobile team comes to your location.', icon: Home },
];

type Props = {
    value: ServiceType | null;
    onChange: (value: ServiceType) => void;
};

export function ServiceTypeStep({ value, onChange }: Props) {
    return (
        <fieldset>
            <legend className="text-xl font-semibold tracking-tight">How would you like to be served?</legend>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {OPTIONS.map(({ value: optionValue, title, description, icon: Icon }) => {
                    const selected = value === optionValue;
                    return (
                        <button
                            key={optionValue}
                            type="button"
                            onClick={() => onChange(optionValue)}
                            aria-pressed={selected}
                            className={cn(
                                'flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
                                selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                            )}
                        >
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Icon className="size-6" />
                            </div>
                            <div>
                                <p className="font-medium">{title}</p>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
