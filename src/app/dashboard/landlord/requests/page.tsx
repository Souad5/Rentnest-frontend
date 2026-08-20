// src/app/dashboard/landlord/requests/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { AppButton } from '@/components/shared/AppButton';
import {
    AppDataTable,
    type AppDataTableFilterOption,
} from '@/components/shared/AppDataTable';
import { landlordApi, ApiError } from '@/lib/api';

export interface RentalRequest {
    id: string;
    propertyTitle: string;
    tenantName: string;
    tenantEmail: string;
    moveInDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function LandlordRequestsPage() {
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

    // Optimistic Status Update with Rollback
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
        setUpdatingId(id);
        setError(null);

        const previousRequests = [...requests];

        // Optimistically update local state immediately
        setRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );

        try {
            await landlordApi.updateRequestStatus(id, newStatus);
        } catch (err) {
            console.error('Failed to update request status:', err);

            // Rollback to prior snapshot
            setRequests(previousRequests);

            if (err instanceof ApiError) {
                setError(`Failed to update status: ${err.message}`);
            } else {
                setError('Failed to update status. Reverting changes...');
            }
        } finally {
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
                    return (
                        <>
                            {status === 'PENDING' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    <Clock className="h-3 w-3" /> Pending
                                </span>
                            )}
                            {status === 'APPROVED' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <Check className="h-3 w-3" /> Approved
                                </span>
                            )}
                            {status === 'REJECTED' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                    <X className="h-3 w-3" /> Rejected
                                </span>
                            )}
                        </>
                    );
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
            placeholder: 'All Statuses',
            options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' },
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
                    Incoming Rental Requests
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review tenant requests for your properties. Approved requests enable tenants to proceed to checkout.
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