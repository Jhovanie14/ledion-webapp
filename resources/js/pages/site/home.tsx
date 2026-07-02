import { Head } from '@inertiajs/react';

import { About } from '@/components/site/landing/about';
import { CtaBand } from '@/components/site/landing/cta-band';
import { Hero } from '@/components/site/landing/hero';
import { Services } from '@/components/site/landing/services';
import { Showreel } from '@/components/site/landing/showreel';

export default function Home() {
    return (
        <>
            <Head title="Premium Auto Detailing & Protection">
                <meta
                    name="description"
                    content="Book premium auto detailing, surface protection, and maintenance — in-shop or home service with Ledion Autocare."
                />
            </Head>
            <main>
                <Hero />
                <Services />
                <Showreel />
                <About />
                <CtaBand />
            </main>
        </>
    );
}
