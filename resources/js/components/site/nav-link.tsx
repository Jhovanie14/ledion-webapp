import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { SiteNavItem } from '@/lib/navigation';

export type NavLinkProps = {
    item: SiteNavItem;
    /** Called after a click — used to close the mobile sheet. */
    onNavigate?: () => void;
    className?: string;
};

export function NavLink({ item, onNavigate, className }: NavLinkProps) {
    const { href, label, variant = 'link' } = item;
    const { isCurrentOrParentUrl } = useCurrentUrl();

    if (variant === 'cta') {
        return (
            <Button asChild size="lg" className={className} onClick={onNavigate}>
                <Link href={href}>{label}</Link>
            </Button>
        );
    }

    // Active on the linked route or a nested page under it (e.g. /services/detailing).
    const isActive = isCurrentOrParentUrl(href);

    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                isActive && 'text-foreground',
                className,
            )}
        >
            {label}
        </Link>
    );
}
