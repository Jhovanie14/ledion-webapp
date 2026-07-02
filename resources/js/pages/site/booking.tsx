import { Head } from '@inertiajs/react';

import { BookingStepper } from '@/components/site/booking/booking-stepper';
import { PageHeader } from '@/components/site/landing/page-header';

export default function Booking() {
    return (
        <>
            <Head title="Book an Appointment — Ledion Autocare" />
            <main>
                <PageHeader
                    title="Book an Appointment"
                    description="In-shop or home service — pick your services, choose a time, and you're set."
                />
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                    <BookingStepper />
                </div>
            </main>
        </>
    );
}
