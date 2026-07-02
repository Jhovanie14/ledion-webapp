import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

type StepIndicatorProps = {
    steps: string[];
    current: number;
};

export function StepIndicator({ steps, current }: StepIndicatorProps) {
    return (
        <ol className="flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((label, index) => {
                const status = index < current ? 'done' : index === current ? 'active' : 'upcoming';
                return (
                    <li key={label} className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                                    status === 'done' && 'border-primary bg-primary text-primary-foreground',
                                    status === 'active' && 'border-primary text-primary',
                                    status === 'upcoming' && 'border-border text-muted-foreground',
                                )}
                                aria-current={status === 'active' ? 'step' : undefined}
                            >
                                {status === 'done' ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                            </span>
                            <span
                                className={cn(
                                    'hidden text-sm font-medium sm:inline',
                                    status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                                )}
                            >
                                {label}
                            </span>
                        </div>
                        {index < steps.length - 1 && <span className="h-px w-6 bg-border sm:w-10" aria-hidden="true" />}
                    </li>
                );
            })}
        </ol>
    );
}
