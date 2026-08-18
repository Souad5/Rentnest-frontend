import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
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
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import StatusBadge from '@/components/shared/StatusBadge';

const BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || 'https://rentnest-backend-five.vercel.app/api'
).replace(/\/$/, '');

interface PropertyDetailPageProps {
    params: Promise<{ id: string }>;
}

export interface CategoryData {
    id: string;
    name: string;
}

export interface LandlordData {
    id: string;
    name: string;
    email: string;
}

export interface PropertyDetail {
    id: string;
    title: string;
    description: string;
    address: string;
    location: string;
    price: number;
    isAvailable: boolean;
    landlordId: string;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
    category?: CategoryData;
    landlord?: LandlordData;
    images?: string[];
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

// Helper to fetch property details directly from backend
async function getPropertyDetail(id: string): Promise<PropertyDetail | null> {
    try {
        const res = await fetch(`${BASE_URL}/properties/${id}`, {
            cache: 'no-store', // Ensures fresh data per request
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch property details (Status ${res.status})`);
        }

        const json = await res.json();
        return json.data || json;
    } catch (err) {
        console.error('Error fetching property detail:', err);
        return null;
    }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
    const { id } = await params;
    const property = await getPropertyDetail(id);

    if (!property) {
        notFound();
    }

    const images =
        property.images && property.images.length > 0
            ? property.images
            : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'];

    const isAvailable = property.isAvailable ?? true;
    const formattedDate = property.createdAt
        ? new Date(property.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : 'Recently';

    // Landlord initials fallback
    const landlordName = property.landlord?.name || 'Landlord Partner';
    const landlordInitials = landlordName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

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
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-primary shrink-0" />
                                <span>
                                    {property.address ? `${property.address}, ` : ''}
                                    {property.location}
                                </span>
                            </div>
                            {property.category && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                    <Tag className="h-3 w-3" />
                                    {property.category.name}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {property.title}
                        </h1>
                        <p className="text-3xl font-bold text-primary">
                            ${property.price}
                            <span className="text-base font-normal text-muted-foreground"> / month</span>
                        </p>
                    </div>

                    {/* Key Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4 text-center">
                        <div className="flex flex-col items-center justify-center p-2">
                            <Tag className="h-5 w-5 text-primary mb-1" />
                            <span className="text-base font-bold truncate max-w-full">
                                {property.category?.name || 'N/A'}
                            </span>
                            <span className="text-xs text-muted-foreground">Category</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border-x border-border">
                            <MapPin className="h-5 w-5 text-primary mb-1" />
                            <span className="text-base font-bold truncate max-w-full">
                                {property.location}
                            </span>
                            <span className="text-xs text-muted-foreground">Location</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 col-span-2 sm:col-span-1">
                            <ShieldCheck className="h-5 w-5 text-primary mb-1" />
                            <span className="text-base font-bold">Verified</span>
                            <span className="text-xs text-muted-foreground">Status</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3 border-t border-border pt-6">
                        <h2 className="text-xl font-semibold">About this property</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base whitespace-pre-line">
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
                    <div className="flex items-center gap-6 border-t border-border pt-6 text-xs text-muted-foreground flex-wrap">
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
                                        {landlordInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium truncate">
                                        {landlordName}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {property.landlord?.email || 'Verified Landlord'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button className="w-full gap-2" disabled={!isAvailable}>
                                    <Mail className="h-4 w-4" />{' '}
                                    {isAvailable ? 'Request Tour / Contact' : 'Property Rented'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    disabled={!isAvailable}
                                >
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