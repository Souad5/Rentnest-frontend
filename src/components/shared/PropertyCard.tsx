import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import { Property } from '@/types/api';

export default function PropertyCard({ property }: { property: Property }) {
    const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750';
    const isAvailable = property.isAvailable ?? true;

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <div className="relative aspect-16/10 w-full bg-muted">
                <Image
                    src={imageUrl}
                    alt={property.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                />
                <div className="absolute right-3 top-3">
                    <StatusBadge status={isAvailable ? 'AVAILABLE' : 'RENTED'} />
                </div>
            </div>

            <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">{property.location}</span>
                </div>
                <h3 className="font-semibold text-lg line-clamp-1">
                    <Link href={`/properties/${property.id}`} className="hover:text-primary">
                        {property.title}
                    </Link>
                </h3>
                <p className="text-xl font-bold text-primary">
                    ${property.price}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground border-t border-border mt-2">
                <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.bedrooms ?? 0} Beds</span>
                <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms ?? 0} Baths</span>
                <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5" /> {property.sizeSqFt ?? 0} sqft</span>
            </CardFooter>
        </Card>
    );
}