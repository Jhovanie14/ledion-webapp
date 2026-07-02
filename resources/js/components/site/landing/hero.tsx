import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { booking } from '@/routes';

export function Hero() {
    return (
        <section className="relative overflow-hidden" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl px-4 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
                <h1
                    id="hero-heading"
                    className="font-heading text-4xl leading-[0.95] font-semibold tracking-tight text-balance uppercase sm:text-5xl lg:text-7xl"
                >
                    Drive with{' '}
                    <span className="bg-gradient-to-r from-muted-foreground to-primary bg-clip-text text-transparent">
                        perfection
                    </span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-lg text-balance text-muted-foreground">
                    Experience the prestige of a professionally detailed car radiating elegance and
                    refinement at every turn.
                </p>
                <div className="mt-8 flex justify-center">
                    <Link
                        href={booking().url}
                        className="group inline-flex items-center gap-2 text-base font-medium text-foreground transition-opacity hover:opacity-75"
                    >
                        Book now
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            </div>

            {/* full-bleed car image — its dark background blends into the page */}
            <div className="relative w-full pb-12">
                <ImageSlot
                    src="/assets/hero-image.png"
                    alt="Silver luxury car detailed to a showroom shine, reflected on a wet floor"
                    priority
                    sizes="100vw"
                    className="aspect-[16/9] w-full rounded-none border-0 bg-background"
                />
            </div>
        </section>
    );
}
