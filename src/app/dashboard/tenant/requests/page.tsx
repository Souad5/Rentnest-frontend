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
    Star,
    Receipt,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AppDataTable,
    type AppDataTableFilterOption,
} from '@/components/shared/AppDataTable';
import { ReviewFormModal } from '@/components/forms/ReviewFormModal';
import { rentalsApi, paymentsApi, ApiError } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { AppButton } from '@/components/shared/AppButton';

export interface Property {
    id: string;
    title: string;
    address?: string;
    location?: string;
    price: number;
    images?: string[];
    imageUrl?: string | null;
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

interface PaymentRecord {
    id: string;
    rentalRequestId: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
    createdAt: string;
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
    const { token, isLoading: authLoading } = useAuth();
    const [requests, setRequests] = useState<RentalRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
    // Active/approved rental currently being reviewed via the Leave Review dialog.
    const [reviewTarget, setReviewTarget] = useState<RentalRequest | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState<boolean>(true);
    const [paymentsError, setPaymentsError] = useState<string | null>(null);

    const fetchPayments = useCallback(async () => {
        if (!token) {
            setPaymentsLoading(false);
            return;
        }
        setPaymentsLoading(true);
        setPaymentsError(null);
        try {
            const response = await paymentsApi.getPayments();
            setPayments(response.data ?? []);
        } catch (err) {
            if (err instanceof ApiError) {
                setPaymentsError(err.message);
            } else {
                setPaymentsError('Failed to load payment history. Please try again.');
            }
        } finally {
            setPaymentsLoading(false);
        }
    }, [token]);

    const fetchRequests = useCallback(async () => {
        if (!token) {
            // No authenticated session: skip protected endpoint entirely.
            setLoading(false);
            return;
        }
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
    }, [token]);

    useEffect(() => {
        if (authLoading) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRequests();
        fetchPayments();
    }, [fetchRequests, fetchPayments, authLoading]);

    // Maps rentalRequestId -> rental request so payment rows can show which
    // property they paid for.
    const requestByRentalId = useMemo(
        () => new Map(requests.map((request) => [request.id, request])),
        [requests]
    );

    // Post-payment feedback: checkout redirects here with ?payment=success.
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('payment') === 'success') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPaymentSuccess(true);
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, []);

    // Most recent settled payment — identifies the rental that was just paid
    // so the success state can offer the [Payment Success] → [Leave Review] step.
    const latestCompletedPayment = useMemo(
        () =>
            [...payments]
                .filter((payment) => payment.status === 'COMPLETED')
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                )[0] ?? null,
        [payments]
    );

    const reviewPromptRequest = useMemo(() => {
        if (!latestCompletedPayment) return null;
        const request = requestByRentalId.get(latestCompletedPayment.rentalRequestId);
        return request?.status === 'ACTIVE' ? request : null;
    }, [latestCompletedPayment, requestByRentalId]);

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

    const renderPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1.5 py-1 px-2.5 font-medium"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </Badge>
                );
            case 'PENDING':
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs gap-1.5 py-1 px-2.5 font-medium"
                    >
                        <Clock className="h-3.5 w-3.5" /> Pending
                    </Badge>
                );
            case 'FAILED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-destructive/10 text-destructive border-destructive/20 text-xs gap-1.5 py-1 px-2.5 font-medium"
                    >
                        <XCircle className="h-3.5 w-3.5" /> Failed
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // TanStack Data Table Column Configuration for payment history
    const paymentColumns: ColumnDef<PaymentRecord>[] = useMemo(
        () => [
            {
                accessorKey: 'createdAt',
                header: 'Date',
                cell: ({ row }) => (
                    <span className="text-xs font-medium text-foreground whitespace-nowrap">
                        {new Date(row.original.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                ),
            },
            {
                id: 'property',
                accessorFn: (row) =>
                    requestByRentalId.get(row.rentalRequestId)?.property?.title ?? '',
                header: 'Property',
                cell: ({ row }) => {
                    const request = requestByRentalId.get(row.original.rentalRequestId);
                    return (
                        <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate max-w-45 sm:max-w-xs">
                                {request?.property?.title || 'Rental Payment'}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-40 font-mono">
                                #{row.original.rentalRequestId.slice(0, 8)}
                            </p>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'amount',
                header: 'Amount',
                cell: ({ row }) => (
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-foreground">
                            ${row.original.amount.toLocaleString()}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => renderPaymentStatusBadge(String(row.original.status)),
            },
        ],
        [requestByRentalId]
    );

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
                                {req.property?.imageUrl || req.property?.images?.[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={req.property.imageUrl || req.property.images![0]}
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

                    if (req.status === 'APPROVED') {
                        return (
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
                        );
                    }

                    // Active lease only: tenant may rate & review the property.
                    if (req.status === 'ACTIVE' || 'APPROVED') {
                        return (
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => setReviewTarget(req)}
                                className="gap-1.5 h-8 text-xs font-medium"
                            >
                                <Star className="h-3.5 w-3.5" />
                                <span>Leave Review</span>
                            </AppButton>
                        );
                    }

                    return (
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

    // Unauthenticated state: prompt sign-in instead of hitting protected APIs.
    if (!authLoading && !token) {
        return (
            <div className="text-center py-16 px-4 border border-dashed border-border rounded-xl bg-card">
                <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground">Sign in required</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                    You need to be signed in as a tenant to view your rental requests.
                </p>
                <Button asChild size="sm">
                    <Link href="/login">Sign In</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Payment Success Banner */}
            {paymentSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Payment successful! Your lease is now active.</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPaymentSuccess(false)}
                        className="text-xs font-medium hover:underline shrink-0"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* [Payment Success] → [Leave Review] step for the freshly activated lease */}
            {reviewPromptRequest && (
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Star className="h-5 w-5 fill-current" />
                        </span>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Welcome home! How is{' '}
                                {reviewPromptRequest.property?.title || 'your new rental'}?
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                                Your lease is active and your payment went through. Leave a
                                quick rating to help other tenants choose with confidence.
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setReviewTarget(reviewPromptRequest)}
                        className="gap-1.5 h-9 text-xs font-medium shrink-0 self-stretch sm:self-center"
                    >
                        <Star className="h-3.5 w-3.5" />
                        Leave a Review
                    </Button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        My Rental Requests
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Track your rental applications and review properties you&apos;ve rented
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

            {/* Payment History */}
            <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <Receipt className="h-4.5 w-4.5 text-primary shrink-0" />
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Payment History
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                All transactions for your rental leases
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPayments}
                        disabled={paymentsLoading}
                        className="h-8 px-3 gap-1.5 text-xs shrink-0 self-start sm:self-center"
                    >
                        <RefreshCw className={`h-3 w-3 ${paymentsLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                </div>

                {paymentsError && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{paymentsError}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchPayments}
                            className="h-8 text-xs"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                <AppDataTable
                    columns={paymentColumns}
                    data={payments}
                    loading={paymentsLoading}
                    loadingMessage="Fetching payment history..."
                    searchPlaceholder="Search payments..."
                    emptyState={
                        <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl bg-card">
                            <Receipt className="h-9 w-9 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-sm font-semibold text-foreground">
                                No Payments Yet
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                Your payment transactions will appear here once you complete a
                                lease checkout.
                            </p>
                        </div>
                    }
                />
            </div>

            {/* Leave Review Dialog (active leases only) */}
            <ReviewFormModal
                open={!!reviewTarget}
                onOpenChange={(open) => !open && setReviewTarget(null)}
                propertyId={reviewTarget?.propertyId}
                propertyTitle={reviewTarget?.property?.title}
            />
        </div>
    );
}
