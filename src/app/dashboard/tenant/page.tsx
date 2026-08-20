// src/app/dashboard/tenant/requests/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Building2,
    Calendar,
    ArrowUpRight,
    RefreshCw,
    Home,
    ShieldAlert,
    AlertCircle,
    MapPin,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AppDataTable,
    type AppDataTableFilterOption,
} from '@/components/shared/AppDataTable';
import { rentalsApi, ApiError } from '@/lib/api';

export interface Property {
    id: string;
    title: string;
    address?: string;
    location?: string;
    price: number;
    images?: string[];
}

export interface RentalRequest {
    id: string;
    tenantId: string;
    propertyId: string;
    startDate: string;
    endDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CANCELLED';
    createdAt: string;
    property?: Property;
}

export default function TenantRequestsPage() {
    const [requests, setRequests] = useState<RentalRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await rentalsApi.getMyRequests();
            const data = Array.isArray(response)
                ? response
                : (response as { data?: RentalRequest[] }).data || [];
            setRequests(data as RentalRequest[]);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to load rental requests. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRequests();
    }, [fetchRequests]);

    const renderStatusBadge = (status: RentalRequest['status']) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs gap-1.5 py-1 px-2.5 font-medium"
                    >
                        <Clock className="h-3.5 w-3.5" /> Pending Approval
                    </Badge>
                );
            case 'APPROVED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1.5 py-1 px-2.5 font-medium"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                    </Badge>
                );
            case 'ACTIVE':
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs gap-1.5 py-1 px-2.5 font-medium"
                    >
                        <Home className="h-3.5 w-3.5" /> Active Lease
                    </Badge>
                );
            case 'REJECTED':
            case 'CANCELLED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-destructive/10 text-destructive border-destructive/20 text-xs gap-1.5 py-1 px-2.5 font-medium"
                    >
                        <XCircle className="h-3.5 w-3.5" /> {status}
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // TanStack Data Table Column Configuration
    const columns: ColumnDef<RentalRequest>[] = useMemo(
        () => [
            {
                id: 'property',
                accessorFn: (row) => row.property?.title ?? 'Property Request',
                header: 'Property',
                cell: ({ row }) => {
                    const req = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
                                {req.property?.images?.[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={req.property.images[0]}
                                        alt={req.property.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="h-5 w-5" />
                                )}
                            </div>
                            <div className="space-y-0.5">
                                <p className="font-semibold text-foreground text-sm truncate max-w-50 sm:max-w-xs">
                                    {req.property?.title || 'Property Request'}
                                </p>
                                {req.property?.location && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <span className="truncate max-w-45">{req.property.location}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'leasePeriod',
                header: 'Lease Duration',
                cell: ({ row }) => {
                    const req = row.original;
                    const start = new Date(req.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });
                    const end = new Date(req.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });

                    return (
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>
                                {start} &mdash; {end}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'price',
                accessorFn: (row) => row.property?.price ?? 0,
                header: 'Monthly Rent',
                cell: ({ row }) => {
                    const price = row.original.property?.price;
                    return (
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-foreground">
                                {price ? `$${price}` : 'N/A'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">/mo</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => renderStatusBadge(row.original.status),
            },
            {
                id: 'actions',
                header: 'Action',
                enableSorting: false,
                cell: ({ row }) => {
                    const req = row.original;
                    return req.status === 'APPROVED' ? (
                        <Button
                            asChild
                            size="sm"
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-medium"
                        >
                            <Link href={`/dashboard/tenant/requests/${req.id}/pay`}>
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>Pay Now</span>
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild variant="ghost" size="sm" className="gap-1 h-8 text-xs text-muted-foreground hover:text-foreground">
                            <Link href={`/properties/${req.propertyId}`}>
                                <span>View Property</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    );
                },
            },
        ],
        []
    );

    // Advanced Filtering Configuration
    const tableFilters: AppDataTableFilterOption[] = [
        {
            columnId: 'status',
            placeholder: 'All Status',
            options: [
                { label: 'Pending Approval', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Active Lease', value: 'ACTIVE' },
                { label: 'Rejected', value: 'REJECTED' },
                { label: 'Cancelled', value: 'CANCELLED' },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        My Rental Requests
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Track and manage your submitted property rental applications
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRequests}
                    disabled={loading}
                    className="h-9 px-3 gap-2 shrink-0 self-start sm:self-center"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </Button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchRequests} className="h-8 text-xs">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Reusable Modern Data Table */}
            <AppDataTable
                columns={columns}
                data={requests}
                loading={loading}
                loadingMessage="Fetching your rental requests..."
                searchPlaceholder="Search property or location..."
                filters={tableFilters}
                rightAlignColumnId="actions"
                initialPageSize={10}
                emptyState={
                    <div className="text-center py-16 px-4 border border-dashed border-border rounded-xl bg-card">
                        <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-foreground">
                            No Rental Requests Found
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                            You haven&apos;t submitted any rental applications yet. Explore available properties to get started.
                        </p>
                        <Button asChild size="sm">
                            <Link href="/properties">Browse Properties</Link>
                        </Button>
                    </div>
                }
            />
        </div>
    );
}