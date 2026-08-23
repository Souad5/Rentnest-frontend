'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/shared/AppButton';
import RoleGuard from '@/components/guard/RoleGuard';
import { useAuth } from '@/providers/AuthProvider';
import { landlordApi, propertiesApi, ApiProperty, ApiError } from '@/lib/api';
import { DashboardHeader } from './components/DashboardHeader';
import { MetricsOverview } from './components/MetricsOverview';
import { PropertiesTable } from './components/PropertiesTable';

interface RequestStats {
    pendingRequests: number;
    earnings: number;
}

function LandlordDashboardContent() {
    const { user, isLoading: authLoading } = useAuth();
    const [properties, setProperties] = useState<ApiProperty[]>([]);
    const [stats, setStats] = useState<RequestStats>({ pendingRequests: 0, earnings: 0 });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        setError(null);

        try {
            // Portfolio: dedicated authenticated endpoint returns ALL own
            // listings including rented-out ones. Falls back to the public
            // listing (isAvailable=true only) against older backend deploys.
            let portfolio: ApiProperty[];
            try {
                const mine = await landlordApi.getMyProperties();
                portfolio = mine.data ?? [];
            } catch (err) {
                if (err instanceof ApiError && err.status === 404) {
                    const response = await propertiesApi.getAll();
                    const resData = response as unknown as
                        | { data?: ApiProperty[] }
                        | ApiProperty[];
                    const all = Array.isArray(resData) ? resData : resData.data || [];
                    portfolio = all.filter(
                        (p) => p.landlordId === user.id || p.landlord?.id === user.id
                    );
                } else {
                    throw err;
                }
            }

            // Request-derived metrics straight from the backend payload.
            let nextStats: RequestStats = { pendingRequests: 0, earnings: 0 };
            try {
                const requestsRes = await landlordApi.getRequests();
                const rows = requestsRes.data ?? [];
                nextStats = {
                    pendingRequests: rows.filter((r) => r.status === 'PENDING').length,
                    earnings: rows.reduce((sum, r) => {
                        const payment = r.payment as
                            | { status?: string; amount?: number }
                            | null
                            | undefined;
                        return payment?.status === 'COMPLETED'
                            ? sum + (Number(payment.amount) || 0)
                            : sum;
                    }, 0),
                };
            } catch {
                // Metrics are secondary to the portfolio view; keep zeros.
            }

            setProperties(portfolio);
            setStats(nextStats);
        } catch (err: unknown) {
            console.error('Error loading dashboard data:', err);
            const message =
                err instanceof Error ? err.message : 'Could not load properties from server.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchData();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, fetchData]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        if (deletingId) return;
        setDeletingId(id);
        try {
            await landlordApi.deleteProperty(id);
            setProperties((prev) => prev.filter((p) => p.id !== id));
            toast.success('Property deleted');
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : 'Failed to delete property.';
            toast.error(message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleAvailability = async (id: string, currentStatus?: boolean) => {
        const isCurrentlyAvailable = currentStatus ?? true;
        if (togglingId) return;
        setTogglingId(id);
        try {
            await landlordApi.updateProperty(id, { isAvailable: !isCurrentlyAvailable });
            setProperties((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, isAvailable: !isCurrentlyAvailable } : p
                )
            );
            toast.success(
                !isCurrentlyAvailable ? 'Listing marked as available' : 'Listing marked as occupied'
            );
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : 'Failed to update availability. Please try again.';
            toast.error(message);
        } finally {
            setTogglingId(null);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
            <div className=" space-y-6">
                <DashboardHeader
                    userName={user?.name}
                    isLoading={isLoading}
                    onRefresh={fetchData}
                />

                {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center justify-between">
                        <span>{error}</span>
                        <AppButton variant="outline" size="sm" onClick={fetchData} className="h-8 text-xs bg-white border-rose-200">
                            Retry
                        </AppButton>
                    </div>
                )}

                <MetricsOverview
                    properties={properties}
                    pendingRequests={stats.pendingRequests}
                    earnings={stats.earnings}
                />

                <PropertiesTable
                    properties={properties}
                    isLoading={isLoading}
                    userId={user?.id}
                    deletingId={deletingId}
                    togglingId={togglingId}
                    onDelete={handleDelete}
                    onToggleAvailability={handleToggleAvailability}
                />
            </div>
        </div>
    );
}

export default function LandlordDashboardPage() {
    return (
        <RoleGuard allowedRoles={['LANDLORD']}>
            <LandlordDashboardContent />
        </RoleGuard>
    );
}
