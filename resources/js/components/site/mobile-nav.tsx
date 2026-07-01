import { useState } from 'react';
import { Menu } from 'lucide-react';

import { NavLink } from '@/components/site/nav-link';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NAV_ITEMS, isCta, isVisible } from '@/lib/navigation';

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open menu">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                    <SheetHeader>
                        <SheetTitle className="text-left">Ledion Autocare</SheetTitle>
                    </SheetHeader>
                    <nav className="mt-6 flex flex-col gap-1 px-4" aria-label="Mobile primary">
                        {NAV_ITEMS.filter((item) => isVisible(item, 'mobile')).map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                onNavigate={close}
                                className={isCta(item) ? 'mt-2 w-full' : 'py-2 text-base'}
                            />
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
