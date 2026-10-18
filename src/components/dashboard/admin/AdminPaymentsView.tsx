'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { CircleAlert, Clock, CreditCard, Wallet } from 'lucide-react';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { adminApi } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import type { ApiEnvelope } from '@/types/api';
import { ErrorState, TableSkeleton } from './AdminStates';
import { CopyButton } from './CopyButton';
import type { AdminPayment } from './types';
import { adminKeys, errorMessage, useAdminQuery } from './useAdminQuery';

const fetchPayments = () => adminApi.payments() as unknown as Promise<ApiEnvelope<AdminPayment[]>>;

export function AdminPaymentsView() {
    const query = useAdminQuery<AdminPayment[]>(adminKeys.payments, fetchPayments);
    const payments = useMemo(() => query.data ?? [], [query.data]);

    const summary = useMemo(() => {
        const completed = payments.filter((p) => p.status === 'COMPLETED');
        return {
            revenue: completed.reduce((sum, p) => sum + (p.amount || 0), 0),
            completed: completed.length,
            pending: payments.filter((p) => p.status === 'PENDING').length,
            failed: payments.filter((p) => p.status === 'FAILED').length,
        };
    }, [payments]);

    const columns = useMemo<ColumnDef<AdminPayment>[]>(
        () => [
            {
                id: 'transaction',
                header: 'Transaction',
                accessorFn: (p) => p.transactionId,
                cell: ({ row }) => (
                    <div className="flex min-w-[170px] items-center gap-1">
                        <code className="max-w-[140px] truncate rounded-lg bg-muted px-2 py-1 font-mono text-xs text-foreground" title={row.original.transactionId}>
                            {row.original.transactionId}
                        </code>
                        <CopyButton value={row.original.transactionId} label="Copy transaction ID" successMessage="Transaction ID copied" />
                    </div>
                ),
            },
            {
                id: 'tenant',
                header: 'Tenant',
                accessorFn: (p) => {
                    const t = p.rentalRequest?.tenant ?? p.user;
                    return `${t?.name ?? ''} ${t?.email ?? ''}`;
                },
                cell: ({ row }) => {
                    const t = row.original.rentalRequest?.tenant ?? row.original.user;
                    return (
                        <div className="min-w-[150px]">
                            <p className="truncate text-sm text-foreground">{t?.name ?? 'Unknown'}</p>
                            {t?.email && <p className="truncate text-xs text-muted-foreground">{t.email}</p>}
                        </div>
                    );
                },
            },
            {
                id: 'property',
                header: 'Property',
                accessorFn: (p) => p.rentalRequest?.property?.title ?? '',
                cell: ({ row }) => {
                    const prop = row.original.rentalRequest?.property;
                    return prop ? (
                        <Link
                            href={`/properties/${prop.id}`}
                            className="line-clamp-1 min-w-[160px] text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                            {prop.title}
                        </Link>
                    ) : (
                        <span className="text-sm text-muted-foreground">Removed listing</span>
                    );
                },
            },
            {
                id: 'amount',
                header: 'Amount',
                enableGlobalFilter: false,
                accessorFn: (p) => p.amount,
                cell: ({ row }) => (
                    <div className="whitespace-nowrap">
                        <p className="text-sm font-semibold text-foreground">{formatMoney(row.original.amount)}</p>
                        <p className="text-xs capitalize text-muted-foreground">{row.original.provider?.toLowerCase()}</p>
                    </div>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                accessorFn: (p) => p.status,
                filterFn: 'equalsString',
                cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
            },
            {
                id: 'paidAt',
                header: 'Paid at',
                enableGlobalFilter: false,
                accessorFn: (p) => p.paidAt ?? '',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-sm text-muted-foreground">
                        {row.original.paidAt ? (
                            formatDate(row.original.paidAt, { dateStyle: 'medium', timeStyle: 'short' })
                        ) : (
                            <span className="text-xs">Created {formatDate(row.original.createdAt)}</span>
                        )}
                    </div>
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-6">
            <DashboardPageHeader title="Payments" description="Rent payments processed through Stripe across all RentNest rentals." />

            {!query.isError && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total revenue" value={formatMoney(summary.revenue)} icon={Wallet} hint="Completed payments only" loading={query.isPending} />
                    <StatCard label="Completed" value={summary.completed} icon={CreditCard} tone="ink" loading={query.isPending} />
                    <StatCard label="Pending" value={summary.pending} icon={Clock} tone="highlight" hint="Awaiting confirmation" loading={query.isPending} />
                    <StatCard label="Failed" value={summary.failed} icon={CircleAlert} tone="muted" loading={query.isPending} />
                </div>
            )}

            {query.isPending ? (
                <TableSkeleton columns={6} />
            ) : query.isError ? (
                <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : payments.length === 0 ? (
                <EmptyState icon={CreditCard} title="No payments yet" description="Payments appear here once tenants pay for approved rentals." />
            ) : (
                <AppDataTable
                    columns={columns}
                    data={payments}
                    searchPlaceholder="Search transaction, tenant or property…"
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
                    emptyMessage="No payments match your search or filters."
                />
            )}
        </div>
    );
}
