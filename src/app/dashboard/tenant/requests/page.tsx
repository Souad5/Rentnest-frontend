'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { ArrowUpRight, CheckCircle2, ClipboardList, CreditCard, RefreshCw, Search, Star, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppDataTable, type AppDataTableFilterOption } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ReviewFormModal } from '@/components/forms/ReviewFormModal';
import { PropertyCell, QueryErrorState, paymentLabel } from '@/components/dashboard/landlord/shared';
import { rentalsApi, reviewsApi } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { RentalRequest } from '@/types/api';

const DAY = 24 * 60 * 60 * 1000;

function nightsBetween(start: string, end: string) {
    return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / DAY));
}

const STATUS_FILTER: AppDataTableFilterOption = {
    columnId: 'status',
    placeholder: 'All statuses',
    options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Rejected', value: 'REJECTED' },
    ],
};

const PAYMENT_FILTER: AppDataTableFilterOption = {
    columnId: 'payment',
    placeholder: 'Any payment',
    options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Awaiting payment', value: 'Awaiting payment' },
        { label: 'Payment started', value: 'Payment started' },
        { label: 'Payment failed', value: 'Payment failed' },
        { label: 'Not due', value: 'Not due' },
    ],
};

type ReviewTarget = { propertyId: string; title: string };

