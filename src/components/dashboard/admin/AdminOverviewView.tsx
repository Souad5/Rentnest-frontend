'use client';

import Link from 'next/link';
import {
    ArrowRight,
    Building2,
    ClipboardList,
    Home,
    Inbox,
    KeyRound,
    MessageSquareQuote,
    Users,
    Wallet,
} from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api';
import { formatDate, formatMoney, initials } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import type { AdminStats, AdminUser, ApiEnvelope } from '@/types/api';
import { AdminCharts } from './AdminCharts';
import { AIInsightsPanel } from './AIInsightsPanel';
import { ErrorState } from './AdminStates';
import type { AdminRental } from './types';
import { adminKeys, errorMessage, useAdminQuery } from './useAdminQuery';

const fetchRentals = () => adminApi.rentals() as unknown as Promise<ApiEnvelope<AdminRental[]>>;

function MiniCard({
    title,
    href,
    children,
}: {
    title: string;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex min-w-0 flex-col rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                <Button asChild variant="ghost" size="sm" className="rounded-xl text-primary">
                    <Link href={href}>
                        View all
                        <ArrowRight />
                    </Link>
                </Button>
            </div>
            <div className="flex-1">{children}</div>
        </section>
    );
}

function MiniSkeleton() {
    return (
        <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            ))}
        </div>
    );
}

function MiniError({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center text-sm">
            <p className="text-muted-foreground">{message}</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={onRetry}>
                Retry
            </Button>
        </div>
    );
}

function RecentUsers() {
    const query = useAdminQuery<AdminUser[]>(adminKeys.users, adminApi.users);
    const rows = (query.data ?? []).slice(0, 5);

    return (
        <MiniCard title="Recent users" href="/dashboard/admin/users">
            {query.isPending ? (
                <MiniSkeleton />
            ) : query.isError ? (
                <MiniError message={errorMessage(query.error)} onRetry={() => query.refetch()} />
            ) : rows.length === 0 ? (
                <EmptyState icon={Users} title="No users yet" className="m-5 border-none py-8" />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sr-only">
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-5 py-3">
                                        <div className="flex min-w-[180px] items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">{initials(u.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-foreground">{u.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3">
                                        {u.isBanned ? (
                                            <StatusBadge status="BANNED" />
                                        ) : (
                                            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs capitalize text-foreground">
                                                {u.role.toLowerCase()}
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </MiniCard>
    );
}

function LatestRentals() {
    const query = useAdminQuery<AdminRental[]>(adminKeys.rentals, fetchRentals);
    const rows = (query.data ?? []).slice(0, 5);

    return (
        <MiniCard title="Latest rental requests" href="/dashboard/admin/rentals">
            {query.isPending ? (
                <MiniSkeleton />
            ) : query.isError ? (
                <MiniError message={errorMessage(query.error)} onRetry={() => query.refetch()} />
            ) : rows.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No rental requests yet" className="m-5 border-none py-8" />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sr-only">
                            <tr>
                                <th>Request</th>
                                <th>Status</th>
                                <th>Requested</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-5 py-3">
                                        <div className="min-w-[180px]">
                                            {r.property ? (
                                                <Link
                                                    href={`/properties/${r.property.id}`}
                                                    className="line-clamp-1 font-medium text-foreground hover:text-primary hover:underline"
                                                >
                                                    {r.property.title}
                                                </Link>
                                            ) : (
                                                <p className="text-muted-foreground">Removed listing</p>
                                            )}
                                            <p className="truncate text-xs text-muted-foreground">by {r.tenant?.name ?? 'Unknown tenant'}</p>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3">
                                        <StatusBadge status={r.status} />
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-muted-foreground">{formatDate(r.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </MiniCard>
    );
}

export function AdminOverviewView() {
    const { user } = useAuth();
    const query = useAdminQuery<AdminStats>(adminKeys.stats, adminApi.stats);
    const t = query.data?.totals;
    const loading = query.isPending;

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title={user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Admin overview'}
                description="Platform health across users, listings, rentals and revenue."
            />

            {query.isError ? (
                <ErrorState title="Could not load platform stats" message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Total users" value={t?.users ?? 0} icon={Users} hint={`${t?.bannedUsers ?? 0} banned · ${t?.admins ?? 0} admins`} loading={loading} />
                        <StatCard label="Landlords" value={t?.landlords ?? 0} icon={KeyRound} tone="ink" loading={loading} />
                        <StatCard label="Tenants" value={t?.tenants ?? 0} icon={Home} tone="muted" loading={loading} />
                        <StatCard
                            label="Properties"
                            value={t?.properties ?? 0}
                            icon={Building2}
                            hint={`${t?.availableProperties ?? 0} available now`}
                            loading={loading}
                        />
                        <StatCard
                            label="Rental requests"
                            value={t?.rentals ?? 0}
                            icon={ClipboardList}
                            tone="highlight"
                            hint={`${t?.pendingRentals ?? 0} pending · ${t?.activeRentals ?? 0} active`}
                            loading={loading}
                        />
                        <StatCard label="Revenue" value={formatMoney(t?.revenue ?? 0)} icon={Wallet} tone="ink" hint="Completed payments" loading={loading} />
                        <StatCard label="Reviews" value={t?.reviews ?? 0} icon={MessageSquareQuote} tone="muted" loading={loading} />
                        <StatCard
                            label="Unread messages"
                            value={t?.unreadMessages ?? 0}
                            icon={Inbox}
                            tone={(t?.unreadMessages ?? 0) > 0 ? 'highlight' : 'muted'}
                            hint={`${t?.subscribers ?? 0} newsletter subscribers`}
                            loading={loading}
                        />
                    </div>

                    <AIInsightsPanel />

                    <AdminCharts stats={query.data} loading={loading} />
                </>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <RecentUsers />
                <LatestRentals />
            </div>
        </div>
    );
}
