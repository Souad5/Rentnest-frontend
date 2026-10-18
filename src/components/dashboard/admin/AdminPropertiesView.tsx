'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, ImageOff, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Switch } from '@/components/shared/Switch';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { canOptimizeImage, coverImage } from '@/lib/images';
import type { ManagedProperty } from '@/types/api';
import { ConfirmDialog } from './ConfirmDialog';
import { CountPills, ErrorState, TableSkeleton } from './AdminStates';
import { adminKeys, errorMessage, useAdminCache, useAdminQuery } from './useAdminQuery';

export function AdminPropertiesView() {
    const query = useAdminQuery<ManagedProperty[]>(adminKeys.properties, adminApi.properties);
    const cache = useAdminCache<ManagedProperty>(adminKeys.properties);
    const [pendingToggle, setPendingToggle] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<ManagedProperty | null>(null);
    const [deleting, setDeleting] = useState(false);

    const properties = useMemo(() => query.data ?? [], [query.data]);

    const categoryOptions = useMemo(() => {
        const names = Array.from(new Set(properties.map((p) => p.category?.name).filter(Boolean) as string[]));
        return names.sort().map((name) => ({ label: name, value: name }));
    }, [properties]);

    const toggleAvailability = useCallback(async (property: ManagedProperty, isAvailable: boolean) => {
        const previous = cache.snapshot();
        setPendingToggle(property.id);
        cache.patch(property.id, { isAvailable });
        try {
            await adminApi.setPropertyAvailability(property.id, isAvailable);
            toast.success(isAvailable ? `"${property.title}" is now listed publicly` : `"${property.title}" is hidden from search`);
            cache.invalidateStats();
        } catch (error) {
            cache.restore(previous);
            toast.error(errorMessage(error, 'Could not change availability'));
        } finally {
            setPendingToggle(null);
        }
    }, [cache]);

    const confirmDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await adminApi.deleteProperty(toDelete.id);
            cache.remove(toDelete.id);
            cache.invalidateStats(adminKeys.rentals, adminKeys.payments, adminKeys.reviews, adminKeys.categories);
            toast.success(`"${toDelete.title}" was deleted`);
            setToDelete(null);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not delete this property'));
        } finally {
            setDeleting(false);
        }
    };

    const columns = useMemo<ColumnDef<ManagedProperty>[]>(
        () => [
            {
                id: 'property',
                header: 'Property',
                accessorFn: (p) => `${p.title} ${p.location} ${p.address}`,
                cell: ({ row }) => {
                    const p = row.original;
                    const cover = coverImage(p);
                    return (
                        <div className="flex min-w-[240px] items-center gap-3">
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                                {cover ? (
                                    <Image
                                        src={cover}
                                        alt={p.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                        unoptimized={!canOptimizeImage(cover)}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <ImageOff className="h-4 w-4" aria-hidden />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <Link
                                    href={`/properties/${p.id}`}
                                    className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary hover:underline"
                                >
                                    {p.title}
                                </Link>
                                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                                    {p.location}
                                </p>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'landlord',
                header: 'Landlord',
                accessorFn: (p) => `${p.landlord?.name ?? ''} ${p.landlord?.email ?? ''}`,
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <p className="truncate text-sm text-foreground">{row.original.landlord?.name ?? 'Unknown'}</p>
                        {row.original.landlord?.email && (
                            <a
                                href={`mailto:${row.original.landlord.email}`}
                                className="truncate text-xs text-muted-foreground hover:text-primary"
                            >
                                {row.original.landlord.email}
                            </a>
                        )}
                    </div>
                ),
            },
            {
                id: 'category',
                header: 'Category',
                accessorFn: (p) => p.category?.name ?? '',
                filterFn: 'equalsString',
                cell: ({ getValue }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{getValue<string>() || '—'}</span>,
            },
            {
                id: 'price',
                header: 'Rent',
                enableGlobalFilter: false,
                accessorFn: (p) => p.price,
                cell: ({ row }) => (
                    <span className="whitespace-nowrap text-sm font-medium text-foreground">
                        {formatPrice(row.original.price)}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </span>
                ),
            },
            {
                id: 'availability',
                header: 'Listed',
                accessorFn: (p) => (p.isAvailable ? 'AVAILABLE' : 'HIDDEN'),
                filterFn: 'equalsString',
                enableGlobalFilter: false,
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <label className="flex items-center gap-2 whitespace-nowrap text-xs text-muted-foreground">
                            <Switch
                                checked={p.isAvailable}
                                disabled={pendingToggle === p.id}
                                onCheckedChange={(checked) => toggleAvailability(p, checked)}
                                aria-label={p.isAvailable ? `Hide ${p.title}` : `List ${p.title}`}
                            />
                            {p.isAvailable ? 'Available' : 'Hidden'}
                        </label>
                    );
                },
            },
            {
                id: 'engagement',
                header: 'Engagement',
                enableGlobalFilter: false,
                accessorFn: (p) => p._count?.rentalRequests ?? 0,
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-xs text-muted-foreground">
                        <p>
                            <span className="font-semibold text-foreground">{row.original._count?.rentalRequests ?? 0}</span> requests
                        </p>
                        <p>
                            <span className="font-semibold text-foreground">{row.original._count?.reviews ?? row.original.reviewCount ?? 0}</span>{' '}
                            reviews
                        </p>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                cell: ({ row }) => (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${row.original.title}`}
                        onClick={() => setToDelete(row.original)}
                    >
                        <Trash2 />
                    </Button>
                ),
            },
        ],
        [pendingToggle, toggleAvailability],
    );

    const available = properties.filter((p) => p.isAvailable).length;

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Properties"
                description="Moderate every listing on RentNest: hide listings that break the rules or remove them permanently."
            />

            {query.isPending ? (
                <TableSkeleton columns={6} />
            ) : query.isError ? (
                <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : properties.length === 0 ? (
                <EmptyState icon={Building2} title="No listings yet" description="Properties appear here once landlords publish them." />
            ) : (
                <>
                    <CountPills
                        items={[
                            { label: 'Total', value: properties.length },
                            { label: 'Available', value: available },
                            { label: 'Hidden', value: properties.length - available },
                        ]}
                    />
                    <AppDataTable
                        columns={columns}
                        data={properties}
                        searchPlaceholder="Search title, location or landlord…"
                        filters={[
                            {
                                columnId: 'availability',
                                placeholder: 'Any availability',
                                options: [
                                    { label: 'Available', value: 'AVAILABLE' },
                                    { label: 'Hidden', value: 'HIDDEN' },
                                ],
                            },
                            { columnId: 'category', placeholder: 'All categories', options: categoryOptions },
                        ]}
                        emptyMessage="No properties match your search or filters."
                    />
                </>
            )}

            <ConfirmDialog
                open={!!toDelete}
                onOpenChange={(open) => !open && setToDelete(null)}
                title="Delete this property?"
                description={
                    <>
                        <span className="font-medium text-foreground">{toDelete?.title}</span> and its rental requests, payments and
                        reviews will be permanently removed. This cannot be undone.
                    </>
                }
                confirmLabel="Delete property"
                destructive
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
