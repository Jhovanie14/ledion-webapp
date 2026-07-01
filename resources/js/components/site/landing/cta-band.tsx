import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { booking } from '@/routes';

export function CtaBand() {
    return (
        <section aria-labelledby="cta-heading" className="px-4 py-20 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border">
                <ImageSlot
                    src="/assets/cta-image.png"
                    alt="Detailed black luxury car reflected on a wet floor"
                    sizes="(min-width: 1280px) 80rem, 100vw"
                    className="absolute inset-0 size-full rounded-none border-0 bg-background"
                />
                <div
                    className="absolute inset-0 bg-gradient-to-l from-background via-background/80 to-transparent"
                    aria-hidden="true"
                />

                <div className="relative ml-auto flex max-w-xl flex-col items-start gap-6 p-10 sm:p-14 lg:p-20">
                    <h2
                        id="cta-heading"
                        className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                    >
                        Book your luxury car detailing today
                    </h2>
                    <p className="text-muted-foreground">
                        Pick your services, choose a time, and you&rsquo;re set — in-shop or at your door.
                    </p>
                    <Link
                        href={booking().url}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
                    >
                        Book now
                        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
