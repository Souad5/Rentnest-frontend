import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    MapPin,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ShieldCheck,
    Share2,
    Heart,
    Tag,
} from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { PropertyGallery } from '@/components/shared/PropertyGallery';
import { RentalRequestForm } from '@/components/forms/RentalRequestForm';
import { PropertyReviews } from '@/components/reviews/PropertyReviews';

const BASE_URL = (
    process.env.PUBLIC_API_URL || 'https://rentnest-backend-five.vercel.app/api'
).replace(/\/$/, '');

interface PropertyDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ moveIn?: string; moveOut?: string }>;
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
    imageUrl?: string | null;
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

async function getPropertyDetail(id: string): Promise<PropertyDetail | null> {
    try {
        const res = await fetch(`${BASE_URL}/properties/${id}`, {
            cache: 'no-store',
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

export default async function PropertyDetailPage({ params, searchParams }: PropertyDetailPageProps) {
    const { id } = await params;
    const property = await getPropertyDetail(id);

    if (!property) {
        notFound();
    }

    const query = searchParams ? await searchParams : {};
    const parseDateParam = (value?: string) => {
        if (!value) return undefined;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
    };
    const defaultStartDate = parseDateParam(query.moveIn);
    const defaultEndDate = defaultStartDate ? parseDateParam(query.moveOut) : undefined;

    const galleryImages = [
        ...(property.imageUrl ? [property.imageUrl] : []),
        ...(property.images ?? []),
    ];
    const images =
        galleryImages.length > 0
            ? galleryImages
            : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'];

    const isAvailable = property.isAvailable ?? true;
    const formattedDate = property.createdAt
        ? new Date(property.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : 'Recently';

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
                <AppButton asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/properties">
                        <ArrowLeft className="h-4 w-4" /> Back to Properties
                    </Link>
                </AppButton>
                <div className="flex items-center gap-2">
                    <AppButton variant="outline" size="icon" aria-label="Share listing">
                        <Share2 className="h-4 w-4" />
                    </AppButton>
                    <AppButton variant="outline" size="icon" aria-label="Save listing">
                        <Heart className="h-4 w-4" />
                    </AppButton>
                </div>
            </div>

            {/* Photo Gallery */}
            <PropertyGallery
                images={images}
                title={property.title}
                badge={<StatusBadge status={isAvailable ? 'AVAILABLE' : 'RENTED'} />}
            />

            {/* Content & Action Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
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

                    <div className="space-y-3 border-t border-border pt-6">
                        <h2 className="text-xl font-semibold">About this property</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base whitespace-pre-line">
                            {property.description}
                        </p>
                    </div>

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

                    {/* Tenant Ratings & Reviews */}
                    <PropertyReviews propertyId={property.id} className="border-t border-border pt-6" />

                    <div className="flex items-center gap-6 border-t border-border pt-6 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" /> Listed: {formattedDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Verified Listing
                        </span>
                    </div>
                </div>

                {/* Sidebar Sticky Contact / Rental Application Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20 border-border shadow-xs space-y-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Interested in this property?</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
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

                            {/* Interactive Rental Request Modal Form */}
                            <RentalRequestForm
                                propertyId={property.id}
                                propertyTitle={property.title}
                                price={property.price}
                                isAvailable={isAvailable}
                                defaultStartDate={defaultStartDate}
                                defaultEndDate={defaultEndDate}
                            />

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