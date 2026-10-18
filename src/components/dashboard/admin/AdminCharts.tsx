'use client';

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { CHART_COLORS, chartAxisProps, chartGridProps, chartTooltipProps } from '@/components/dashboard/chart-theme';
import { formatCompact, formatMoney } from '@/lib/format';
import type { AdminStats, RequestStatus, UserRole } from '@/types/api';

// Colors follow the entity, never its rank, so a slice keeps its color when others are empty.
const STATUS_COLORS: Record<RequestStatus, string> = {
    PENDING: CHART_COLORS[1],
    APPROVED: CHART_COLORS[3],
    ACTIVE: CHART_COLORS[0],
    COMPLETED: CHART_COLORS[2],
    REJECTED: 'var(--destructive)',
};
const STATUS_ORDER: RequestStatus[] = ['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED'];

const ROLE_COLORS: Record<UserRole, string> = {
    TENANT: CHART_COLORS[0],
    LANDLORD: CHART_COLORS[1],
    ADMIN: CHART_COLORS[2],
};
const ROLE_ORDER: UserRole[] = ['TENANT', 'LANDLORD', 'ADMIN'];

const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

const legendText = (value: string) => <span className="text-xs text-muted-foreground">{value}</span>;

interface Slice {
    key: string;
    label: string;
    value: number;
    color: string;
}

/** Donut/pie with an HTML legend that carries labels + counts (identity never relies on color alone). */
function PieWithLegend({ slices, donut, unit }: { slices: Slice[]; donut?: boolean; unit: string }) {
    const total = slices.reduce((s, x) => s + x.value, 0);
    const visible = slices.filter((s) => s.value > 0);
    return (
        <div className="flex h-full items-center gap-4">
            <div className="relative h-full min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={visible}
                            dataKey="value"
                            nameKey="label"
                            innerRadius={donut ? '58%' : 0}
                            outerRadius="90%"
                            paddingAngle={visible.length > 1 && donut ? 2 : 0}
                            stroke="var(--card)"
                            strokeWidth={2}
                            isAnimationActive={false}
                        >
                            {visible.map((s) => (
                                <Cell key={s.key} fill={s.color} />
                            ))}
                        </Pie>
                        <Tooltip {...chartTooltipProps} formatter={(value) => [`${value} ${unit}`, '']} separator="" />
                    </PieChart>
                </ResponsiveContainer>
                {donut && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-serif text-2xl font-semibold text-foreground">{total}</span>
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{unit}</span>
                    </div>
                )}
            </div>
            <ul className="w-32 shrink-0 space-y-2 sm:w-36">
                {slices.map((s) => (
                    <li key={s.key} className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">{s.label}</span>
                        <span className="font-semibold text-foreground">{s.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function AdminCharts({ stats, loading }: { stats?: AdminStats; loading: boolean }) {
    const monthly = stats?.monthly ?? [];
    const growthEmpty = monthly.every((m) => !Number(m.users) && !Number(m.rentals));
    const revenueEmpty = monthly.every((m) => !Number(m.revenue));

    const statusSlices: Slice[] = STATUS_ORDER.map((status) => ({
        key: status,
        label: titleCase(status),
        value: stats?.rentalsByStatus.find((s) => s.status === status)?.count ?? 0,
        color: STATUS_COLORS[status],
    }));

    const roleSlices: Slice[] = ROLE_ORDER.map((role) => ({
        key: role,
        label: `${titleCase(role)}s`,
        value: stats?.usersByRole.find((r) => r.role === role)?.count ?? 0,
        color: ROLE_COLORS[role],
    }));

    const categories = [...(stats?.propertiesByCategory ?? [])].sort((a, b) => b.count - a.count).slice(0, 8);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
                title="Monthly growth"
                description="New users and rental requests, last 6 months"
                loading={loading}
                empty={growthEmpty}
                emptyMessage="No sign-ups or rental requests in the last 6 months."
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="admin-users-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="admin-rentals-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={CHART_COLORS[1]} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid {...chartGridProps} />
                        <XAxis dataKey="label" {...chartAxisProps} />
                        <YAxis allowDecimals={false} {...chartAxisProps} />
                        <Tooltip {...chartTooltipProps} cursor={{ stroke: 'var(--border)' }} />
                        <Legend verticalAlign="top" align="right" height={28} iconType="circle" iconSize={8} formatter={legendText} />
                        <Area
                            type="monotone"
                            dataKey="users"
                            name="New users"
                            stroke={CHART_COLORS[0]}
                            strokeWidth={2}
                            fill="url(#admin-users-fill)"
                            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="rentals"
                            name="Rental requests"
                            stroke={CHART_COLORS[1]}
                            strokeWidth={2}
                            fill="url(#admin-rentals-fill)"
                            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard
                title="Monthly revenue"
                description="Completed rent payments, last 6 months"
                loading={loading}
                empty={revenueEmpty}
                emptyMessage="No completed payments in the last 6 months."
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid {...chartGridProps} />
                        <XAxis dataKey="label" {...chartAxisProps} />
                        <YAxis {...chartAxisProps} tickFormatter={(v: number) => `$${formatCompact(v)}`} />
                        <Tooltip {...chartTooltipProps} formatter={(value) => [formatMoney(Number(value)), 'Revenue']} />
                        <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard
                title="Rentals by status"
                description="All rental requests"
                loading={loading}
                empty={statusSlices.every((s) => s.value === 0)}
                emptyMessage="No rental requests yet."
            >
                <PieWithLegend slices={statusSlices} donut unit="requests" />
            </ChartCard>

            <ChartCard
                title="Users by role"
                description="Registered accounts"
                loading={loading}
                empty={roleSlices.every((s) => s.value === 0)}
                emptyMessage="No registered users yet."
            >
                <PieWithLegend slices={roleSlices} unit="users" />
            </ChartCard>

            <ChartCard
                title="Properties by category"
                description={
                    (stats?.propertiesByCategory.length ?? 0) > 8 ? 'Top 8 categories by number of listings' : 'Number of listings per category'
                }
                loading={loading}
                empty={categories.every((c) => c.count === 0)}
                emptyMessage="No listings yet."
                className="lg:col-span-2"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                        <CartesianGrid {...chartGridProps} vertical horizontal={false} />
                        <XAxis type="number" allowDecimals={false} {...chartAxisProps} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            {...chartAxisProps}
                            tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
                        />
                        <Tooltip {...chartTooltipProps} formatter={(value) => [value, 'Listings']} />
                        <Bar dataKey="count" name="Listings" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} maxBarSize={22} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
}
