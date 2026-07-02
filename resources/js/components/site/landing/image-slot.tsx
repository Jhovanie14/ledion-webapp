import { ImageIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type ImageSlotProps = {
    label?: string;
    className?: string;
    /** When provided, a real image is rendered instead of the placeholder. */
    src?: string;
    /** Accessible description; falls back to `label`. */
    alt?: string;
    /** Above-the-fold images load eagerly; others lazy-load. */
    priority?: boolean;
    /** Responsive sizes hint. */
    sizes?: string;
    /** Override object-fit, e.g. "object-contain". Defaults to cover. */
    imageClassName?: string;
    /** Intrinsic dimensions to reserve space and avoid layout shift. */
    width?: number;
    height?: number;
};

export function ImageSlot({
    label = 'Image',
    className,
    src,
    alt,
    priority,
    sizes = '100vw',
    imageClassName,
    width,
    height,
}: ImageSlotProps) {
    if (src) {
        return (
            <div className={cn('relative overflow-hidden rounded-2xl bg-muted', className)}>
                <img
                    src={src}
                    alt={alt ?? label}
                    width={width}
                    height={height}
                    sizes={sizes}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={priority ? 'high' : 'auto'}
                    className={cn('size-full object-cover', imageClassName)}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground',
                className,
            )}
            role="img"
            aria-label={`${label} placeholder`}
        >
            <span className="flex items-center gap-2 text-sm">
                <ImageIcon className="size-4" />
                {label}
            </span>
        </div>
    );
}
