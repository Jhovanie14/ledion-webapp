import { cn } from '@/lib/utils';

type SectionProps = {
    id?: string;
    className?: string;
    children: React.ReactNode;
} & Pick<React.HTMLAttributes<HTMLElement>, 'aria-labelledby'>;

export function Section({ id, className, children, ...rest }: SectionProps) {
    return (
        <section id={id} className={cn('scroll-mt-16 py-20 lg:py-28', className)} {...rest}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </section>
    );
}
