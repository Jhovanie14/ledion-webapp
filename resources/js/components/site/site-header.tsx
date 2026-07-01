import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

import { DesktopActions } from '@/components/site/desktop-actions';
import { DesktopNav } from '@/components/site/desktop-nav';
import { MobileNav } from '@/components/site/mobile-nav';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export function SiteHeader() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full transition-colors duration-300',
                scrolled
                    ? 'border-b border-border bg-background/80 backdrop-blur-md'
                    : 'border-b border-transparent bg-transparent',
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 items-center">
                    <Link href={home().url} className="text-lg font-semibold tracking-tight">
                        Ledion<span className="text-primary"> Autocare</span>
                    </Link>
                </div>
                <DesktopNav />
                <div className="flex flex-1 items-center justify-end gap-2">
                    <DesktopActions />
                    <MobileNav />
                </div>
            </div>
        </header>
    );
}
