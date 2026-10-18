'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Check, Inbox, RefreshCw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ConfirmDialog, PropertyCell, QueryErrorState, errorMessage, paymentLabel } from '@/components/dashboard/landlord/shared';
import { ApiError, landlordApi } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { RentalRequest } from '@/types/api';

const DAY = 24 * 60 * 60 * 1000;

function duration(start: string, end: string) {
    const nights = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / DAY));
    const months = nights / 30;
    if (months >= 1) {
        const rounded = Math.round(months * 10) / 10;
        return `${nights} nights · ~${rounded} ${rounded === 1 ? 'month' : 'months'}`;
    }
    return `${nights} ${nights === 1 ? 'night' : 'nights'}`;
}

type Decision = { request: RentalRequest; status: 'APPROVED' | 'REJECTED' };

export default function LandlordRequestsPage() {
    const queryClient = useQueryClient();
    const query = useQuery({ queryKey: ['landlord', 'requests'], queryFn: () => landlordApi.requests().then((r) => r.data) });
    const requests = useMemo(() => query.data ?? [], [query.data]);
    const [decision, setDecision] = useState<Decision | null>(null);

    const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

    const decide = useMutation({
        mutationFn: ({ request, status }: Decision) => landlordApi.updateRequestStatus(request.id, status),
        onSuccess: (_data, { request, status }) => {
            toast.success(status === 'APPROVED' ? 'Request approved' : 'Request rejected', {
                description:
                    status === 'APPROVED'
                        ? `${request.tenant?.name ?? 'The tenant'} can now pay to activate the rental.`
                        : `${request.tenant?.name ?? 'The tenant'} will see the rejection in their dashboard.`,
            });
            setDecision(null);
            queryClient.invalidateQueries({ queryKey: ['landlord'] });
        },
        onError: (error) => {
            const message = errorMessage(error, 'Could not update this request.');
            if (error instanceof ApiError && error.status === 409) {
                toast.error('Dates already booked', { description: message });
            } else {
                toast.error(message);
            }
            setDecision(null);
            // A 400 usually means the request changed elsewhere; refresh the list.
            queryClient.invalidateQueries({ queryKey: ['landlord', 'requests'] });
        },
    });

    const columns = useMemo<ColumnDef<RentalRequest>[]>(
        () => [
            {
                id: 'tenant',
                header: 'Tenant',
                accessorFn: (row) => `${row.tenant?.name ?? ''} ${row.tenant?.email ?? ''}`,
                cell: ({ row }) => (
                    <div className="min-w-36">
                        <p className="text-sm font-semibold text-foreground">{row.original.tenant?.name ?? 'Unknown tenant'}</p>
                        {row.original.tenant?.email && (
                            <a href={`mailto:${row.original.tenant.email}`} className="text-xs text-muted-foreground hover:text-primary">
                                {row.original.tenant.email}
                            </a>
                        )}
                    </div>
                ),
            },
            {
                id: 'property',
                header: 'Property',
                accessorFn: (row) => row.property?.title ?? '',
                cell: ({ row }) => <PropertyCell property={row.original.property} />,
            },
            {
                id: 'dates',
                header: 'Dates',
                accessorFn: (row) => row.startDate,
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-sm">
                        <p className="font-medium text-foreground">
                            {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">{duration(row.original.startDate, row.original.endDate)}</p>
                    </div>
                ),
            },
            {
                id: 'requested',
                header: 'Requested',
                accessorFn: (row) => row.createdAt,
                cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
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
                    return (
                        <div className="whitespace-nowrap">
                            <p className={cn('text-xs font-medium', pay.tone)}>{pay.label}</p>
                            {row.original.payment?.status === 'COMPLETED' && (
                                <p className="text-xs text-muted-foreground">{formatPrice(row.original.payment.amount)}</p>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => {
                    const r = row.original;
                    if (r.status !== 'PENDING') {
                        return <span className="block text-right text-xs text-muted-foreground">No action needed</span>;
                    }
                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" className="h-8 rounded-xl px-3" onClick={() => setDecision({ request: r, status: 'APPROVED' })}>
                                <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 rounded-xl px-3"
                                onClick={() => setDecision({ request: r, status: 'REJECTED' })}
                            >
                                <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const approving = decision?.status === 'APPROVED';

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Rental requests"
                description={
                    query.isSuccess
                        ? pendingCount
                            ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} waiting for your decision.`
                            : 'You are all caught up.'
                        : 'Approve or reject requests for your listings.'
                }
                action={
                    <Button variant="outline" className="h-10 rounded-xl" onClick={() => query.refetch()} disabled={query.isFetching}>
                        <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} /> Refresh
                    </Button>
                }
            />

            {query.isError ? (
                <QueryErrorState title="Could not load requests" error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : (
                <AppDataTable
                    columns={columns}
                    data={requests}
                    loading={query.isPending}
                    loadingMessage="Loading requests…"
                    searchPlaceholder="Search tenant, email or property…"
                    rightAlignColumnId="actions"
                    filters={[
                        {
                            columnId: 'status',
                            placeholder: 'All statuses',
                            options: [
                                { label: 'Pending', value: 'PENDING' },
                                { label: 'Approved', value: 'APPROVED' },
                                { label: 'Active', value: 'ACTIVE' },
                                { label: 'Completed', value: 'COMPLETED' },
                                { label: 'Rejected', value: 'REJECTED' },
                            ],
                        },
                        {
                            columnId: 'payment',
                            placeholder: 'Any payment',
                            options: [
                                { label: 'Paid', value: 'Paid' },
                                { label: 'Awaiting payment', value: 'Awaiting payment' },
                                { label: 'Payment started', value: 'Payment started' },
                                { label: 'Payment failed', value: 'Payment failed' },
                                { label: 'Not due', value: 'Not due' },
                            ],
                        },
                    ]}
                    emptyState={
                        <EmptyState
                            icon={Inbox}
                            title={requests.length ? 'No requests match your filters' : 'No rental requests yet'}
                            description={
                                requests.length
                                    ? 'Try another filter or clear the search.'
                                    : 'Requests from tenants appear here. Complete listings with photos and amenities attract more of them.'
                            }
                            className="border-0"
                        />
                    }
                />
            )}

            <ConfirmDialog
                open={!!decision}
                onOpenChange={(open) => !open && setDecision(null)}
                title={approving ? 'Approve this request?' : 'Reject this request?'}
                description={
                    decision && (
                        <>
                            <span className="font-semibold text-foreground">{decision.request.tenant?.name ?? 'This tenant'}</span> wants{' '}
                            <span className="font-semibold text-foreground">{decision.request.property?.title ?? 'your property'}</span> from{' '}
                            {formatDate(decision.request.startDate)} to {formatDate(decision.request.endDate)}.{' '}
                            {approving
                                ? 'They will be asked to pay the first month to activate the rental. Overlapping requests can no longer be approved.'
                                : 'The tenant will see the request as rejected. This cannot be undone.'}
                        </>
                    )
                }
                confirmLabel={approving ? 'Approve request' : 'Reject request'}
                destructive={!approving}
                loading={decide.isPending}
                onConfirm={() => decision && decide.mutate(decision)}
            />
        </div>
    );
}
