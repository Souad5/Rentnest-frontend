'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Building, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/shared/PropertyCard';
import SkeletonCard from '@/components/shared/SkeletonCard';
import { CustomSelect } from '@/components/shared/Select';
import { AppButton } from '@/components/shared/AppButton';
import { cn } from '@/lib/utils';

const BASE_URL = (
    process.env.PUBLIC_API_URL || 'https://rentnest-backend-five.vercel.app/api'
).replace(/\/$/, '');

// Dynamic category filter options matching your API response
const CATEGORY_OPTIONS = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Apartment', value: '7bfa5ebc-d224-4fcb-8653-eabb2c033ada' },
    { label: 'Luxury Villa', value: '3221f106-cb21-4020-bb5b-283e52992653' },
    { label: 'Studio', value: '4331092f-4b2e-401d-9add-0fd525787e5f' },
];

export interface CategoryData {
    id: string;
    name: string;
}

export interface LandlordData {
    id: string;
    name: string;
    email: string;
}

export interface Property {
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
}

function PropertiesContent() {
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Filters (seeded from hero search params)
    const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get('q') ?? '');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

    // Fetch properties from backend GET /properties
    const fetchProperties = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const res = await fetch(`${BASE_URL}/properties`);
            if (!res.ok) {
                throw new Error(`Failed to fetch properties (${res.status})`);
            }
            const json = await res.json();
            const dataList: Property[] = Array.isArray(json)
                ? json
                : json.data || [];
            setProperties(dataList);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error loading properties:', err);
            setFetchError(err.message || 'Could not load properties from server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProperties();
    }, []);

    // Filter properties client-side
    const filteredProperties = useMemo(() => {
        return properties.filter((prop) => {
            const matchesSearch =
                prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prop.address.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesPrice = maxPrice === '' || prop.price <= Number(maxPrice);

            const matchesCategory =
                categoryFilter === 'ALL' || prop.categoryId === categoryFilter;

            return matchesSearch && matchesPrice && matchesCategory;
        });
    }, [properties, searchTerm, maxPrice, categoryFilter]);

    const hasActiveFilters =
        searchTerm !== '' || maxPrice !== '' || categoryFilter !== 'ALL';

    const resetFilters = () => {
        setSearchTerm('');
        setMaxPrice('');
        setCategoryFilter('ALL');
    };

    return (
        <div className=" bg-[#f4f3f0] p-4">
            <div className='max-w-7xl mx-auto space-y-8 py-4'>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-1.5">
                            Rentals &amp; Properties
                        </p>
                        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#1c1d1d] leading-none">
                            Explore properties
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                            Browse verified rental apartments, villas, and studios across premier locations.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm">
                            {filteredProperties.length}{' '}
                            {filteredProperties.length === 1 ? 'property' : 'properties'}
                        </span>
                        <AppButton
                            variant="outline"
                            size="icon"
                            onClick={fetchProperties}
                            title="Reload listings"
                            aria-label="Reload listings"
                            className="h-9 w-9 rounded-full border-neutral-200 bg-white shadow-sm"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </AppButton>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="rounded-[24px] border border-neutral-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search city, address, title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 rounded-full border-neutral-200"
                            />
                        </div>

                        {/* Max Price Filter */}
                        <div className="relative">
                            <Input
                                type="number"
                                min={0}
                                placeholder="Max Rent ($/mo)"
                                value={maxPrice}
                                onChange={(e) =>
                                    setMaxPrice(e.target.value ? Number(e.target.value) : '')
                                }
                                className="h-11 rounded-full border-neutral-200"
                            />
                        </div>

                        {/* Category Select Filter */}
                        <CustomSelect
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                            options={CATEGORY_OPTIONS}
                            className="w-full h-11 cursor-pointer rounded-full"
                        />

                        {/* Reset Action */}
                        <Button
                            variant={hasActiveFilters ? 'default' : 'outline'}
                            onClick={resetFilters}
                            disabled={!hasActiveFilters}
                            className={cn(
                                'w-full gap-2 h-11 rounded-full text-xs font-semibold',
                                hasActiveFilters && 'bg-[#1c1d1d] hover:bg-black text-white',
                            )}
                        >
                            <SlidersHorizontal className="h-4 w-4" /> Reset Filters
                        </Button>
                    </div>
                </div>

                {/* Error Banner */}
                {fetchError && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
                        <span>{fetchError}</span>
                        <Button variant="outline" size="sm" onClick={fetchProperties}>
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Property Cards Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        {filteredProperties.map((property, index) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                priority={index < 3}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-[32px] bg-white/80 border border-dashed border-neutral-300 p-8 space-y-3">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f3f0] ring-1 ring-neutral-200">
                            <Building className="h-6 w-6 text-neutral-400" />
                        </div>
                        <h3 className="font-serif text-xl text-[#1c1d1d]">No properties found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Try adjusting your search criteria or clearing filters to view available listings.
                        </p>
                        {hasActiveFilters && (
                            <AppButton
                                onClick={resetFilters}
                                className="mt-2 bg-[#1c1d1d] hover:bg-black text-white rounded-full px-5 text-xs font-semibold"
                            >
                                Clear all filters
                            </AppButton>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={null}>
            <PropertiesContent />
        </Suspense>
    );
}