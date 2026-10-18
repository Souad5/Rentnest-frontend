'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { Building2, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { canOptimizeImage } from '@/lib/images';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
    images: string[];
    title: string;
    /** Optional overlay in the hero's top-left corner (e.g. availability badge). */
    badge?: React.ReactNode;
    className?: string;
}

const SWIPE_THRESHOLD = 40;

/**
 * Hero + thumbnail gallery with a keyboard- and swipe-friendly lightbox.
 * Handles 0, 1 and many images without falling back to stock photos.
 */
export function PropertyGallery({ images, title, badge, className }: PropertyGalleryProps) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const count = images.length;

    const openAt = (i: number) => {
        setIndex(i);
        setOpen(true);
    };
    const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

    if (count === 0) {
        return (
            <div
                className={cn(
                    'relative flex aspect-[16/9] max-h-[420px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted text-muted-foreground',
                    className,
                )}
            >
                <Building2 className="h-10 w-10" />
                <p className="text-sm font-medium">The landlord hasn&apos;t added photos yet</p>
                {badge && <div className="absolute left-4 top-4">{badge}</div>}
            </div>
        );
    }

    const [hero, ...rest] = images;
    const thumbs = rest.slice(0, 4);
    const hiddenCount = count - 1 - thumbs.length;

    return (
        <div className={className}>
            <div className={cn('grid gap-2 sm:gap-3', thumbs.length > 0 && 'md:grid-cols-4 md:grid-rows-2')}>
                <button
                    type="button"
                    onClick={() => openAt(0)}
                    className={cn(
                        'group relative w-full overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        thumbs.length > 0
                            ? 'aspect-[4/3] sm:aspect-[16/9] md:col-span-2 md:row-span-2 md:aspect-auto md:h-full md:min-h-[400px]'
                            : 'aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]',
                    )}
                    aria-label={`Open photo 1 of ${count} in full screen`}
                >
                    <Image
                        src={hero}
                        alt={`${title} — photo 1`}
                        fill
                        priority
                        unoptimized={!canOptimizeImage(hero)}
                        sizes={thumbs.length > 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1280px) 1216px, 100vw'}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                </button>

                {thumbs.map((src, i) => {
                    const photoIndex = i + 1;
                    const isLast = i === thumbs.length - 1 && hiddenCount > 0;
                    return (
                        <button
                            key={`${src}-${photoIndex}`}
                            type="button"
                            onClick={() => openAt(photoIndex)}
                            className={cn(
                                'group relative hidden aspect-[4/3] overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:block md:aspect-auto',
                                // With fewer than 4 thumbs, let the last one stretch to fill the 2x2 block.
                                thumbs.length === 1 && 'md:col-span-2 md:row-span-2',
                                thumbs.length === 2 && 'md:col-span-2',
                                thumbs.length === 3 && i === 2 && 'md:col-span-2',
                            )}
                            aria-label={`Open photo ${photoIndex + 1} of ${count} in full screen`}
                        >
                            <Image
                                src={src}
                                alt={`${title} — photo ${photoIndex + 1}`}
                                fill
                                unoptimized={!canOptimizeImage(src)}
                                sizes="(min-width: 768px) 25vw, 50vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {isLast && (
                                <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-sm font-semibold text-ink-foreground">
                                    +{hiddenCount} more
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mobile: thumbnail strip under the hero */}
            {count > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:hidden" aria-label="More photos">
                    {images.slice(1).map((src, i) => (
                        <button
                            key={`${src}-m-${i}`}
                            type="button"
                            onClick={() => openAt(i + 1)}
                            className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Open photo ${i + 2} of ${count}`}
                        >
                            <Image
                                src={src}
                                alt={`${title} — photo ${i + 2}`}
                                fill
                                unoptimized={!canOptimizeImage(src)}
                                sizes="96px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-3">
                <div>{badge}</div>
                <Button variant="outline" className="h-9 rounded-xl px-3" onClick={() => openAt(0)}>
                    <Images className="h-4 w-4" />
                    {count === 1 ? 'View photo' : `View all ${count} photos`}
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-2xl border-0 bg-ink p-0 text-ink-foreground ring-0 sm:max-w-5xl"
                    onKeyDown={(e) => {
                        if (count < 2) return;
                        if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            go(1);
                        } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            go(-1);
                        }
                    }}
                >
                    <DialogTitle className="sr-only">{title} photos</DialogTitle>
                    <DialogDescription className="sr-only">
                        Photo {index + 1} of {count}. Use the left and right arrow keys or swipe to browse.
                    </DialogDescription>

                    <div
                        className="relative aspect-[4/3] w-full bg-ink sm:aspect-[16/10]"
                        onTouchStart={(e) => (touchStartX.current = e.touches[0]?.clientX ?? null)}
                        onTouchEnd={(e) => {
                            const start = touchStartX.current;
                            const end = e.changedTouches[0]?.clientX;
                            touchStartX.current = null;
                            if (start == null || end == null || count < 2) return;
                            if (Math.abs(end - start) > SWIPE_THRESHOLD) go(end < start ? 1 : -1);
                        }}
                    >
                        <Image
                            key={images[index]}
                            src={images[index]}
                            alt={`${title} — photo ${index + 1}`}
                            fill
                            unoptimized={!canOptimizeImage(images[index])}
                            sizes="(min-width: 1024px) 1024px, 100vw"
                            className="object-contain"
                        />

                        {count > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => go(-1)}
                                    aria-label="Previous photo"
                                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-4"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => go(1)}
                                    aria-label="Next photo"
                                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-4"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}

                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold tabular-nums text-foreground">
                            {index + 1} / {count}
                        </span>
                    </div>

                    {count > 1 && (
                        <div className="flex gap-2 overflow-x-auto p-3" aria-label="Choose a photo">
                            {images.map((src, i) => (
                                <button
                                    key={`${src}-lb-${i}`}
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    aria-label={`Show photo ${i + 1}`}
                                    aria-current={i === index ? 'true' : undefined}
                                    className={cn(
                                        'relative h-14 w-20 shrink-0 overflow-hidden rounded-lg opacity-60 ring-2 ring-transparent transition focus-visible:outline-none focus-visible:ring-ring',
                                        i === index && 'opacity-100 ring-primary',
                                    )}
                                >
                                    <Image
                                        src={src}
                                        alt=""
                                        fill
                                        unoptimized={!canOptimizeImage(src)}
                                        sizes="80px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
