'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Building2, Bed, Bath, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { MOCK_PROPERTIES } from '@/constants/mockProperties';

export default function LandlordPropertiesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [properties, setProperties] = useState(MOCK_PROPERTIES);

    const filteredProperties = properties.filter((prop) =>
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        setProperties((prev) => prev.filter((prop) => prop.id !== id));
    };

    return (
        <div className="space-y-6 py-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Properties</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your active listings, edit property details, and add new rentals.
                    </p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/dashboard/landlord/properties/new">
                        <Plus className="h-4 w-4" /> Add New Property
                    </Link>
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search your listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Property Grid / List */}
            {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                        <Card key={property.id} className="border-border overflow-hidden flex flex-col justify-between">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-lg line-clamp-1 text-foreground">
                                        {property.title}
                                    </h3>
                                    <StatusBadge status={property.isAvailable ? 'AVAILABLE' : 'RENTED'} />
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {property.address || property.location}
                                </p>

                                <div className="text-xl font-bold text-primary">
                                    ${property.price}
                                    <span className="text-xs font-normal text-muted-foreground"> / mo</span>
                                </div>

                                {/* Key Specs */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                                    <span className="flex items-center gap-1">
                                        <Bed className="h-3.5 w-3.5" /> {property.bedrooms ?? 0} Beds
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Bath className="h-3.5 w-3.5" /> {property.bathrooms ?? 0} Baths
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Square className="h-3.5 w-3.5" /> {property.sizeSqFt ?? 0} sqft
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                                        <Link href={`/properties/${property.id}`}>
                                            <Eye className="h-3.5 w-3.5" /> View
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                                        <Link href={`/dashboard/landlord/properties/${property.id}/edit`}>
                                            <Edit className="h-3.5 w-3.5" /> Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(property.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-xl p-8 space-y-3">
                    <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold">No properties found</h3>
                    <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'No listings match your search criteria.' : 'You haven’t added any properties yet.'}
                    </p>
                </div>
            )}
        </div>
    );
}