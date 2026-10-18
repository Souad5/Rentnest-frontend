'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { CalendarDays, CheckCircle2, Clock, RefreshCw, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { CopyButton, MoneyAreaChart, PropertyCell, QueryErrorState, hasMonthData } from '@/components/dashboard/landlord/shared';
import { landlordApi } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Payment } from '@/types/api';

export default function LandlordEarningsPage() {
    const paymentsQuery = useQuery({ queryKey: ['landlord', 'payments'], queryFn: () => landlordApi.payments().then((r) => r.data) });
    const statsQuery = useQuery({ queryKey: ['landlord', 'stats'], queryFn: () => landlordApi.stats().then((r) => r.data) });
    const payments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);

    const summary = useMemo(() => {
        const completed = payments.filter((p) => p.status === 'COMPLETED');
        const now = new Date();
        const thisMonth = completed.filter((p) => {
            if (!p.paidAt) return false;
            const d = new Date(p.paidAt);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
        return {
            total: completed.reduce((s, p) => s + p.amount, 0),
            thisMonth: thisMonth.reduce((s, p) => s + p.amount, 0),
            completed: completed.length,
            pending: payments.filter((p) => p.status === 'PENDING').length,
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
                id: 'tenant',
                header: 'Tenant',
                accessorFn: (row) => `${row.rentalRequest?.tenant?.name ?? ''} ${row.rentalRequest?.tenant?.email ?? ''}`,
                cell: ({ row }) => (
                    <div className="min-w-32">
                        <p className="text-sm font-medium text-foreground">{row.original.rentalRequest?.tenant?.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{row.original.rentalRequest?.tenant?.email}</p>
                    </div>
                ),
            },
            {
                accessorKey: 'amount',
                header: 'Amount',
                cell: ({ row }) => <span className="whitespace-nowrap text-sm font-semibold text-foreground">{formatMoney(row.original.amount)}</span>,
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
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {row.original.paidAt ? formatDate(row.original.paidAt, { dateStyle: 'medium', timeStyle: 'short' }) : 'Not paid yet'}
                    </span>
                ),
            },
            {
                id: 'transaction',
                header: 'Transaction ID',
                enableSorting: false,
                accessorFn: (row) => row.transactionId,
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <code className="max-w-36 truncate rounded-lg bg-muted px-2 py-1 font-mono text-xs text-muted-foreground" title={row.original.transactionId}>
                            {row.original.transactionId}
                        </code>
                        <CopyButton value={row.original.transactionId} label="Copy transaction ID" />
                    </div>
                ),
            },
        ],
        [],
    );

    const loading = paymentsQuery.isPending;

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Earnings"
                description="Payments tenants have made for your properties through Stripe."
                action={
                    <Button
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() => {
                            paymentsQuery.refetch();
                            statsQuery.refetch();
                        }}
                        disabled={paymentsQuery.isFetching}
                    >
                        <RefreshCw className={cn('h-4 w-4', paymentsQuery.isFetching && 'animate-spin')} /> Refresh
                    </Button>
                }
            />

            {paymentsQuery.isError ? (
                <QueryErrorState title="Could not load payments" error={paymentsQuery.error} onRetry={() => paymentsQuery.refetch()} retrying={paymentsQuery.isFetching} />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total earned" value={formatMoney(summary.total)} icon={Wallet} tone="ink" loading={loading} />
                    <StatCard label="This month" value={formatMoney(summary.thisMonth)} icon={CalendarDays} loading={loading} />
                    <StatCard label="Completed payments" value={summary.completed} icon={CheckCircle2} tone="muted" loading={loading} />
                    <StatCard label="In progress" value={summary.pending} icon={Clock} tone="highlight" loading={loading} hint="Checkout started, not confirmed" />
                </div>
            )}

            {statsQuery.isError ? (
                <QueryErrorState title="Could not load the earnings chart" error={statsQuery.error} onRetry={() => statsQuery.refetch()} retrying={statsQuery.isFetching} />
            ) : (
                <ChartCard
                    title="Monthly earnings"
                    description="Completed payments over the last 6 months"
                    loading={statsQuery.isPending}
                    empty={!hasMonthData(statsQuery.data?.monthlyEarnings, 'earnings')}
                    emptyMessage="No earnings in the last 6 months yet."
                >
                    <MoneyAreaChart data={statsQuery.data?.monthlyEarnings ?? []} dataKey="earnings" name="Earnings" />
                </ChartCard>
            )}

            {!paymentsQuery.isError && (
                <AppDataTable
                    columns={columns}
                    data={payments}
                    loading={loading}
                    loadingMessage="Loading payments…"
                    searchPlaceholder="Search property, tenant or transaction…"
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
                            icon={Wallet}
                            title={payments.length ? 'No payments match your filters' : 'No payments yet'}
                            description={
                                payments.length
                                    ? 'Try another status or clear the search.'
                                    : 'When a tenant pays for an approved request, the payment shows up here.'
                            }
                            className="border-0"
                        />
                    }
                />
            )}
        </div>
    );
}
