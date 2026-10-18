'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { ArrowUpRight, Building2, Pencil, PlusCircle, RefreshCw, Star, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Switch } from '@/components/shared/Switch';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ConfirmDialog, PropertyCell, QueryErrorState, errorMessage } from '@/components/dashboard/landlord/shared';
import { landlordApi } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ManagedProperty } from '@/types/api';

const QUERY_KEY = ['landlord', 'properties'];

export default function LandlordPropertiesPage() {
    const queryClient = useQueryClient();
    const query = useQuery({ queryKey: QUERY_KEY, queryFn: () => landlordApi.myProperties().then((r) => r.data) });
    const properties = useMemo(() => query.data ?? [], [query.data]);
    const [pendingDelete, setPendingDelete] = useState<ManagedProperty | null>(null);

    const availability = useMutation({
        mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => landlordApi.update(id, { isAvailable }),
        onMutate: async ({ id, isAvailable }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const previous = queryClient.getQueryData<ManagedProperty[]>(QUERY_KEY);
            queryClient.setQueryData<ManagedProperty[]>(QUERY_KEY, (old) =>
                old?.map((p) => (p.id === id ? { ...p, isAvailable } : p)),
            );
            return { previous };
        },
        onError: (error, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous);
            toast.error(errorMessage(error, 'Could not change availability.'));
        },
        onSuccess: (_data, { isAvailable }) => {
            toast.success(isAvailable ? 'Listing is visible to tenants' : 'Listing hidden from search');
            queryClient.invalidateQueries({ queryKey: ['landlord', 'stats'] });
        },
    });

    const remove = useMutation({
        mutationFn: (id: string) => landlordApi.deleteProperty(id),
        onSuccess: () => {
            toast.success('Listing deleted');
            setPendingDelete(null);
            queryClient.invalidateQueries({ queryKey: ['landlord'] });
        },
        onError: (error) => toast.error(errorMessage(error, 'Could not delete the listing.')),
    });

    const categoryOptions = useMemo(
        () =>
            Array.from(new Set(properties.map((p) => p.category?.name).filter(Boolean) as string[]))
                .sort()
                .map((name) => ({ label: name, value: name })),
        [properties],
    );

    const togglingId = availability.isPending ? availability.variables?.id : undefined;

    const columns = useMemo<ColumnDef<ManagedProperty>[]>(
        () => [
            {
                id: 'property',
                header: 'Property',
                accessorFn: (row) => `${row.title} ${row.location} ${row.address}`,
                cell: ({ row }) => <PropertyCell property={row.original} />,
            },
            {
                id: 'category',
                header: 'Category',
                accessorFn: (row) => row.category?.name ?? '',
                filterFn: 'equalsString',
                cell: ({ row }) => (
                    <span className="whitespace-nowrap rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {row.original.category?.name ?? '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'price',
                header: 'Rent',
                cell: ({ row }) => (
                    <span className="whitespace-nowrap text-sm font-semibold text-foreground">
                        {formatPrice(row.original.price)}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </span>
                ),
            },
            {
                id: 'availability',
                header: 'Available',
                accessorFn: (row) => (row.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'),
                filterFn: 'equalsString',
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <label className="flex items-center gap-2 whitespace-nowrap">
                            <Switch
                                checked={p.isAvailable}
                                disabled={togglingId === p.id}
                                onCheckedChange={(checked) => availability.mutate({ id: p.id, isAvailable: checked })}
                                aria-label={`${p.isAvailable ? 'Hide' : 'Show'} ${p.title}`}
                            />
                            <span className={cn('text-xs font-medium', p.isAvailable ? 'text-primary' : 'text-muted-foreground')}>
                                {p.isAvailable ? 'Listed' : 'Hidden'}
                            </span>
                        </label>
                    );
                },
            },
            {
                id: 'requests',
                header: 'Requests',
                accessorFn: (row) => row._count?.rentalRequests ?? 0,
                cell: ({ getValue }) => <span className="text-sm tabular-nums text-foreground">{getValue<number>()}</span>,
            },
            {
                id: 'rating',
                header: 'Rating',
                accessorFn: (row) => row.avgRating ?? 0,
                cell: ({ row }) =>
                    row.original.reviewCount ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm">
                            <Star className="h-3.5 w-3.5 fill-highlight text-highlight" />
                            <span className="font-semibold text-foreground">{row.original.avgRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({row.original.reviewCount})</span>
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">No reviews</span>
                    ),
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <div className="flex items-center justify-end gap-1">
                            <Button asChild variant="ghost" size="icon-sm" className="rounded-lg">
                                <Link href={`/dashboard/landlord/properties/${p.id}/edit`} aria-label={`Edit ${p.title}`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="icon-sm" className="rounded-lg">
                                <Link href={`/properties/${p.id}`} aria-label={`View ${p.title}`}>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setPendingDelete(p)}
                                aria-label={`Delete ${p.title}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [togglingId],
    );

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="My listings"
                description="Manage your properties, pause listings and keep details up to date."
                action={
                    <>
                        <Button variant="outline" className="h-10 rounded-xl" onClick={() => query.refetch()} disabled={query.isFetching}>
                            <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} /> Refresh
                        </Button>
                        <Button asChild className="h-10 rounded-xl">
                            <Link href="/dashboard/landlord/properties/new">
                                <PlusCircle className="h-4 w-4" /> Add property
                            </Link>
                        </Button>
                    </>
                }
            />

            {query.isError ? (
                <QueryErrorState title="Could not load your listings" error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : (
                <AppDataTable
                    columns={columns}
                    data={properties}
                    loading={query.isPending}
                    loadingMessage="Loading your listings…"
                    searchPlaceholder="Search title, area or address…"
                    rightAlignColumnId="actions"
                    filters={[
                        {
                            columnId: 'availability',
                            placeholder: 'Any availability',
                            options: [
                                { label: 'Listed', value: 'AVAILABLE' },
                                { label: 'Hidden', value: 'UNAVAILABLE' },
                            ],
                        },
                        ...(categoryOptions.length > 1
                            ? [{ columnId: 'category', placeholder: 'All categories', options: categoryOptions }]
                            : []),
                    ]}
                    emptyState={
                        <EmptyState
                            icon={Building2}
                            title={properties.length ? 'No listings match your filters' : 'You have no listings yet'}
                            description={
                                properties.length
                                    ? 'Try another filter or clear the search.'
                                    : 'Add your first property — tenants across Bangladesh can request it as soon as it is published.'
                            }
                            action={
                                properties.length ? undefined : (
                                    <Button asChild className="h-10 rounded-xl">
                                        <Link href="/dashboard/landlord/properties/new">
                                            <PlusCircle className="h-4 w-4" /> Add property
                                        </Link>
                                    </Button>
                                )
                            }
                            className="border-0"
                        />
                    }
                />
            )}

            <ConfirmDialog
                open={!!pendingDelete}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                title="Delete this listing?"
                description={
                    <>
                        <span className="font-semibold text-foreground">{pendingDelete?.title}</span> will be removed permanently,
                        along with its rental requests, payment records and reviews. This can&apos;t be undone — to stop new requests temporarily, hide it
                        instead.
                    </>
                }
                confirmLabel="Delete listing"
                destructive
                loading={remove.isPending}
                onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
            />
        </div>
    );
}
