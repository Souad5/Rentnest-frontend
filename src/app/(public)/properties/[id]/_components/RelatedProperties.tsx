'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Building2, RefreshCw } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import PropertyCard, { PropertyCardSkeleton } from '@/components/shared/PropertyCard';
import { Button } from '@/components/ui/button';
import { propertiesApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export function RelatedProperties({ propertyId, hrefQuery }: { propertyId: string; hrefQuery?: string }) {
    const query = useQuery({
        queryKey: ['property-related', propertyId, 4],
        queryFn: async () => (await propertiesApi.related(propertyId, 4)).data,
        staleTime: 5 * 60 * 1000,
    });

    if (query.isPending) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
                {Array.from({ length: 4 }, (_, i) => (
                    <PropertyCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (query.isError) {
        return (
            <div
                role="alert"
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center"
            >
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <p className="text-sm text-muted-foreground">We couldn&apos;t load similar homes.</p>
                <Button
                    variant="outline"
                    className="h-9 rounded-xl"
                    onClick={() => query.refetch()}
                    disabled={query.isFetching}
                >
                    <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} /> Retry
                </Button>
            </div>
        );
    }

    if (query.data.length === 0) {
        return (
            <EmptyState
                icon={Building2}
                title="No similar homes right now"
                description="There are no other available listings in this category or area at the moment."
                action={
                    <Button asChild className="h-10 rounded-xl px-4">
                        <Link href="/properties">Browse all homes</Link>
                    </Button>
                }
            />
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {query.data.map((property) => (
                <PropertyCard key={property.id} property={property} hrefQuery={hrefQuery} />
            ))}
        </div>
    );
}
