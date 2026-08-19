'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, Download, Loader2 } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';
import { useAuth } from '@/providers/AuthProvider';
import { propertiesApi, ApiProperty } from '@/lib/api';
import { DashboardHeader } from './components/DashboardHeader';
import { MetricsOverview } from './components/MetricsOverview';
import { PropertiesTable } from './components/PropertiesTable';

const BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || 'https://rentnest-backend-five.vercel.app/api'
).replace(/\/$/, '');

export default function LandlordDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [properties, setProperties] = useState<ApiProperty[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'requests'>('overview');

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await propertiesApi.getAll();
            const resData = response as unknown as { data?: ApiProperty[] } | ApiProperty[];
            const allProperties = Array.isArray(resData) ? resData : resData.data || [];

            const myProperties = allProperties.filter(
                (p) => p.landlordId === user.id || p.landlord?.id === user.id
            );
            setProperties(myProperties);
        } catch (err: unknown) {
            console.error('Error loading dashboard data:', err);
            const message = err instanceof Error ? err.message : 'Could not load properties from server.';
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
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/properties/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setProperties((prev) => prev.filter((p) => p.id !== id));
            } else {
                alert('Failed to delete property');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setProperties((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const handleToggleAvailability = async (id: string, currentStatus?: boolean) => {
        const isCurrentlyAvailable = currentStatus ?? true;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/properties/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isAvailable: !isCurrentlyAvailable }),
            });

            if (res.ok) {
                setProperties((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, isAvailable: !isCurrentlyAvailable } : p
                    )
                );
            }
        } catch (err) {
            console.error('Toggle error:', err);
            setProperties((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, isAvailable: !isCurrentlyAvailable } : p
                )
            );
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

                <MetricsOverview properties={properties} />

                <PropertiesTable
                    properties={properties}
                    isLoading={isLoading}
                    userId={user?.id}
                    onDelete={handleDelete}
                    onToggleAvailability={handleToggleAvailability}
                />
            </div>
        </div>
    );
}