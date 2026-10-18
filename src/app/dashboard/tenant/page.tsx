'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ClipboardList, Clock, CreditCard, Home, Search, Star, UserRound, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { CHART_COLORS, chartAxisProps, chartGridProps, chartTooltipProps } from '@/components/dashboard/chart-theme';
import {
    QueryErrorState,
    QuickActions,
    RecentRequestsCard,
    StatusDonutChart,
    hasMonthData,
    hasStatusData,
} from '@/components/dashboard/landlord/shared';
import { rentalsApi } from '@/lib/api';
import { formatCompact, formatMoney, formatPrice } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';

export default function TenantOverviewPage() {
    const { user } = useAuth();
    const statsQuery = useQuery({ queryKey: ['tenant', 'stats'], queryFn: () => rentalsApi.stats().then((r) => r.data) });
    const requestsQuery = useQuery({ queryKey: ['tenant', 'requests'], queryFn: () => rentalsApi.mine().then((r) => r.data) });

    const stats = statsQuery.data;
    const loading = statsQuery.isPending;
    const firstName = user?.name?.split(' ')[0] ?? 'there';

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title={`Welcome back, ${firstName}`}
                description="Your rental requests, payments and reviews at a glance."
                action={
                    <Button asChild className="h-10 rounded-xl px-4">
                        <Link href="/properties">
                            <Search className="h-4 w-4" /> Browse homes
                        </Link>
                    </Button>
                }
            />

            {statsQuery.isError ? (
                <QueryErrorState
                    title="Could not load your stats"
                    error={statsQuery.error}
                    onRetry={() => statsQuery.refetch()}
                    retrying={statsQuery.isFetching}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <StatCard label="Total requests" value={stats?.totalRequests ?? 0} icon={ClipboardList} loading={loading} hint={stats ? `${stats.completed} completed · ${stats.rejected} rejected` : undefined} />
                        <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} tone="highlight" loading={loading} hint="Waiting on the landlord" />
                        <StatCard label="Active rentals" value={stats?.active ?? 0} icon={Home} loading={loading} hint={stats ? `${stats.approved} approved, awaiting payment` : undefined} />
                        <StatCard label="Total spent" value={formatPrice(stats?.totalSpent ?? 0)} icon={Wallet} tone="ink" loading={loading} hint="Completed payments" />
                        <StatCard label="Reviews written" value={stats?.reviewsWritten ?? 0} icon={Star} tone="muted" loading={loading} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <ChartCard
                            title="Monthly spending"
                            description="Completed payments over the last 6 months"
                            loading={loading}
                            empty={!hasMonthData(stats?.monthlySpending, 'amount')}
                            emptyMessage="No payments in the last 6 months."
                            className="lg:col-span-3"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.monthlySpending ?? []} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                                    <CartesianGrid {...chartGridProps} />
                                    <XAxis dataKey="label" {...chartAxisProps} />
                                    <YAxis {...chartAxisProps} width={52} tickFormatter={(v: number) => `$${formatCompact(v)}`} />
                                    <Tooltip {...chartTooltipProps} formatter={(value) => [formatMoney(Number(value)), 'Spent']} />
                                    <Bar dataKey="amount" name="Spent" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                        <ChartCard
                            title="Requests by status"
                            description="Every request you have made"
                            loading={loading}
                            empty={!hasStatusData(stats?.requestsByStatus)}
                            emptyMessage="You haven't requested a home yet."
                            className="lg:col-span-2"
                        >
                            <StatusDonutChart data={stats?.requestsByStatus ?? []} />
                        </ChartCard>
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="min-w-0 lg:col-span-2">
                    <RecentRequestsCard
                        title="Recent requests"
                        perspective="tenant"
                        viewAllHref="/dashboard/tenant/requests"
                        requests={requestsQuery.data}
                        loading={requestsQuery.isPending}
                        error={requestsQuery.isError ? requestsQuery.error : null}
                        onRetry={() => requestsQuery.refetch()}
                    />
                </div>
                <QuickActions
                    actions={[
                        { label: 'Find a home', description: 'Search verified listings', href: '/properties', icon: Search },
                        { label: 'My requests', description: 'Pay for approved requests', href: '/dashboard/tenant/requests', icon: ClipboardList },
                        { label: 'Payment history', description: 'Receipts and transaction IDs', href: '/dashboard/tenant/payments', icon: CreditCard },
                        { label: 'Edit profile', description: 'Phone, photo and bio', href: '/dashboard/profile', icon: UserRound },
                    ]}
                />
            </div>
        </div>
    );
}
