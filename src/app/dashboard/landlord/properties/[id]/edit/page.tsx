'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_PROPERTIES } from '@/constants/mockProperties';

interface EditPropertyPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        address: '',
        price: 0,
        bedrooms: 1,
        bathrooms: 1,
        sizeSqFt: 500,
        description: '',
        isAvailable: true,
        imageUrl: '',
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const property = MOCK_PROPERTIES.find((p) => p.id === id);
        if (property) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                title: property.title,
                location: property.location,
                address: property.address || property.location,
                price: property.price,
                bedrooms: property.bedrooms ?? 1,
                bathrooms: property.bathrooms ?? 1,
                sizeSqFt: property.sizeSqFt ?? 500,
                description: property.description,
                isAvailable: property.isAvailable ?? true,
                imageUrl: property.images?.[0] || '',
            });
        }
        setIsLoading(false);
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Insert API save call here
        router.push('/dashboard/landlord');
    };

    if (isLoading) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                Loading property details...
            </div>
        );
    }

    return (
        <div className="space-y-6 py-4 max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/dashboard/landlord">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                </Button>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" /> Edit Property Listing
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Listing Title</label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Modern Luxury Apartment Downtown"
                                required
                            />
                        </div>

                        {/* Location & Address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">City / Neighborhood</label>
                                <Input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Downtown, San Francisco"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Full Address</label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g. 124 Financial District Blvd"
                                    required
                                />
                            </div>
                        </div>

                        {/* Price, Bedrooms, Bathrooms, SqFt */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Monthly Rent ($)</label>
                                <Input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min={0}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Bedrooms</label>
                                <Input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    min={0}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Bathrooms</label>
                                <Input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    min={0}
                                    step="0.5"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Area (Sq Ft)</label>
                                <Input
                                    type="number"
                                    name="sizeSqFt"
                                    value={formData.sizeSqFt}
                                    onChange={handleChange}
                                    min={0}
                                    required
                                />
                            </div>
                        </div>

                        {/* Availability & Main Image URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Status</label>
                                <select
                                    name="isAvailable"
                                    value={formData.isAvailable ? 'true' : 'false'}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, isAvailable: e.target.value === 'true' }))
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="true" className="bg-background text-foreground">Available</option>
                                    <option value="false" className="bg-background text-foreground">Rented / Unavailable</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Cover Image URL</label>
                                <div className="relative">
                                    <Upload className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Write a detailed description of the property..."
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button asChild variant="outline">
                                <Link href="/dashboard/landlord">Cancel</Link>
                            </Button>
                            <Button type="submit" className="gap-2">
                                <Save className="h-4 w-4" /> Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}