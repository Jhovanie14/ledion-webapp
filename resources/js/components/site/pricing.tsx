import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

import { Eyebrow } from '@/components/site/landing/eyebrow';
import { Section } from '@/components/site/landing/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BUNDLES } from '@/lib/services';
import { booking } from '@/routes';

export function Pricing({ viewAllHref }: { viewAllHref?: string } = {}) {
    return (
        <Section aria-labelledby="pricing-heading">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <Eyebrow>Packages</Eyebrow>
                <h2
                    id="pricing-heading"
                    className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                >
                    Bundle &amp; save
                </h2>
                <p className="mt-4 text-muted-foreground">
                    Bundle our services and save — or price any service individually.
                </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {BUNDLES.map((bundle) => (
                    <div key={bundle.slug} className={cn('relative', bundle.featured && 'lg:scale-105')}>
                        {bundle.featured && (
                            <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">Most popular</Badge>
                        )}
                        <Card
                            className={cn(
                                'flex h-full flex-col',
                                bundle.featured ? 'ring-2 ring-primary' : 'transition-colors hover:ring-foreground/20',
                            )}
                        >
                            <CardHeader>
                                <CardTitle className="text-xl">{bundle.name}</CardTitle>
                                <CardDescription>{bundle.description}</CardDescription>
                                <div className="mt-2 font-heading text-4xl font-semibold">{bundle.price}</div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="flex flex-col gap-3">
                                    {bundle.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <Check className="size-4 text-primary" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" variant={bundle.featured ? 'default' : 'outline'}>
                                    <Link href={booking().url}>Book {bundle.name}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
            {viewAllHref && (
                <div className="mt-10 text-center">
                    <Button asChild variant="outline">
                        <Link href={viewAllHref}>See full pricing</Link>
                    </Button>
                </div>
            )}
        </Section>
    );
}
