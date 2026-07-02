import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { PageHeader } from '@/components/site/landing/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getServiceBySlug, type Service } from '@/lib/services';
import { booking, services } from '@/routes';

export default function ServiceShow({ slug }: { slug: string }) {
    const service = getServiceBySlug(slug);

    if (!service) {
        return (
            <>
                <Head title="Service not found — Ledion Autocare" />
                <main className="mx-auto flex min-h-[60svh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">Service not found</h1>
                    <p className="text-muted-foreground">
                        We couldn&apos;t find that service. Browse our full range instead.
                    </p>
                    <Button asChild variant="outline">
                        <Link href={services().url}>View all services</Link>
                    </Button>
                </main>
            </>
        );
    }

    const related = service.related
        .map((relatedSlug) => getServiceBySlug(relatedSlug))
        .filter((item): item is Service => item !== undefined);

    return (
        <>
            <Head title={`${service.title} — Ledion Autocare`} />
            <main>
                <PageHeader title={service.title} description={service.tagline} />

                <div className="mx-auto flex max-w-7xl flex-col gap-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <section className="grid items-center gap-12 lg:grid-cols-2">
                        <ImageSlot label={service.title} className="aspect-[4/3] w-full" />
                        <div className="flex flex-col gap-5">
                            <h2 className="text-3xl font-semibold tracking-tight">Overview</h2>
                            <p className="text-muted-foreground">{service.description}</p>
                            <ul className="flex flex-col gap-3">
                                {service.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                        <Check className="size-4 text-primary" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div>
                                <Button asChild size="lg">
                                    <Link href={booking().url}>Book this service</Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="process-heading">
                        <h2 id="process-heading" className="text-2xl font-semibold tracking-tight">How it works</h2>
                        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
                            {service.process.map((step, index) => (
                                <li key={step.title} className="flex flex-col gap-2">
                                    <span className="text-4xl font-semibold text-primary/30">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-lg font-medium">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section aria-labelledby="detail-pricing-heading">
                        <h2 id="detail-pricing-heading" className="text-2xl font-semibold tracking-tight">Pricing</h2>
                        {service.pricing.packages ? (
                            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                                {service.pricing.packages.map((pkg) => (
                                    <Card key={pkg.name} className="flex flex-col rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                            <div className="mt-2 text-3xl font-semibold">{pkg.price}</div>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <ul className="flex flex-col gap-3">
                                                {pkg.features.map((feature) => (
                                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                                        <Check className="size-4 text-primary" aria-hidden="true" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild className="w-full" variant="outline">
                                                <Link href={booking().url}>Book {pkg.name}</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-wrap items-baseline gap-2">
                                <span className="text-muted-foreground">Starting at</span>
                                <span className="text-3xl font-semibold">{service.pricing.from}</span>
                                {service.pricing.unit && (
                                    <span className="text-sm text-muted-foreground">{service.pricing.unit}</span>
                                )}
                            </div>
                        )}
                        {service.pricing.note && (
                            <p className="mt-4 text-sm text-muted-foreground">{service.pricing.note}</p>
                        )}
                    </section>

                    {related.length > 0 && (
                        <section aria-labelledby="related-heading">
                            <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">Related services</h2>
                            <div className="mt-8 grid gap-6 md:grid-cols-3">
                                {related.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.slug}
                                            href={`/services/${item.slug}`}
                                            className="group rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                                        >
                                            <Card className="h-full rounded-2xl transition-colors group-hover:border-primary">
                                                <CardHeader>
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                        <Icon className="size-6" />
                                                    </div>
                                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                                    <CardDescription>{item.tagline}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                                                        View
                                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}
