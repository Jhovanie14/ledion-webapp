import { Head } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { ContactForm } from '@/components/site/contact-form';
import { ImageSlot } from '@/components/site/landing/image-slot';
import { PageHeader } from '@/components/site/landing/page-header';

const DETAILS = [
    { icon: MapPin, label: 'Address', value: '123 Detailing Ave, Your City' },
    { icon: Phone, label: 'Phone', value: '(555) 012-3456' },
    { icon: Mail, label: 'Email', value: 'hello@ledionautocare.com' },
    { icon: Clock, label: 'Hours', value: 'Mon–Fri 8am–6pm · Sat 9am–4pm' },
];

export default function Contact() {
    return (
        <>
            <Head title="Contact — Ledion Autocare" />
            <main>
                <PageHeader title="Contact Us" description="Questions, quotes, or bookings — we'd love to hear from you." />
                <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
                    <div className="flex flex-col gap-8">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">Get in touch</h2>
                            <ul className="mt-6 flex flex-col gap-5">
                                {DETAILS.map(({ icon: Icon, label, value }) => (
                                    <li key={label} className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon className="size-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{label}</p>
                                            <p className="text-sm text-muted-foreground">{value}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <ImageSlot label="Map" className="aspect-video w-full" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Send a message</h2>
                        <div className="mt-6">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
