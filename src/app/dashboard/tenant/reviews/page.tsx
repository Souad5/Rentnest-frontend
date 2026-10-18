'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { MapPin, MessageSquareQuote, RefreshCw, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QueryErrorState, RatingStars } from '@/components/dashboard/landlord/shared';
import { reviewsApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/api';

export default function TenantReviewsPage() {
    const query = useQuery({ queryKey: ['tenant', 'reviews'], queryFn: () => reviewsApi.mine().then((r) => r.data) });
    const reviews = useMemo(() => query.data ?? [], [query.data]);
    const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    const columns = useMemo<ColumnDef<Review>[]>(
        () => [
            {
                id: 'property',
                header: 'Property',
                accessorFn: (row) => `${row.property?.title ?? ''} ${row.property?.location ?? ''}`,
                cell: ({ row }) => {
                    const property = row.original.property;
                    if (!property) return <span className="text-sm text-muted-foreground">Property removed</span>;
                    return (
                        <div className="min-w-40">
                            <Link href={`/properties/${property.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
                                {property.title}
                            </Link>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {property.location}
                            </p>
                        </div>
                    );
                },
            },
            {
                id: 'rating',
                header: 'Rating',
                accessorFn: (row) => String(row.rating),
                filterFn: 'equalsString',
                sortingFn: (a, b) => a.original.rating - b.original.rating,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <RatingStars value={row.original.rating} />
                        <span className="text-xs font-semibold text-foreground">{row.original.rating}.0</span>
                    </div>
                ),
            },
            {
                accessorKey: 'comment',
                header: 'Your review',
                enableSorting: false,
                cell: ({ row }) => (
                    <p className="line-clamp-3 min-w-56 max-w-md text-sm text-muted-foreground" title={row.original.comment}>
                        {row.original.comment}
                    </p>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Date',
                cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
            },
        ],
        [],
    );

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="My reviews"
                description="Reviews you've written for homes you rented. They help other tenants choose with confidence."
                action={
                    <Button variant="outline" className="h-10 rounded-xl" onClick={() => query.refetch()} disabled={query.isFetching}>
                        <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} /> Refresh
                    </Button>
                }
            />

            {query.isError ? (
                <QueryErrorState title="Could not load your reviews" error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <StatCard label="Reviews written" value={reviews.length} icon={MessageSquareQuote} loading={query.isPending} />
                        <StatCard
                            label="Average rating given"
                            value={reviews.length ? average.toFixed(1) : '—'}
                            icon={Star}
                            tone="highlight"
                            loading={query.isPending}
                        />
                    </div>
                    <AppDataTable
                        columns={columns}
                        data={reviews}
                        loading={query.isPending}
                        loadingMessage="Loading your reviews…"
                        searchPlaceholder="Search property or review text…"
                        filters={[
                            {
                                columnId: 'rating',
                                placeholder: 'All ratings',
                                options: [5, 4, 3, 2, 1].map((n) => ({ label: `${n} star${n > 1 ? 's' : ''}`, value: String(n) })),
                            },
                        ]}
                        emptyState={
                            <EmptyState
                                icon={Star}
                                title={reviews.length ? 'No reviews match your filters' : "You haven't written a review yet"}
                                description={
                                    reviews.length
                                        ? 'Try another rating or clear the search.'
                                        : 'Once a request is approved or active, use “Review” on My Requests to rate the home.'
                                }
                                action={
                                    reviews.length ? undefined : (
                                        <Button asChild className="h-10 rounded-xl">
                                            <Link href="/dashboard/tenant/requests">Go to my requests</Link>
                                        </Button>
                                    )
                                }
                                className="border-0"
                            />
                        }
                    />
                </>
            )}
        </div>
    );
}
