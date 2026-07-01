import { Head, Link } from '@inertiajs/react';
import { Award, Clock, Heart, Leaf } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { PageHeader } from '@/components/site/landing/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { booking } from '@/routes';

const VALUES = [
    { icon: Award, title: 'Craftsmanship', description: 'Certified detailers and proven techniques on every job.' },
    { icon: Heart, title: 'Care', description: 'We treat every vehicle as if it were our own.' },
    { icon: Leaf, title: 'Eco-conscious', description: 'Premium products that are kinder to your car and the planet.' },
    { icon: Clock, title: 'Reliability', description: 'On time, every time — at our studio or your door.' },
];

const STATS = [
    { value: '10+', label: 'Years experience' },
    { value: '5,000+', label: 'Cars detailed' },
    { value: '4.9★', label: 'Average rating' },
    { value: '100%', label: 'Satisfaction focus' },
];

export default function About() {
    return (
        <>
            <Head title="About Ledion Autocare" />
            <main>
                <PageHeader title="About Ledion Autocare" description="Detailing obsessed, since day one." />
                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <ImageSlot label="Our studio" className="aspect-[4/3] w-full" />
                        <div className="flex flex-col gap-4">
                            <h2 className="text-3xl font-semibold tracking-tight">Our story</h2>
                            <p className="text-muted-foreground">
                                Ledion Autocare was founded on a simple belief: every car deserves meticulous,
                                professional care. What started as a passion for perfection has grown into a trusted name
                                in auto detailing, surface protection, and maintenance.
                            </p>
                            <p className="text-muted-foreground">
                                Whether you visit our fully equipped studio or book our mobile team, we bring the same
                                obsessive attention to detail to every vehicle.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="border-t border-border bg-muted/40">
                    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-semibold tracking-tight">What we stand for</h2>
                        </div>
                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {VALUES.map(({ icon: Icon, title, description }) => (
                                <Card key={title} className="rounded-2xl">
                                    <CardHeader>
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon className="size-6" />
                                        </div>
                                        <CardTitle className="text-lg">{title}</CardTitle>
                                        <CardDescription>{description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <dt className="text-4xl font-semibold">{stat.value}</dt>
                                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-12 text-center">
                        <Button asChild size="lg">
                            <Link href={booking().url}>Book your detail</Link>
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}
