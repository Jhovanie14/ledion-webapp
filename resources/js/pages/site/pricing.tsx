import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { Pricing } from '@/components/site/pricing';
import { PageHeader } from '@/components/site/landing/page-header';
import { Button } from '@/components/ui/button';
import { CATEGORIES, getServicesByCategory } from '@/lib/services';
import { booking, contact, faq } from '@/routes';

export default function PricingPage() {
    return (
        <>
            <Head title="Pricing — Ledion Autocare" />
            <main>
                <PageHeader
                    title="Pricing"
                    description="Bundle and save, or pick exactly the service you need. Starting prices below — final quotes depend on vehicle size and condition."
                />

                <Pricing />

                <section className="border-t border-border bg-muted/40" aria-labelledby="price-list-heading">
                    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 id="price-list-heading" className="text-3xl font-semibold tracking-tight">
                                Per-service pricing
                            </h2>
                            <p className="mt-4 text-muted-foreground">All services, grouped by category.</p>
                        </div>

                        <div className="mt-12 flex flex-col gap-12">
                            {CATEGORIES.map((category) => (
                                <div key={category.id}>
                                    <h3 className="text-xl font-semibold tracking-tight">{category.label}</h3>
                                    <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-background">
                                        {getServicesByCategory(category.id).map((service) => (
                                            <li
                                                key={service.slug}
                                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                                            >
                                                <div className="min-w-0">
                                                    <Link href={`/services/${service.slug}`} className="font-medium hover:text-primary">
                                                        {service.title}
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground">{service.tagline}</p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">
                                                        From <span className="font-semibold text-foreground">{service.pricing.from}</span>
                                                        {service.pricing.unit ? ` ${service.pricing.unit}` : ''}
                                                    </span>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/services/${service.slug}`}>
                                                            Details
                                                            <ArrowRight className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <p className="mt-12 text-center text-sm text-muted-foreground">
                            Need help choosing?{' '}
                            <Link href={faq().url} className="font-medium text-primary hover:underline">
                                Read our FAQ
                            </Link>{' '}
                            or{' '}
                            <Link href={contact().url} className="font-medium text-primary hover:underline">
                                contact us
                            </Link>
                            .
                        </p>
                        <div className="mt-8 text-center">
                            <Button asChild size="lg">
                                <Link href={booking().url}>Book Now</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
