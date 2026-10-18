'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { adminApi } from '@/lib/api';
import { formatDate, formatMoney, formatPrice } from '@/lib/format';
import type { ApiEnvelope, RequestStatus } from '@/types/api';
import { CountPills, ErrorState, TableSkeleton } from './AdminStates';
import type { AdminRental } from './types';
import { adminKeys, errorMessage, useAdminQuery } from './useAdminQuery';

const STATUS_ORDER: RequestStatus[] = ['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED'];
const fetchRentals = () => adminApi.rentals() as unknown as Promise<ApiEnvelope<AdminRental[]>>;

function Person({ name, email }: { name?: string; email?: string }) {
    return (
        <div className="min-w-[150px]">
            <p className="truncate text-sm text-foreground">{name ?? 'Unknown'}</p>
            {email && (
                <a href={`mailto:${email}`} className="truncate text-xs text-muted-foreground hover:text-primary">
                    {email}
                </a>
            )}
        </div>
    );
}

export function AdminRentalsView() {
    const query = useAdminQuery<AdminRental[]>(adminKeys.rentals, fetchRentals);
    const rentals = useMemo(() => query.data ?? [], [query.data]);

    const columns = useMemo<ColumnDef<AdminRental>[]>(
        () => [
            {
                id: 'tenant',
                header: 'Tenant',
                accessorFn: (r) => `${r.tenant?.name ?? ''} ${r.tenant?.email ?? ''}`,
                cell: ({ row }) => <Person name={row.original.tenant?.name} email={row.original.tenant?.email} />,
            },
            {
                id: 'property',
                header: 'Property',
                accessorFn: (r) => `${r.property?.title ?? ''} ${r.property?.location ?? ''}`,
                cell: ({ row }) => {
                    const p = row.original.property;
                    if (!p) return <span className="text-sm text-muted-foreground">Removed listing</span>;
                    return (
                        <div className="min-w-[180px]">
                            <Link href={`/properties/${p.id}`} className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary hover:underline">
                                {p.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {p.location ? `${p.location} · ` : ''}
                                {formatPrice(p.price)}/mo
                            </p>
                        </div>
                    );
                },
            },
            {
                id: 'landlord',
                header: 'Landlord',
                accessorFn: (r) => `${r.property?.landlord?.name ?? ''} ${r.property?.landlord?.email ?? ''}`,
                cell: ({ row }) => <Person name={row.original.property?.landlord?.name} email={row.original.property?.landlord?.email} />,
            },
            {
                id: 'dates',
                header: 'Stay',
                enableGlobalFilter: false,
                accessorFn: (r) => r.startDate,
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-xs text-muted-foreground">
                        <p className="flex items-center gap-1 text-sm text-foreground">
                            {formatDate(row.original.startDate)}
                            <ArrowRight className="h-3 w-3 text-muted-foreground" aria-label="to" />
                            {formatDate(row.original.endDate)}
                        </p>
                        <p>Requested {formatDate(row.original.createdAt)}</p>
                    </div>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                accessorFn: (r) => r.status,
                filterFn: 'equalsString',
                cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
            },
            {
                id: 'payment',
                header: 'Payment',
                accessorFn: (r) => r.payment?.status ?? 'UNPAID',
                filterFn: 'equalsString',
                enableGlobalFilter: false,
                cell: ({ row }) => {
                    const pay = row.original.payment;
                    if (!pay) return <span className="whitespace-nowrap text-xs text-muted-foreground">Not paid</span>;
                    return (
                        <div className="flex flex-col items-start gap-1">
                            <StatusBadge status={pay.status} />
                            <span className="text-xs font-medium text-foreground">{formatMoney(pay.amount)}</span>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const statusCounts = STATUS_ORDER.map((status) => ({
        label: status.charAt(0) + status.slice(1).toLowerCase(),
        value: rentals.filter((r) => r.status === status).length,
    }));

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Rentals"
                description="Every rental request on RentNest, from first request to completed stay, with its payment status."
            />

            {query.isPending ? (
                <TableSkeleton columns={6} />
            ) : query.isError ? (
                <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : rentals.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No rental requests yet" description="Requests appear here when tenants ask to rent a listing." />
            ) : (
                <>
                    <CountPills items={[{ label: 'Total', value: rentals.length }, ...statusCounts]} />
                    <AppDataTable
                        columns={columns}
                        data={rentals}
                        searchPlaceholder="Search tenant, property or landlord…"
                        filters={[
                            {
                                columnId: 'status',
                                placeholder: 'All statuses',
                                options: STATUS_ORDER.map((s) => ({ label: s.charAt(0) + s.slice(1).toLowerCase(), value: s })),
                            },
                            {
                                columnId: 'payment',
                                placeholder: 'Any payment',
                                options: [
                                    { label: 'Paid', value: 'COMPLETED' },
                                    { label: 'Payment pending', value: 'PENDING' },
                                    { label: 'Payment failed', value: 'FAILED' },
                                    { label: 'Not paid', value: 'UNPAID' },
                                ],
                            },
                        ]}
                        emptyMessage="No rental requests match your search or filters."
                    />
                </>
            )}
        </div>
    );
}
