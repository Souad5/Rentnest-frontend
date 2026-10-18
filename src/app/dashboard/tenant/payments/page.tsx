'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Clock, CreditCard, Receipt, RefreshCw, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { CopyButton, PropertyCell, QueryErrorState } from '@/components/dashboard/landlord/shared';
import { paymentsApi } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Payment } from '@/types/api';

export default function TenantPaymentsPage() {
    const query = useQuery({ queryKey: ['tenant', 'payments'], queryFn: () => paymentsApi.mine().then((r) => r.data) });
    const payments = useMemo(() => query.data ?? [], [query.data]);

    const summary = useMemo(() => {
        const completed = payments.filter((p) => p.status === 'COMPLETED');
        return {
            totalPaid: completed.reduce((sum, p) => sum + p.amount, 0),
            completed: completed.length,
            pending: payments.filter((p) => p.status === 'PENDING').length,
            lastPaid: completed
                .map((p) => p.paidAt)
                .filter(Boolean)
                .sort()
                .pop(),
        };
    }, [payments]);

    const columns = useMemo<ColumnDef<Payment>[]>(
        () => [
            {
                id: 'property',
                header: 'Property',
                accessorFn: (row) => `${row.rentalRequest?.property?.title ?? ''} ${row.transactionId}`,
                cell: ({ row }) => <PropertyCell property={row.original.rentalRequest?.property} />,
            },
            {
                accessorKey: 'amount',
                header: 'Amount',
                cell: ({ row }) => (
                    <span className="whitespace-nowrap text-sm font-semibold text-foreground">{formatMoney(row.original.amount)}</span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                filterFn: 'equalsString',
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                id: 'paidAt',
                header: 'Paid at',
                accessorFn: (row) => row.paidAt ?? row.createdAt,
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-sm">
                        <p className="text-foreground">
                            {row.original.paidAt
                                ? formatDate(row.original.paidAt, { dateStyle: 'medium', timeStyle: 'short' })
                                : 'Not paid yet'}
                        </p>
                        <p className="text-xs text-muted-foreground">Started {formatDate(row.original.createdAt)}</p>
                    </div>
                ),
            },
            {
                id: 'transaction',
                header: 'Transaction ID',
                enableSorting: false,
                accessorFn: (row) => row.transactionId,
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <code className="max-w-40 truncate rounded-lg bg-muted px-2 py-1 font-mono text-xs text-muted-foreground" title={row.original.transactionId}>
                            {row.original.transactionId}
                        </code>
                        <CopyButton value={row.original.transactionId} label="Copy transaction ID" />
                    </div>
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Payments"
                description="Every payment you've made through RentNest, processed securely by Stripe."
                action={
                    <Button variant="outline" className="h-10 rounded-xl" onClick={() => query.refetch()} disabled={query.isFetching}>
                        <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} /> Refresh
                    </Button>
                }
            />

            {query.isError ? (
                <QueryErrorState title="Could not load your payments" error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Total paid" value={formatMoney(summary.totalPaid)} icon={Wallet} tone="ink" loading={query.isPending} />
                        <StatCard label="Completed" value={summary.completed} icon={CheckCircle2} loading={query.isPending} />
                        <StatCard label="In progress" value={summary.pending} icon={Clock} tone="highlight" loading={query.isPending} hint="Started but not confirmed" />
                        <StatCard
                            label="Last payment"
                            value={summary.lastPaid ? formatDate(summary.lastPaid) : '—'}
                            icon={Receipt}
                            tone="muted"
                            loading={query.isPending}
                        />
                    </div>

                    <AppDataTable
                        columns={columns}
                        data={payments}
                        loading={query.isPending}
                        loadingMessage="Loading payments…"
                        searchPlaceholder="Search property or transaction ID…"
                        filters={[
                            {
                                columnId: 'status',
                                placeholder: 'All statuses',
                                options: [
                                    { label: 'Completed', value: 'COMPLETED' },
                                    { label: 'Pending', value: 'PENDING' },
                                    { label: 'Failed', value: 'FAILED' },
                                ],
                            },
                        ]}
                        emptyState={
                            <EmptyState
                                icon={CreditCard}
                                title={payments.length ? 'No payments match your filters' : 'No payments yet'}
                                description={
                                    payments.length
                                        ? 'Try another status or clear the search.'
                                        : 'Once a landlord approves your request you can pay from My Requests.'
                                }
                                action={
                                    payments.length ? undefined : (
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
