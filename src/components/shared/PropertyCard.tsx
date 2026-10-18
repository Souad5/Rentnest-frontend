import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bath, BedDouble, Building2, MapPin, Ruler, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { canOptimizeImage, coverImage } from '@/lib/images';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PropertySummary } from '@/types/api';

type CardProperty = Pick<PropertySummary, 'id' | 'title' | 'description' | 'location' | 'price'> &
    Partial<Pick<PropertySummary, 'images' | 'imageUrl' | 'bedrooms' | 'bathrooms' | 'areaSqft' | 'avgRating' | 'reviewCount' | 'isAvailable'>> & {
        category?: { name: string } | null;
    };

interface PropertyCardProps {
    property: CardProperty;
    /** Extra query string appended to the details link, e.g. "moveIn=2026-11-01". */
    hrefQuery?: string;
    priority?: boolean;
    className?: string;
}

/**
 * The one card used for every property grid (home, explore, related, AI chat).
 * Fixed image ratio + clamped text keep every card the same height.
 */
export default function PropertyCard({ property, hrefQuery, priority = false, className }: PropertyCardProps) {
    const href = `/properties/${property.id}${hrefQuery ? `?${hrefQuery}` : ''}`;
    const image = coverImage(property);
    const rating = property.avgRating ?? 0;
    const reviews = property.reviewCount ?? 0;

    return (
        <article
            className={cn(
                'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                className,
            )}
        >
            <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden bg-muted" tabIndex={-1} aria-hidden>
                {image ? (
                    <Image
                        src={image}
                        alt={property.title}
                        fill
                        priority={priority}
                        unoptimized={!canOptimizeImage(image)}
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Building2 className="h-10 w-10" />
                    </div>
                )}
                {property.category?.name && (
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                        {property.category.name}
                    </span>
                )}
                {property.isAvailable === false && (
                    <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-[11px] font-semibold text-ink-foreground">
                        Rented
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{property.location}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
                        <Star className={cn('h-3.5 w-3.5', reviews > 0 ? 'fill-highlight text-highlight' : 'text-muted-foreground')} />
                        {reviews > 0 ? (
                            <>
                                {rating.toFixed(1)} <span className="font-normal text-muted-foreground">({reviews})</span>
                            </>
                        ) : (
                            <span className="font-normal text-muted-foreground">New</span>
                        )}
                    </span>
                </div>

                <div className="space-y-1.5">
                    <h3 className="line-clamp-1 font-serif text-lg font-semibold leading-snug text-foreground">
                        <Link href={href} className="hover:text-primary focus-visible:outline-none focus-visible:text-primary">
                            {property.title}
                        </Link>
                    </h3>
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-muted-foreground">{property.description}</p>
                </div>

                <div className="flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {property.bedrooms != null && (
                        <span className="inline-flex items-center gap-1">
                            <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
                        </span>
                    )}
                    {property.bathrooms != null && (
                        <span className="inline-flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5" /> {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
                        </span>
                    )}
                    {property.areaSqft != null && (
                        <span className="inline-flex items-center gap-1">
                            <Ruler className="h-3.5 w-3.5" /> {property.areaSqft.toLocaleString()} sqft
                        </span>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
                    <p className="text-foreground">
                        <span className="font-serif text-xl font-semibold">{formatPrice(property.price)}</span>
                        <span className="text-xs text-muted-foreground"> / month</span>
                    </p>
                    <Button asChild size="sm" className="rounded-xl">
                        <Link href={href}>
                            View details <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

export { PropertyCard };

export function PropertyCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-24 rounded-full" />
                    <Skeleton className="h-3 w-10 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-2/3 rounded-full" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-3 w-14 rounded-full" />
                    <Skeleton className="h-3 w-14 rounded-full" />
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
