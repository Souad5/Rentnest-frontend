'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { landlordApi, propertiesApi, ApiProperty, ApiError } from '@/lib/api';
import { Loader2, Building2, Plus, AlertCircle } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';
import Link from 'next/link';

export default function LandlordPropertiesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [properties, setProperties] = useState<ApiProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const fetchLandlordProperties = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            setError(null);
            // Prefer the authenticated portfolio endpoint (includes rented-out
            // listings); fall back to the public listing for older deploys.
            let mine: ApiProperty[];
            try {
                const res = await landlordApi.getMyProperties();
                mine = res.data ?? [];
            } catch (err) {
                if (err instanceof ApiError && err.status === 404) {
                    const response = await propertiesApi.getAll();
                    const resData = response as unknown as
                        | { data?: ApiProperty[] }
                        | ApiProperty[];
                    const all = Array.isArray(resData) ? resData : resData.data || [];
                    mine = all.filter(
                        (p) => p.landlordId === user.id || p.landlord?.id === user.id
                    );
                } else {
                    throw err;
                }
            }
            setProperties(mine);
        } catch (err) {
            console.error('Failed to load landlord listings:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to load your property listings.'
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLandlordProperties();
    }, [fetchLandlordProperties]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your property listings and view active tenant requests.
                    </p>
                </div>
                <Link href="/dashboard/landlord/properties/new">
                    <AppButton className="gap-2">
                        <Plus className="h-4 w-4" /> Add Property
                    </AppButton>
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <AppButton variant="outline" size="sm" onClick={fetchLandlordProperties} className="h-8 text-xs">
                        Retry
                    </AppButton>
                </div>
            )}

            {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((property) => (
                        <div key={property.id} className="border border-border rounded-xl p-4 space-y-3 bg-card">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg">{property.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{property.address}, {property.location}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <span className="font-bold text-foreground">${property.price} / month</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${property.isAvailable
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {property.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">You haven&apos;t created any property listings yet.</p>
                </div>
            )}
        </div>
    );
}