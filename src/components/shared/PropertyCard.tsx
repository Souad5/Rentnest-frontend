'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heart, Star, Tag, MapPin, BedDouble, Bath, Ruler } from 'lucide-react';
import { Property } from '@/types/api';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
    property: Property;
    priority?: boolean;
}

export default function PropertyCard({ property, priority = false }: PropertyCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const searchParams = useSearchParams();

    const detailHref = useMemo(() => {
        const params = new URLSearchParams();
        const moveIn = searchParams.get('moveIn');
        const moveOut = searchParams.get('moveOut');
        if (moveIn) params.set('moveIn', moveIn);
        if (moveOut) params.set('moveOut', moveOut);
        const qs = params.toString();
        return qs ? `/properties/${property.id}?${qs}` : `/properties/${property.id}`;
    }, [property.id, searchParams]);

    const imageUrl =
        property.imageUrl ||
        (property.images && property.images.length > 0
            ? property.images[0]
            : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80');

    const isAvailable = property.isAvailable ?? true;
    const formattedPrice = new Intl.NumberFormat('en-US').format(property.price || 0);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked((prev) => !prev);
    };

    return (
        <div className="group relative flex flex-col cursor-pointer">
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-black/5 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                <Image
                    src={imageUrl}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    priority={priority}
                />
                {/* Soft gradient scrim for badge legibility */}
                <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Floating Wishlist Heart Button */}
                <button
                    type="button"
                    onClick={handleWishlistToggle}
                    aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                    aria-pressed={isLiked}
                    className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur-md shadow-md transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95"
                >
                    <Heart
                        className={cn(
                            'h-[18px] w-[18px] stroke-neutral-800 transition-colors',
                            isLiked ? 'fill-rose-500 stroke-rose-500' : 'fill-transparent',
                        )}
                    />
                </button>

                {/* Top-Left Availability Badge */}
                {!isAvailable && (
                    <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-[#181818]/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
                        Rented
                    </span>
                )}

                {/* Bottom Category Tag */}
                {property.category?.name && (
                    <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur-md">
                        <Tag className="h-3 w-3" />
                        {property.category.name}
                    </span>
                )}

                {/* Rating Chip */}
                <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur-md">
                    <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                    4.95
                </span>
            </div>

            {/* Content Details */}
            <div className="flex flex-1 flex-col space-y-1.5 px-1 pt-3.5">
                {/* Location & Rating */}
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                        {property.location}
                        {property.address ? `, ${property.address}` : ''}
                    </span>
                </p>

                {/* Title */}
                <h3 className="line-clamp-1 pr-2 font-serif text-lg leading-snug text-[#1c1d1d]">
                    <Link href={detailHref} className="focus:outline-none">
                        <span className="absolute inset-0 z-10" aria-hidden="true" />
                        {property.title}
                    </Link>
                </h3>

                {/* Specs Pill Summary */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms ?? 0} beds
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" /> {property.bathrooms ?? 0} baths
                    </span>
                    {property.sizeSqFt ? (
                        <span className="inline-flex items-center gap-1">
                            <Ruler className="h-3.5 w-3.5" /> {property.sizeSqFt} sqft
                        </span>
                    ) : null}
                </div>

                {/* Price Display */}
                <div className="pt-1.5 mt-auto">
                    <span className="font-serif text-xl font-semibold tracking-tight text-[#1c1d1d]">
                        ${formattedPrice}
                    </span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                </div>
            </div>
        </div>
    );
}
