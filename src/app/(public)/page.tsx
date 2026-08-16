import Link from 'next/link';
import { Search, Building2, Shield, CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/shared/PropertyCard';
import { Property } from '@/types/api';

// Mock featured properties data for initial render
const FEATURED_PROPERTIES: Property[] = [
    {
        id: 'prop-1',
        title: 'Modern Luxury Apartment in Downtown',
        description: 'Spacious 2-bedroom apartment with skyline views, modern kitchen, and full amenities.',
        address: '123 Main St, New York, NY',
        location: 'Downtown, New York',
        categoryId: 'cat-apartment',
        price: 2400,
        bedrooms: 2,
        bathrooms: 2,
        sizeSqFt: 1100,
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
        isAvailable: true,
        landlordId: 'landlord-1',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'prop-2',
        title: 'Cozy Coastal Villa with Ocean View',
        description: 'Beautiful 3-bedroom villa close to the beach with private garden and outdoor patio.',
        address: '456 Ocean Ave, Miami, FL',
        location: 'Coastal, Miami',
        categoryId: 'cat-villa',
        price: 3800,
        bedrooms: 3,
        bathrooms: 2.5,
        sizeSqFt: 1850,
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
        isAvailable: true,
        landlordId: 'landlord-2',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'prop-3',
        title: 'Minimalist Urban Studio Loft',
        description: 'Sleek studio in the heart of the tech district. Ideal for single professionals.',
        address: '789 Tech Blvd, San Francisco, CA',
        location: 'SOMA, San Francisco',
        categoryId: 'cat-studio',
        price: 1750,
        bedrooms: 1,
        bathrooms: 1,
        sizeSqFt: 650,
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
        isAvailable: true,
        landlordId: 'landlord-1',
        createdAt: new Date().toISOString(),
    },
];

export default function HomePage() {
    return (
        <div className="space-y-16 py-6">
            {/* Hero Section */}
            <section className="relative rounded-3xl bg-linear-to-br from-primary/10 via-background to-accent/30 p-8 sm:p-12 lg:p-16 border border-border text-center overflow-hidden">
                <div className="relative z-10 mx-auto max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="h-3.5 w-3.5" /> Next-Gen Rental Platform
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                        Find Your Dream Home with <span className="text-primary">RentNest</span>
                    </h1>

                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Seamlessly search, rent, and manage properties. A unified experience designed for tenants, landlords, and property managers.
                    </p>

                    {/* Search Bar Redirect */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button asChild size="lg" className="w-full sm:w-auto gap-2 text-base px-8">
                            <Link href="/properties">
                                <Search className="h-5 w-5" /> Browse All Listings
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base">
                            <Link href="/register">
                                List Your Property <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Properties */}
            <section className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border pb-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Properties</h2>
                        <p className="text-sm text-muted-foreground">Handpicked rental homes available right now</p>
                    </div>
                    <Button asChild variant="ghost" className="gap-1 text-primary">
                        <Link href="/properties">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURED_PROPERTIES.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            </section>

            {/* Value Proposition Highlights */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">Verified Listings</h3>
                    <p className="text-sm text-muted-foreground">
                        Every property on RentNest is reviewed and verified by our admin team for maximum authenticity.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">Seamless Payments</h3>
                    <p className="text-sm text-muted-foreground">
                        Pay security deposits and monthly rent online with automated receipts and payment tracking.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">Direct Communication</h3>
                    <p className="text-sm text-muted-foreground">
                        Connect directly with verified landlords and schedule property viewings hassle-free.
                    </p>
                </div>
            </section>
        </div>
    );
}