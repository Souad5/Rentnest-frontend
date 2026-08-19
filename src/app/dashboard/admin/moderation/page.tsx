'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Building2, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import { AppButton } from '@/components/shared/AppButton';

interface Property {
    id: string;
    title: string;
    description: string;
    address: string;
    location: string;
    price: number;
    isAvailable: boolean;
    category?: { name: string };
    landlord?: { name: string; email: string };
}

export default function AdminModerationPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAdminProperties() {
            try {
                const res = await adminApi.getProperties();
                if (res.success && Array.isArray(res.data)) {
                    setProperties(res.data);
                }
            } catch (err) {
                console.error('Failed to load system properties:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAdminProperties();
    }, []);

    return (
        <div className="space-y-6 py-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Content Moderation</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review and inspect all submitted property listings across the platform.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {properties.map((property) => (
                        <Card key={property.id} className="border-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    {property.title}
                                </CardTitle>
                                <Badge variant={property.isAvailable ? 'secondary' : 'outline'}>
                                    {property.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                                </Badge>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                                    <span>Location: {property.location} ({property.address})</span>
                                    <span className="font-semibold text-foreground">${property.price} / month</span>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {property.description}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                                    <span>Landlord: {property.landlord?.name || 'Unknown'} ({property.landlord?.email})</span>
                                    <AppButton variant="outline" size="sm" className="gap-1.5">
                                        <Eye className="h-4 w-4" /> Inspect Listing
                                    </AppButton>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {properties.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-border rounded-xl">
                            <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No property listings found in the system.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}