'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { PropertyForm } from '@/components/dashboard/landlord/PropertyForm';
import { QueryErrorState } from '@/components/dashboard/landlord/shared';
import { propertiesApi } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { propertyToFormValues } from '@/schemas/property.schema';

export default function EditPropertyPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const query = useQuery({
        queryKey: ['landlord', 'property', id],
        queryFn: () => propertiesApi.detail(id).then((r) => r.data),
        enabled: !!id,
        staleTime: 0,
    });

    const property = query.data;
    const canEdit = !!property && !!user && (property.landlordId === user.id || user.role === 'ADMIN');

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <DashboardPageHeader
                title="Edit property"
                description={property ? property.title : 'Update details, photos and availability.'}
                action={
                    property && canEdit ? (
                        <Button asChild variant="outline" className="h-10 rounded-xl">
                            <Link href={`/properties/${property.id}`}>
                                View listing <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    ) : undefined
                }
            />

            {query.isPending ? (
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-56 w-full rounded-2xl" />
                    ))}
                </div>
            ) : query.isError ? (
                <QueryErrorState
                    title="Could not load this property"
                    error={query.error}
                    onRetry={() => query.refetch()}
                    retrying={query.isFetching}
                />
            ) : !property || !canEdit ? (
                <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                        <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">Not your listing</h2>
                        <p className="text-sm text-muted-foreground">You can only edit properties you own.</p>
                    </div>
                    <Button asChild className="h-10 rounded-xl">
                        <Link href="/dashboard/landlord/properties">Back to my listings</Link>
                    </Button>
                </div>
            ) : (
                <PropertyForm key={property.updatedAt} mode="edit" propertyId={property.id} initialValues={propertyToFormValues(property)} />
            )}
        </div>
    );
}
