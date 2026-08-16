import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    Bed,
    Bath,
    Square,
    MapPin,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ShieldCheck,
    Mail,
    Phone,
    Building2,
    Share2,
    Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { MOCK_PROPERTIES } from '@/constants/mockProperties';

interface PropertyDetailPageProps {
    params: Promise<{ id: string }>;
}

const DEFAULT_AMENITIES = [
    'In-Unit Washer & Dryer',
    'Air Conditioning & Heating',
    'High-Speed Wi-Fi Ready',
    'Private Balcony / Terrace',
    'Pet Friendly',
    'Assigned Parking Space',
    'Stainless Steel Appliances',
    'Hardwood Flooring',
];

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
    const { id } = await params;
    const property = MOCK_PROPERTIES.find((p) => p.id === id);

    if (!property) {
        notFound();
    }

    const images = property.images && property.images.length > 0
        ? property.images
        : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'];

    const isAvailable = property.isAvailable ?? true;
    const formattedDate = property.createdAt
        ? new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently';

    return (
        <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/properties">
                        <ArrowLeft className="h-4 w-4" /> Back to Properties
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" aria-label="Share listing">
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Save listing">
                        <Heart className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Photo Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl overflow-hidden border border-border shadow-sm">
                <div className="relative aspect-16/10 md:aspect-auto md:col-span-2 min-h-80 bg-muted">
                    <Image
                        src={images[0]}
                        alt={property.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                        <StatusBadge status={isAvailable ? 'AVAILABLE' : 'RENTED'} />
                    </div>
                </div>
                <div className="hidden md:grid grid-rows-2 gap-4">
                    {images.slice(1, 3).map((imgUrl, index) => (
                        <div key={index} className="relative w-full h-full bg-muted min-h-40">
                            <Image
                                src={imgUrl}
                                alt={`${property.title} view ${index + 2}`}
                                fill
                                sizes="33vw"
                                className="object-cover"
                            />
                        </div>
                    ))}
                    {images.length <= 1 && (
                        <div className="relative w-full h-full bg-muted min-h-40 flex items-center justify-center text-muted-foreground text-xs">
                            <Building2 className="h-8 w-8 opacity-40" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content & Action Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details (2 Columns) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <span>{property.address || property.location}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {property.title}
                        </h1>
                        <p className="text-3xl font-bold text-primary">
                            ${property.price}
                            <span className="text-base font-normal text-muted-foreground"> / month</span>
                        </p>
                    </div>

                    {/* Key Specs Bar */}
                    <div className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4 text-center">
                        <div className="flex flex-col items-center justify-center p-2">
                            <Bed className="h-5 w-5 text-primary mb-1" />
                            <span className="text-lg font-bold">{property.bedrooms ?? 0}</span>
                            <span className="text-xs text-muted-foreground">Bedrooms</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border-x border-border">
                            <Bath className="h-5 w-5 text-primary mb-1" />
                            <span className="text-lg font-bold">{property.bathrooms ?? 0}</span>
                            <span className="text-xs text-muted-foreground">Bathrooms</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2">
                            <Square className="h-5 w-5 text-primary mb-1" />
                            <span className="text-lg font-bold">{property.sizeSqFt ?? 0}</span>
                            <span className="text-xs text-muted-foreground">Sq Ft</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3 border-t border-border pt-6">
                        <h2 className="text-xl font-semibold">About this property</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                            {property.description}
                        </p>
                    </div>

                    {/* Amenities & Features */}
                    <div className="space-y-4 border-t border-border pt-6">
                        <h2 className="text-xl font-semibold">Features & Amenities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {DEFAULT_AMENITIES.map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Metadata */}
                    <div className="flex items-center gap-6 border-t border-border pt-6 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" /> Listed: {formattedDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Verified Listing
                        </span>
                    </div>
                </div>

                {/* Sidebar Sticky Contact / Application Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20 border-border shadow-sm space-y-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Interested in this property?</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Landlord Brief */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        LL
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Property Manager</span>
                                    <span className="text-xs text-muted-foreground">RentNest Partner</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button className="w-full gap-2" disabled={!isAvailable}>
                                    <Mail className="h-4 w-4" /> {isAvailable ? 'Request Tour / Contact' : 'Property Rented'}
                                </Button>
                                <Button variant="outline" className="w-full gap-2" disabled={!isAvailable}>
                                    <Phone className="h-4 w-4" /> Call Agent
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                No booking fees charged upfront. Verified by RentNest guarantee.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}