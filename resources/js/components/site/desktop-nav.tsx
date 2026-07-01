import { NavLink } from '@/components/site/nav-link';
import { NAV_ITEMS, isCta, isVisible } from '@/lib/navigation';

export function DesktopNav() {
    return (
        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex" aria-label="Primary">
            {NAV_ITEMS.filter((item) => !isCta(item) && isVisible(item, 'desktop')).map((item) => (
                <NavLink key={item.href} item={item} />
            ))}
        </nav>
    );
}