export default function TenantRequestsPage() {
    const queryClient = useQueryClient();
    const requestsQuery = useQuery({ queryKey: ['tenant', 'requests'], queryFn: () => rentalsApi.mine().then((r) => r.data) });
    const reviewsQuery = useQuery({ queryKey: ['tenant', 'reviews'], queryFn: () => reviewsApi.mine().then((r) => r.data) });

    const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Checkout redirects here with ?payment=success once Stripe + backend confirm.
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('payment') === 'success') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPaymentSuccess(true);
            toast.success('Payment successful', { description: 'Your rental is now active.' });
            window.history.replaceState(null, '', window.location.pathname);
            queryClient.invalidateQueries({ queryKey: ['tenant'] });
        }
    }, [queryClient]);

    const reviewedPropertyIds = useMemo(
        () => new Set((reviewsQuery.data ?? []).map((review) => review.property?.id).filter(Boolean) as string[]),
        [reviewsQuery.data],
    );

    const canReview = (request: RentalRequest) =>
        (request.status === 'APPROVED' || request.status === 'ACTIVE') &&
        reviewsQuery.isSuccess &&
        !reviewedPropertyIds.has(request.propertyId);

    // After a successful payment, nudge the tenant to review the home they just activated.
    const reviewPrompt = useMemo(() => {
        if (!paymentSuccess) return null;
        return (
            [...(requestsQuery.data ?? [])]
                .filter((r) => r.status === 'ACTIVE' && r.payment?.status === 'COMPLETED' && reviewsQuery.isSuccess && !reviewedPropertyIds.has(r.propertyId))
                .sort((a, b) => new Date(b.payment?.paidAt ?? b.updatedAt).getTime() - new Date(a.payment?.paidAt ?? a.updatedAt).getTime())[0] ?? null
        );
    }, [paymentSuccess, requestsQuery.data, reviewsQuery.isSuccess, reviewedPropertyIds]);

    const columns = useMemo<ColumnDef<RentalRequest>[]>(
        () => [
            {
                id: 'property',
                header: 'Property',
                accessorFn: (row) => `${row.property?.title ?? ''} ${row.property?.location ?? ''}`,
                cell: ({ row }) => <PropertyCell property={row.original.property} />,
            },
            {
                id: 'dates',
                header: 'Dates',
                accessorFn: (row) => row.startDate,
                cell: ({ row }) => {
                    const r = row.original;
                    const nights = nightsBetween(r.startDate, r.endDate);
                    return (
                        <div className="whitespace-nowrap text-sm">
                            <p className="font-medium text-foreground">
                                {formatDate(r.startDate)} – {formatDate(r.endDate)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {nights} {nights === 1 ? 'night' : 'nights'} · requested {formatDate(r.createdAt)}
                            </p>
                        </div>
                    );
                },
            },
            {
                id: 'rent',
                header: 'Rent',
                accessorFn: (row) => row.property?.price ?? 0,
                cell: ({ row }) => (
                    <span className="whitespace-nowrap text-sm font-semibold text-foreground">
                        {row.original.property ? formatPrice(row.original.property.price) : '—'}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                filterFn: 'equalsString',
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                id: 'payment',
                header: 'Payment',
                accessorFn: (row) => paymentLabel(row).label,
                filterFn: 'equalsString',
                cell: ({ row }) => {
                    const pay = paymentLabel(row.original);
                    return <span className={cn('whitespace-nowrap text-xs font-medium', pay.tone)}>{pay.label}</span>;
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => {
                    const r = row.original;
                    const payable = r.status === 'APPROVED' && r.payment?.status !== 'COMPLETED';
                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            {payable && (
                                <Button asChild size="sm" className="h-8 rounded-xl px-3">
                                    <Link href={`/dashboard/tenant/requests/${r.id}/pay`}>
                                        <CreditCard className="h-3.5 w-3.5" /> Pay now
                                    </Link>
                                </Button>
                            )}
                            {canReview(r) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-xl px-3"
                                    onClick={() => setReviewTarget({ propertyId: r.propertyId, title: r.property?.title ?? 'this property' })}
                                >
                                    <Star className="h-3.5 w-3.5" /> Review
                                </Button>
                            )}
                            <Button asChild size="icon-sm" variant="ghost" className="rounded-lg">
                                <Link href={`/properties/${r.propertyId}`} aria-label={`View ${r.property?.title ?? 'property'}`}>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    );
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [reviewedPropertyIds, reviewsQuery.isSuccess],
    );

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="My rental requests"
                description="Track every request, pay for approved stays and review homes you've rented."
                action={
                    <>
                        <Button
                            variant="outline"
                            className="h-10 rounded-xl"
                            onClick={() => {
                                requestsQuery.refetch();
                                reviewsQuery.refetch();
                            }}
                            disabled={requestsQuery.isFetching}
                        >
                            <RefreshCw className={cn('h-4 w-4', requestsQuery.isFetching && 'animate-spin')} /> Refresh
                        </Button>
                        <Button asChild className="h-10 rounded-xl">
                            <Link href="/properties">
                                <Search className="h-4 w-4" /> Find a home
                            </Link>
                        </Button>
                    </>
                }
            />

            {paymentSuccess && (
                <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1 text-sm">
                        <p className="font-semibold text-foreground">Payment received — your rental is active.</p>
                        {reviewPrompt ? (
                            <p className="text-muted-foreground">
                                Settled in at {reviewPrompt.property?.title ?? 'your new home'}? A short review helps the next tenant.
                            </p>
                        ) : (
                            <p className="text-muted-foreground">A receipt is available under Payments.</p>
                        )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                        {reviewPrompt && (
                            <Button
                                size="sm"
                                className="h-9 rounded-xl px-3"
                                onClick={() =>
                                    setReviewTarget({ propertyId: reviewPrompt.propertyId, title: reviewPrompt.property?.title ?? 'this property' })
                                }
                            >
                                <Star className="h-3.5 w-3.5" /> Leave a review
                            </Button>
                        )}
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            className="h-9 w-9 rounded-xl"
                            onClick={() => setPaymentSuccess(false)}
                            aria-label="Dismiss payment confirmation"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {requestsQuery.isError ? (
                <QueryErrorState
                    title="Could not load your requests"
                    error={requestsQuery.error}
                    onRetry={() => requestsQuery.refetch()}
                    retrying={requestsQuery.isFetching}
                />
            ) : (
                <AppDataTable
                    columns={columns}
                    data={requestsQuery.data ?? []}
                    loading={requestsQuery.isPending}
                    loadingMessage="Loading your requests…"
                    searchPlaceholder="Search by property or area…"
                    filters={[STATUS_FILTER, PAYMENT_FILTER]}
                    rightAlignColumnId="actions"
                    emptyState={
                        <EmptyState
                            icon={ClipboardList}
                            title={requestsQuery.data?.length ? 'No requests match your filters' : 'No rental requests yet'}
                            description={
                                requestsQuery.data?.length
                                    ? 'Try a different status or clear the search.'
                                    : 'Pick a home, choose your dates and send a request — landlords usually reply within a day.'
                            }
                            action={
                                requestsQuery.data?.length ? undefined : (
                                    <Button asChild className="h-10 rounded-xl">
                                        <Link href="/properties">Browse homes</Link>
                                    </Button>
                                )
                            }
                            className="border-0"
                        />
                    }
                />
            )}

            <ReviewFormModal
                open={!!reviewTarget}
                onOpenChange={(open) => !open && setReviewTarget(null)}
                propertyId={reviewTarget?.propertyId}
                propertyTitle={reviewTarget?.title}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['tenant', 'reviews'] });
                    queryClient.invalidateQueries({ queryKey: ['tenant', 'stats'] });
                }}
            />
        </div>
    );
}
