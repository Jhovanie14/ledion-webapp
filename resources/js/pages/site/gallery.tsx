import { Head } from '@inertiajs/react';

import { ImageSlot } from '@/components/site/landing/image-slot';
import { PageHeader } from '@/components/site/landing/page-header';

const CATEGORIES = [
    { name: 'Exterior Detailing', items: ['Full exterior wash', 'Paint correction', 'Gloss finish', 'Wheel restoration'] },
    { name: 'Interior Detailing', items: ['Interior shampoo', 'Leather conditioning', 'Dashboard restore', 'Odor removal'] },
    { name: 'Surface Protection', items: ['Ceramic coating', 'Paint protection film', 'Glass coating', 'Trim sealing'] },
];

export default function Gallery() {
    return (
        <>
            <Head title="Our Work — Ledion Autocare" />
            <main>
                <PageHeader title="Our Work" description="A glimpse of the results our team delivers, day in and day out." />
                <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    {CATEGORIES.map((category) => (
                        <section key={category.name}>
                            <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
                            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {category.items.map((item) => (
                                    <ImageSlot key={item} label={item} className="aspect-square w-full" />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </>
    );
}
