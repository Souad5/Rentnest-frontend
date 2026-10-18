'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Building2, CheckCircle2, Clock, Home, Inbox, PlusCircle, Star, UserRound, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { CHART_COLORS, chartAxisProps, chartGridProps, chartTooltipProps } from '@/components/dashboard/chart-theme';
import {
    MoneyAreaChart,
    QueryErrorState,
    QuickActions,
    RecentRequestsCard,
    StatusDonutChart,
    hasMonthData,
    hasStatusData,
} from '@/components/dashboard/landlord/shared';
import { landlordApi } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';

function truncate(text: string, max = 22) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function LandlordOverviewPage() {
    const { user } = useAuth();
    const statsQuery = useQuery({ queryKey: ['landlord', 'stats'], queryFn: () => landlordApi.stats().then((r) => r.data) });
    const requestsQuery = useQuery({ queryKey: ['landlord', 'requests'], queryFn: () => landlordApi.requests().then((r) => r.data) });

    const stats = statsQuery.data;
    const loading = statsQuery.isPending;
    const firstName = user?.name?.split(' ')[0] ?? 'there';
    const topProperties = (stats?.topProperties ?? []).map((p) => ({ ...p, short: truncate(p.title) }));

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title={`Welcome back, ${firstName}`}
                description="How your listings, requests and earnings are doing."
                action={
                    <Button asChild className="h-10 rounded-xl px-4">
                        <Link href="/dashboard/landlord/properties/new">
                            <PlusCircle className="h-4 w-4" /> Add property
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard label="Listings" value={stats?.totalProperties ?? 0} icon={Building2} loading={loading} />
                        <StatCard label="Available now" value={stats?.availableProperties ?? 0} icon={CheckCircle2} tone="muted" loading={loading} hint="Visible to tenants" />
                        <StatCard label="Pending requests" value={stats?.pendingRequests ?? 0} icon={Clock} tone="highlight" loading={loading} hint={stats?.pendingRequests ? 'Waiting for your decision' : 'All caught up'} />
                        <StatCard label="Active rentals" value={stats?.activeRentals ?? 0} icon={Home} loading={loading} />
                        <StatCard label="Total earnings" value={formatPrice(stats?.totalEarnings ?? 0)} icon={Wallet} tone="ink" loading={loading} hint="Completed payments" />
                        <StatCard
                            label="Average rating"
                            value={stats?.totalReviews ? stats.averageRating.toFixed(1) : '—'}
                            icon={Star}
                            tone="highlight"
                            loading={loading}
                            hint={stats ? `${stats.totalReviews} review${stats.totalReviews === 1 ? '' : 's'}` : undefined}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <ChartCard
                            title="Monthly earnings"
                            description="Completed payments over the last 6 months"
                            loading={loading}
                            empty={!hasMonthData(stats?.monthlyEarnings, 'earnings')}
                            emptyMessage="No earnings in the last 6 months yet."
                            className="lg:col-span-3"
                        >
                            <MoneyAreaChart data={stats?.monthlyEarnings ?? []} dataKey="earnings" name="Earnings" />
                        </ChartCard>
                        <ChartCard
                            title="Requests by status"
                            description="All requests across your listings"
                            loading={loading}
                            empty={!hasStatusData(stats?.requestsByStatus)}
                            emptyMessage="No rental requests yet."
                            className="lg:col-span-2"
                        >
                            <StatusDonutChart data={stats?.requestsByStatus ?? []} />
                        </ChartCard>
                    </div>

                    <ChartCard
                        title="Top properties"
                        description="Your most requested listings"
                        loading={loading}
                        empty={!topProperties.some((p) => p.requests > 0)}
                        emptyMessage="Once tenants send requests, your most popular listings show here."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProperties} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                                <CartesianGrid {...chartGridProps} vertical horizontal={false} />
                                <XAxis type="number" allowDecimals={false} {...chartAxisProps} />
                                <YAxis type="category" dataKey="short" width={150} {...chartAxisProps} />
                                <Tooltip
                                    {...chartTooltipProps}
                                    labelFormatter={(_, payload) => payload?.[0]?.payload?.title ?? ''}
                                    formatter={(value, _name, item) => [
                                        `${value} requests · ${formatPrice(Number(item?.payload?.earnings ?? 0))} earned`,
                                        '',
                                    ]}
                                />
                                <Bar dataKey="requests" name="Requests" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} maxBarSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="min-w-0 lg:col-span-2">
                    <RecentRequestsCard
                        title="Recent requests"
                        perspective="landlord"
                        viewAllHref="/dashboard/landlord/requests"
                        requests={requestsQuery.data}
                        loading={requestsQuery.isPending}
                        error={requestsQuery.isError ? requestsQuery.error : null}
                        onRetry={() => requestsQuery.refetch()}
                    />
                </div>
                <QuickActions
                    actions={[
                        { label: 'Add a property', description: 'Publish a new listing', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
                        { label: 'Review requests', description: 'Approve or reject tenants', href: '/dashboard/landlord/requests', icon: Inbox },
                        { label: 'Earnings', description: 'Payments from your tenants', href: '/dashboard/landlord/earnings', icon: Wallet },
                        { label: 'Edit profile', description: 'Phone, photo and bio', href: '/dashboard/profile', icon: UserRound },
                    ]}
                />
            </div>
        </div>
    );
}
