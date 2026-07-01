import { cn } from '@/lib/utils';

/** Uppercase mono label with an accent dot — a structural signpost. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase',
                className,
            )}
        >
            <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
            {children}
        </span>
    );
}
