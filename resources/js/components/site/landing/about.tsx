import { Link } from '@inertiajs/react';
import { ArrowUpRight, Crosshair, Gem, ShieldCheck } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { Section } from '@/components/site/landing/section';
import { booking } from '@/routes';

const FEATURES = [
    { icon: Crosshair, title: 'Precise work', description: 'We uphold the highest standards of professionalism when servicing your vehicle.' },
    { icon: Gem, title: 'Premium products and services', description: "Ensure your car's longevity with a periodic exterior protection treatment." },
    { icon: ShieldCheck, title: 'High-level security and privacy', description: 'We understand the importance of privacy and security for our clientele.' },
];

export function About() {
    return (
        <Section id="about" aria-labelledby="about-heading">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
                <div className="flex flex-col gap-8 lg:pr-16">
                    <h2
                        id="about-heading"
                        className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                    >
                        We will take good care of your car
                    </h2>
                    <ImageSlot
                        src="/assets/about-image.png"
                        alt="Detailed luxury car"
                        sizes="(min-width: 1024px) 40rem, 100vw"
                        className="aspect-[4/3] w-full rounded-3xl"
                    />
                </div>

                <div className="flex flex-col justify-between lg:border-l lg:border-border lg:pl-16">
                    <ul className="flex flex-col">
                        {FEATURES.map(({ icon: Icon, title, description }) => (
                            <li key={title} className="flex gap-4 border-b border-border py-6 first:pt-0">
                                <Icon className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden="true" />
                                <div>
                                    <h3 className="font-medium">{title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href={booking().url}
                        className="group mt-8 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
                    >
                        Book now
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </Section>
    );
}
