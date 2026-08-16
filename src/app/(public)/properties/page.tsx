'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/shared/PropertyCard';
import SkeletonCard from '@/components/shared/SkeletonCard';
import { MOCK_PROPERTIES } from '@/constants/mockProperties';
import { CustomSelect } from '@/components/shared/Select';

const BEDROOM_OPTIONS = [
    { label: 'All Bedrooms', value: 'ALL' },
    { label: '1 Bedroom', value: '1' },
    { label: '2 Bedrooms', value: '2' },
    { label: '3 Bedrooms', value: '3' },
    { label: '4+ Bedrooms', value: '4+' },
];

export default function PropertiesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    const [bedroomsFilter, setBedroomsFilter] = useState<string>('ALL');
    const [isLoading] = useState(false);

    const filteredProperties = useMemo(() => {
        return MOCK_PROPERTIES.filter((prop) => {
            const matchesSearch =
                prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prop.location.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesPrice = maxPrice === '' || prop.price <= Number(maxPrice);

            const beds = prop.bedrooms ?? 0;
            const matchesBeds =
                bedroomsFilter === 'ALL' ||
                (bedroomsFilter === '4+' ? beds >= 4 : beds === Number(bedroomsFilter));

            return matchesSearch && matchesPrice && matchesBeds;
        });
    }, [searchTerm, maxPrice, bedroomsFilter]);

    const hasActiveFilters = searchTerm !== '' || maxPrice !== '' || bedroomsFilter !== 'ALL';

    return (
        <div className="space-y-8 py-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Explore Properties</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Browse verified rental apartments, homes, and studios across premier locations.
                    </p>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                    Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                </span>
            </div>

            {/* Filter Toolbar */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by city or title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Max Price Filter */}
                    <div className="relative">
                        <Input
                            type="number"
                            placeholder="Max Price ($/mo)"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                        />
                    </div>

                    {/* Bedrooms Select Component */}
                    <CustomSelect
                        value={bedroomsFilter}
                        onValueChange={setBedroomsFilter}
                        options={BEDROOM_OPTIONS}
                        className="w-full cursor-pointer"
                    />

                    {/* Reset Action */}
                    <Button
                        variant={hasActiveFilters ? 'default' : 'outline'}
                        onClick={() => {
                            setSearchTerm('');
                            setMaxPrice('');
                            setBedroomsFilter('ALL');
                        }}
                        className="w-full gap-2"
                        disabled={!hasActiveFilters}
                    >
                        <SlidersHorizontal className="h-4 w-4" /> Reset Filters
                    </Button>
                </div>
            </div>

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
                        <Button
                            variant="link"
                            onClick={() => {
                                setSearchTerm('');
                                setMaxPrice('');
                                setBedroomsFilter('ALL');
                            }}
                        >
                            Clear all filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}