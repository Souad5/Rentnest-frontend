'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Tag } from 'lucide-react';
import { Property } from '@/types/api';

interface PropertyCardProps {
    property: Property;
    priority?: boolean;
}

export default function PropertyCard({ property, priority = false }: PropertyCardProps) {
    const [isLiked, setIsLiked] = useState(false);

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
        <div className="group relative flex flex-col space-y-3 cursor-pointer bg-white rounded-t-2xl rounded-b-2xl">
            {/* Image Container with Airbnb Micro-interactions */}
            <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-muted">
                <Image
                    src={imageUrl}
                    alt={property.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={priority}
                />

                {/* Floating Wishlist Heart Button */}
                <button
                    type="button"
                    onClick={handleWishlistToggle}
                    aria-label="Save to wishlist"
                    className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center transition-transform hover:scale-110 active:scale-95"
                >
                    <Heart
                        className={`h-6 w-6 stroke-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-colors ${isLiked ? 'fill-rose-500 stroke-rose-500' : 'fill-black/20'
                            }`}
                    />
                </button>

                {/* Top-Left Status Badge */}
                {!isAvailable && (
                    <div className="absolute left-3 top-3 z-10">
                        <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                            Rented
                        </span>
                    </div>
                )}

                {/* Bottom Category Tag */}
                {property.category?.name && (
                    <div className="absolute bottom-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur-md dark:bg-black/80 dark:text-white">
                            <Tag className="h-3 w-3" />
                            {property.category.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Details */}
            <div className="space-y-1 text-sm p-4">
                {/* Location & Rating */}
                <div className="flex items-center justify-between font-semibold text-foreground">
                    <span className="truncate pr-2">
                        {property.location}
                        {property.address ? `, ${property.address}` : ''}
                    </span>
                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                        <span>4.95</span>
                    </div>
                </div>

                {/* Title */}
                <p className="line-clamp-1 text-muted-foreground font-normal">
                    <Link href={`/properties/${property.id}`} className="focus:outline-none">
                        <span className="absolute inset-0 z-10" aria-hidden="true" />
                        {property.title}
                    </Link>
                </p>

                {/* Specs Pill Summary */}
                <p className="text-xs text-muted-foreground/80">
                    {property.bedrooms ? `${property.bedrooms} beds` : 'Studio'}
                    {property.bathrooms ? ` · ${property.bathrooms} baths` : ''}
                    {property.sizeSqFt ? ` · ${property.sizeSqFt} sqft` : ''}
                </p>

                {/* Price Display */}
                <div className="pt-0.5">
                    <span className="font-semibold text-foreground text-base">
                        ${formattedPrice}
                    </span>
                    <span className="text-muted-foreground text-xs font-normal"> / month</span>
                </div>
            </div>
        </div>
    );
}