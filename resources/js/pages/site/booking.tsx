import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { home } from '@/routes';

export default function Booking() {
    return (
        <>
            <Head title="Booking" />
            <main className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Booking</h1>
                <p className="text-muted-foreground">
                    Online booking with calendar scheduling is coming soon. Choose in-shop or home service and
                    pick your time — right here.
                </p>
                <Button asChild variant="outline">
                    <Link href={home().url}>Back to home</Link>
                </Button>
            </main>
        </>
    );
}
