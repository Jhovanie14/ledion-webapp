import { Link } from '@inertiajs/react';

import { NAV_ITEMS } from '@/lib/navigation';

export function SiteFooter() {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
                <div>
                    <p className="text-lg font-semibold tracking-tight">
                        Ledion<span className="text-primary"> Autocare</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Premium auto detailing, surface protection, and maintenance.
                    </p>
                </div>
                <div>
                    <h3 className="text-sm font-medium">Quick links</h3>
                    <ul className="mt-3 flex flex-col gap-2">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-sm font-medium">Hours</h3>
                    <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                        <li>Mon–Fri: 8am – 6pm</li>
                        <li>Saturday: 9am – 4pm</li>
                        <li>Sunday: Closed</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-border">
                <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
                    © {new Date().getFullYear()} Ledion Autocare. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
