import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { Section } from '@/components/site/landing/section';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { booking } from '@/routes';

const SERVICES = [
    { title: 'Entry level detail', description: 'Treat your car to a thorough hand wash and premium wax application.' },
    { title: 'Maintenance detail', description: 'Keep your finish protected with a periodic exterior protection treatment.' },
    { title: 'Full detail', description: 'A complete inside-and-out treatment, leaving no detail overlooked.' },
];

export function Services() {
    return (
        <Section id="services" aria-labelledby="services-heading">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                Luxury car detailing
            </p>
            <hr className="mt-4 border-border" />
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <h2
                    id="services-heading"
                    className="max-w-xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                >
                    Love in every detail
                </h2>
                <p className="max-w-sm text-muted-foreground">
                    Immerse yourself in luxury with our bespoke detailing packages, tailored to your
                    car&rsquo;s unique needs.
                </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
                {SERVICES.map(({ title, description }) => (
                    <Card key={title} className="group overflow-hidden transition-colors hover:ring-foreground/20">
                        <ImageSlot
                            label={title}
                            className="aspect-[4/3] w-full rounded-none border-0 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                        <CardHeader>
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription className="text-base">{description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link
                                href={booking().url}
                                className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
                            >
                                Learn more
                                <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </Section>
    );
}
