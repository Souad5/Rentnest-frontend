'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Building, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/shared/PropertyCard';
import SkeletonCard from '@/components/shared/SkeletonCard';
import { CustomSelect } from '@/components/shared/Select';

const BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || 'https://rentnest-backend-five.vercel.app/api'
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

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState<string>('');
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
        <div className=" bg-[#f4f3f0]">
            <div className='max-w-7xl mx-auto space-y-8 py-4'>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Explore Properties
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Browse verified rental apartments, villas, and studios across premier locations.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-medium">
                            Showing {filteredProperties.length}{' '}
                            {filteredProperties.length === 1 ? 'property' : 'properties'}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchProperties}
                            title="Reload listings"
                            className="h-8 w-8 rounded-lg"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search city, address, title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Max Price Filter */}
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="Max Rent ($/mo)"
                                value={maxPrice}
                                onChange={(e) =>
                                    setMaxPrice(e.target.value ? Number(e.target.value) : '')
                                }
                            />
                        </div>

                        {/* Category Select Filter */}
                        <CustomSelect
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                            options={CATEGORY_OPTIONS}
                            className="w-full cursor-pointer"
                        />

                        {/* Reset Action */}
                        <Button
                            variant={hasActiveFilters ? 'default' : 'outline'}
                            onClick={resetFilters}
                            className="w-full gap-2"
                            disabled={!hasActiveFilters}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((property, index) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                priority={index < 3}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-border rounded-2xl p-8 space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Building className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No properties found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Try adjusting your search criteria or clearing filters to view available listings.
                        </p>
                        {hasActiveFilters && (
                            <Button variant="link" onClick={resetFilters}>
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}