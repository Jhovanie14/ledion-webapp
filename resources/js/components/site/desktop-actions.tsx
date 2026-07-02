import { NavLink } from '@/components/site/nav-link';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { NAV_ITEMS, isCta, isVisible } from '@/lib/navigation';

export function DesktopActions() {
    return (
        <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {NAV_ITEMS.filter((item) => isCta(item) && isVisible(item, 'desktop')).map((item) => (
                <NavLink key={item.href} item={item} />
            ))}
        </div>
    );
}
