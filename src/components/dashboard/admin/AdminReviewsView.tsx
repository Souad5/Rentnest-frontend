'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { MessageSquareQuote, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { ApiEnvelope } from '@/types/api';
import { ConfirmDialog } from './ConfirmDialog';
import { CountPills, ErrorState, TableSkeleton } from './AdminStates';
import { RatingStars } from './RatingStars';
import type { AdminReview } from './types';
import { adminKeys, errorMessage, useAdminCache, useAdminQuery } from './useAdminQuery';

const fetchReviews = () => adminApi.reviews() as Promise<ApiEnvelope<AdminReview[]>>;
const TRUNCATE_AT = 90;

export function AdminReviewsView() {
    const query = useAdminQuery<AdminReview[]>(adminKeys.reviews, fetchReviews);
    const cache = useAdminCache<AdminReview>(adminKeys.reviews);
    const [reading, setReading] = useState<AdminReview | null>(null);
    const [toDelete, setToDelete] = useState<AdminReview | null>(null);
    const [deleting, setDeleting] = useState(false);

    const reviews = useMemo(() => query.data ?? [], [query.data]);
    const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    const confirmDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await adminApi.deleteReview(toDelete.id);
            cache.remove(toDelete.id);
            cache.invalidateStats(adminKeys.properties);
            toast.success('Review deleted');
            setToDelete(null);
            setReading((current) => (current?.id === toDelete.id ? null : current));
        } catch (error) {
            toast.error(errorMessage(error, 'Could not delete this review'));
        } finally {
            setDeleting(false);
        }
    };

    const columns = useMemo<ColumnDef<AdminReview>[]>(
        () => [
            {
                id: 'tenant',
                header: 'Tenant',
                accessorFn: (r) => `${r.tenant?.name ?? ''} ${r.tenant?.email ?? ''}`,
                cell: ({ row }) => (
                    <div className="min-w-[140px]">
                        <p className="truncate text-sm text-foreground">{row.original.tenant?.name ?? 'Former tenant'}</p>
                        {row.original.tenant?.email && <p className="truncate text-xs text-muted-foreground">{row.original.tenant.email}</p>}
                    </div>
                ),
            },
            {
                id: 'property',
                header: 'Property',
                accessorFn: (r) => r.property?.title ?? '',
                cell: ({ row }) => {
                    const p = row.original.property;
                    return p ? (
                        <div className="min-w-[160px]">
                            <Link href={`/properties/${p.id}`} className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary hover:underline">
                                {p.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">{p.location}</p>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">Removed listing</span>
                    );
                },
            },
            {
                id: 'rating',
                header: 'Rating',
                accessorFn: (r) => String(r.rating),
                filterFn: 'equalsString',
                enableGlobalFilter: false,
                sortingFn: (a, b) => a.original.rating - b.original.rating,
                cell: ({ row }) => <RatingStars rating={row.original.rating} />,
            },
            {
                id: 'comment',
                header: 'Comment',
                accessorFn: (r) => r.comment,
                enableSorting: false,
                cell: ({ row }) => {
                    const { comment } = row.original;
                    const long = comment.length > TRUNCATE_AT;
                    return (
                        <div className="min-w-[220px] max-w-sm text-sm text-muted-foreground">
                            <p className="line-clamp-2">{comment}</p>
                            {long && (
                                <button
                                    type="button"
                                    className="mt-0.5 text-xs font-medium text-primary hover:underline"
                                    onClick={() => setReading(row.original)}
                                >
                                    Read full review
                                </button>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'date',
                header: 'Date',
                enableGlobalFilter: false,
                accessorFn: (r) => r.createdAt,
                cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
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
                        aria-label={`Delete review by ${row.original.tenant?.name ?? 'tenant'}`}
                        onClick={() => setToDelete(row.original)}
                    >
                        <Trash2 />
                    </Button>
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Reviews"
                description="Tenant reviews shown on listing pages. Remove reviews that are abusive, fake or off-topic."
            />

            {query.isPending ? (
                <TableSkeleton columns={6} />
            ) : query.isError ? (
                <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : reviews.length === 0 ? (
                <EmptyState icon={MessageSquareQuote} title="No reviews yet" description="Tenants can review a property after renting it." />
            ) : (
                <>
                    <CountPills
                        items={[
                            { label: 'Reviews', value: reviews.length },
                            { label: 'Average rating', value: average.toFixed(1) },
                            { label: 'Low (1–2★)', value: reviews.filter((r) => r.rating <= 2).length },
                        ]}
                    />
                    <AppDataTable
                        columns={columns}
                        data={reviews}
                        searchPlaceholder="Search tenant, property or comment…"
                        filters={[
                            {
                                columnId: 'rating',
                                placeholder: 'Any rating',
                                options: [5, 4, 3, 2, 1].map((n) => ({ label: `${n} star${n === 1 ? '' : 's'}`, value: String(n) })),
                            },
                        ]}
                        emptyMessage="No reviews match your search or filters."
                    />
                </>
            )}

            <Dialog open={!!reading} onOpenChange={(open) => !open && setReading(null)}>
                <DialogContent className="rounded-2xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-lg tracking-tight">Review of {reading?.property?.title ?? 'a removed listing'}</DialogTitle>
                        <DialogDescription>
                            By {reading?.tenant?.name ?? 'a former tenant'} · {formatDate(reading?.createdAt)}
                        </DialogDescription>
                    </DialogHeader>
                    {reading && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <RatingStars rating={reading.rating} />
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3" aria-hidden />
                                    {reading.rating}/5
                                </span>
                            </div>
                            <p className="max-h-[50vh] overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-foreground">{reading.comment}</p>
                        </div>
                    )}
                    <DialogFooter className="rounded-b-2xl">
                        <Button variant="outline" className="rounded-xl" onClick={() => setReading(null)}>
                            Close
                        </Button>
                        <Button variant="destructive" className="rounded-xl" onClick={() => reading && setToDelete(reading)}>
                            <Trash2 />
                            Delete review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!toDelete}
                onOpenChange={(open) => !open && setToDelete(null)}
                title="Delete this review?"
                description={`The ${toDelete?.rating}-star review by ${toDelete?.tenant?.name ?? 'this tenant'} will be removed from the listing and its rating recalculated. This cannot be undone.`}
                confirmLabel="Delete review"
                destructive
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
