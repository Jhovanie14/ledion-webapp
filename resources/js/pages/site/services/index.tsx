import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ImageIcon } from 'lucide-react';

import { PageHeader } from '@/components/site/landing/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, getServicesByCategory } from '@/lib/services';

export default function ServicesIndex() {
    return (
        <>
            <Head title="Our Services — Ledion Autocare" />
            <main>
                <PageHeader
                    title="Our Services"
                    description="Everything your car needs, from a quick wash to full paint protection — explore each service in detail."
                />
                <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    {CATEGORIES.map((category) => (
                        <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                            <div className="max-w-2xl">
                                <h2 id={`cat-${category.id}`} className="text-2xl font-semibold tracking-tight">
                                    {category.label}
                                </h2>
                                <p className="mt-2 text-muted-foreground">{category.description}</p>
                            </div>
                            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {getServicesByCategory(category.id).map((service) => {
                                    const Icon = service.icon;
                                    return (
                                        <Link
                                            key={service.slug}
                                            href={`/services/${service.slug}`}
                                            className="group rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                                        >
                                            <Card className="h-full rounded-2xl transition-colors group-hover:border-primary">
                                                <div className="-mt-6 flex aspect-video w-full items-center justify-center overflow-hidden rounded-t-xl bg-muted text-muted-foreground/60 transition-colors group-hover:bg-muted/70">
                                                    <ImageIcon className="size-8" aria-hidden />
                                                    <span className="sr-only">{service.title} image coming soon</span>
                                                </div>
                                                <CardHeader>
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                        <Icon className="size-6" />
                                                    </div>
                                                    <CardTitle className="text-lg">{service.title}</CardTitle>
                                                    <CardDescription>{service.tagline}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">
                                                        From <span className="font-medium text-foreground">{service.pricing.from}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                                                        Details
                                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </>
    );
}
