import { Play } from 'lucide-react';

import { ImageSlot } from '@/components/site/landing/image-slot';

export function Showreel() {
    return (
        <section aria-labelledby="showreel-heading" className="px-4 py-12 sm:px-6 lg:px-8">
            <h2 id="showreel-heading" className="sr-only">
                Watch our showreel
            </h2>
            <div className="relative mx-auto aspect-[16/9] max-w-7xl overflow-hidden rounded-3xl border border-border sm:aspect-[21/9]">
                <ImageSlot
                    label="Detailing showreel"
                    className="absolute inset-0 size-full rounded-none border-0 bg-gradient-to-br from-muted to-card"
                />
                <div className="absolute inset-0 bg-background/30" aria-hidden="true" />
                <button
                    type="button"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                    <span className="flex size-16 items-center justify-center rounded-full border border-foreground/60 backdrop-blur-sm sm:size-20">
                        <Play className="size-6 translate-x-0.5 fill-current sm:size-7" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium">Play showreel</span>
                </button>
            </div>
        </section>
    );
}
