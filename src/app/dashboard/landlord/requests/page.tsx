// src/app/dashboard/landlord/requests/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Check,
    X,
    Clock,
    User,
    Building,
    Loader2,
    RefreshCw,
    AlertCircle,
    ShieldAlert,
    Home,
    CheckCheck,
    CreditCard,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { AppButton } from '@/components/shared/AppButton';
import {
    AppDataTable,
    type AppDataTableFilterOption,
} from '@/components/shared/AppDataTable';
import RoleGuard from '@/components/guard/RoleGuard';
import { landlordApi, ApiError } from '@/lib/api';

// Mirrors the backend's RequestStatus enum (prisma/schema.prisma).
export type RentalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';

export interface RentalRequest {
    id: string;
    propertyTitle: string;
    tenantName: string;
    tenantEmail: string;
    moveInDate: string;
    createdAt: string;
    paymentStatus: string | null;
    status: RentalRequestStatus;
}

export default function LandlordRequestsPage() {
    return (
        <RoleGuard allowedRoles={['LANDLORD']}>
            <LandlordRequestsTable />
        </RoleGuard>
    );
}

function LandlordRequestsTable() {
    const [requests, setRequests] = useState<RentalRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch landlord incoming requests
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await landlordApi.getRequests();

            // Normalize array payload safely
            const rawData = Array.isArray(response)
                ? response
                : (response as { data?: Record<string, unknown>[] }).data || [];

            // Map backend schema to table data shape
            const mappedRequests: RentalRequest[] = rawData.map((item: Record<string, unknown>) => {
                const tenant = (item.tenant || item.user || {}) as { name?: string; email?: string };
                const property = (item.property || {}) as { title?: string };
                const payment = item.payment as { status?: string } | null | undefined;

                // Safely cast and normalize to UPPERCASE string
                const rawStatus = typeof item.status === 'string' ? item.status.toUpperCase() : 'PENDING';

                return {
                    id: String(item.id || ''),
                    propertyTitle: property.title || 'Property',
                    tenantName: tenant.name || 'Anonymous Tenant',
                    tenantEmail: tenant.email || 'No email provided',
                    moveInDate: item.startDate
                        ? new Date(String(item.startDate)).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : 'N/A',
                    createdAt: item.createdAt
                        ? new Date(String(item.createdAt)).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : 'N/A',
                    paymentStatus:
                        payment && typeof payment.status === 'string' ? payment.status : null,
                    status: (item.status as RentalRequest['status']) || 'PENDING',
                };
            });

            setRequests(mappedRequests);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to fetch incoming requests. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRequests();
    }, [fetchRequests]);

    // Status update against PATCH /landlord/requests/:id with rollback on
    // failure. The in-flight refs block duplicate submissions even if the
    // buttons' disabled state lags a render behind rapid clicks.
    const updatingRef = useRef(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
        if (updatingRef.current) return;
        updatingRef.current = true;
        setUpdatingId(id);
        setError(null);

        const previousRequests = [...requests];

        // Optimistically update local state immediately
        setRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );

        try {
            await landlordApi.updateRequestStatus(id, newStatus);

            toast.success(
                newStatus === 'APPROVED' ? 'Request Approved' : 'Request Rejected',
                {
                    description:
                        newStatus === 'APPROVED'
                            ? 'The tenant can now proceed to payment.'
                            : 'The tenant has been notified of your decision.',
                }
            );
        } catch (err) {
            console.error('Failed to update request status:', err);

            // Rollback to prior snapshot
            setRequests(previousRequests);

            const message =
                err instanceof ApiError
                    ? `Failed to update status: ${err.message}`
                    : 'Failed to update status. Reverting changes...';
            setError(message);
            toast.error(message);
        } finally {
            updatingRef.current = false;
            setUpdatingId(null);
        }
    };

    // Define TanStack Columns
    const columns: ColumnDef<RentalRequest>[] = useMemo(
        () => [
            {
                id: 'tenantName',
                accessorKey: 'tenantName',
                header: 'Tenant Info',
                cell: ({ row }) => {
                    const req = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{req.tenantName}</p>
                                <p className="text-xs text-muted-foreground">{req.tenantEmail}</p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'propertyTitle',
                header: 'Property',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 font-medium text-foreground">
                        <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-50 sm:max-w-xs">
                            {row.original.propertyTitle}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'moveInDate',
                header: 'Move-in Date',
                cell: ({ row }) => (
                    <span className="text-muted-foreground">{row.original.moveInDate}</span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.original.status;
                    const badgeClass =
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border';
                    switch (status) {
                        case 'PENDING':
                            return (
                                <span className={`${badgeClass} bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`}>
                                    <Clock className="h-3 w-3" /> Pending
                                </span>
                            );
                        case 'APPROVED':
                            return (
                                <span className={`${badgeClass} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`}>
                                    <Check className="h-3 w-3" /> Approved
                                </span>
                            );
                        case 'ACTIVE':
                            return (
                                <span className={`${badgeClass} bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`}>
                                    <Home className="h-3 w-3" /> Active Lease
                                </span>
                            );
                        case 'COMPLETED':
                            return (
                                <span className={`${badgeClass} bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20`}>
                                    <CheckCheck className="h-3 w-3" /> Completed
                                </span>
                            );
                        case 'REJECTED':
                            return (
                                <span className={`${badgeClass} bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20`}>
                                    <X className="h-3 w-3" /> Rejected
                                </span>
                            );
                        default:
                            return <span className="text-xs text-muted-foreground">{status}</span>;
                    }
                },
            },
            {
                id: 'payment',
                header: 'Payment',
                cell: ({ row }) => {
                    const paymentStatus = row.original.paymentStatus;
                    if (paymentStatus === 'COMPLETED') {
                        return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CreditCard className="h-3 w-3" /> Paid
                            </span>
                        );
                    }
                    if (paymentStatus === 'PENDING') {
                        return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <CreditCard className="h-3 w-3" /> Awaiting
                            </span>
                        );
                    }
                    return <span className="text-xs text-muted-foreground">—</span>;
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => {
                    const req = row.original;
                    if (req.status !== 'PENDING') {
                        return (
                            <span className="text-xs text-muted-foreground font-medium italic">
                                Action Taken
                            </span>
                        );
                    }

                    const isUpdating = updatingId === req.id;

                    return (
                        <div className="flex items-center justify-end gap-2">
                            <AppButton
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-8 text-xs"
                            >
                                {isUpdating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Approve</span>
                            </AppButton>
                            <AppButton
                                size="sm"
                                variant="destructive"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                className="gap-1 h-8 text-xs"
                            >
                                {isUpdating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <X className="h-3.5 w-3.5" />
                                )}
                                <span>Reject</span>
                            </AppButton>
                        </div>
                    );
                },
            },
        ],
        [handleUpdateStatus, updatingId]
    );

    // Filter options for AppDataTable toolbar
    const tableFilters: AppDataTableFilterOption[] = [
        {
            columnId: 'status',
            placeholder: 'All Status',
            options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Active Lease', value: 'ACTIVE' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Rejected', value: 'REJECTED' },
                { label: 'Active', value: 'ACTIVE' },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between">
                <AppButton variant="ghost" asChild className="gap-2 text-muted-foreground px-0 hover:bg-transparent">
                    <Link href="/dashboard/landlord">
                        <ArrowLeft className="h-4 w-4" /> Back to Overview
                    </Link>
                </AppButton>

                <AppButton
                    variant="outline"
                    size="sm"
                    onClick={fetchRequests}
                    disabled={loading}
                    className="h-9 px-3 gap-2"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </AppButton>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Rental Requests &amp; Tenant History
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review tenant applications for your properties and track every request from
                    approval through payment and active lease.
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <AppButton variant="outline" size="sm" onClick={fetchRequests} className="h-8 text-xs">
                        Retry
                    </AppButton>
                </div>
            )}

            {/* Reusable AppDataTable */}
            <AppDataTable
                columns={columns}
                data={requests}
                loading={loading}
                loadingMessage="Loading incoming requests..."
                searchPlaceholder="Search tenant or property..."
                filters={tableFilters}
                rightAlignColumnId="actions"
                initialPageSize={10}
                emptyState={
                    <div className="text-center py-16 px-4">
                        <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-foreground">No Pending Requests</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                            You currently have no incoming rental applications matching your view.
                        </p>
                    </div>
                }
            />
        </div>
    );
}