'use client';

// Building blocks shared by the tenant and landlord dashboards: error state,
// confirm dialog, property cell, rating stars, copy button and the charts that
// both overviews render from API data.

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Area,
    AreaChart,
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
import {
    AlertTriangle,
    ArrowUpRight,
    Building2,
    Check,
    Copy,
    Inbox,
    Loader2,
    type LucideIcon,
    MapPin,
    RefreshCw,
    Star,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ApiError } from '@/lib/api';
import { formatCompact, formatDate, formatMoney } from '@/lib/format';
import { canOptimizeImage, coverImage } from '@/lib/images';
import { cn } from '@/lib/utils';
import { CHART_COLORS, chartAxisProps, chartGridProps, chartTooltipProps } from '@/components/dashboard/chart-theme';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import type { MonthPoint, RentalRequest, RequestStatus, StatusCount } from '@/types/api';

/** Human message for any thrown value (ApiError carries the backend message). */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
    if (error instanceof ApiError) {
        if (error.status === 0 || error.status >= 500) return error.message || fallback;
        return error.message;
    }
    if (error instanceof TypeError) return 'Could not reach the RentNest server. Check your connection and retry.';
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export function QueryErrorState({
    title = 'Could not load this data',
    error,
    onRetry,
    retrying,
    className,
}: {
    title?: string;
    error: unknown;
    onRetry: () => void;
    retrying?: boolean;
    className?: string;
}) {
    return (
        <div
            role="alert"
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center',
                className,
            )}
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="max-w-md text-sm text-muted-foreground">{errorMessage(error)}</p>
            </div>
            <Button variant="outline" onClick={onRetry} disabled={retrying} className="h-9 rounded-xl px-4">
                <RefreshCw className={cn('h-4 w-4', retrying && 'animate-spin')} />
                Retry
            </Button>
        </div>
    );
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    destructive = false,
    loading = false,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: React.ReactNode;
    confirmLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
            <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-serif text-lg tracking-tight">{title}</DialogTitle>
                    <DialogDescription asChild>
                        <div className="text-sm text-muted-foreground">{description}</div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" className="h-10 rounded-xl" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant={destructive ? 'destructive' : 'default'}
                        className="h-10 rounded-xl"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type ThumbProperty = {
    id: string;
    title: string;
    location?: string | null;
    images?: string[] | null;
    imageUrl?: string | null;
};

/** 44px cover thumbnail + linked title + location, used in table cells. */
export function PropertyCell({ property, href }: { property?: ThumbProperty | null; href?: string }) {
    if (!property) return <span className="text-sm text-muted-foreground">Property removed</span>;
    const cover = coverImage(property);
    const link = href ?? `/properties/${property.id}`;
    return (
        <div className="flex min-w-48 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                {cover ? (
                    <Image
                        src={cover}
                        alt={property.title}
                        fill
                        sizes="44px"
                        className="object-cover"
                        unoptimized={!canOptimizeImage(cover)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Building2 className="h-5 w-5" />
                    </div>
                )}
            </div>
            <div className="min-w-0">
                <Link
                    href={link}
                    className="line-clamp-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                    {property.title}
                </Link>
                {property.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{property.location}</span>
                    </p>
                )}
            </div>
        </div>
    );
}

export function RatingStars({ value, className }: { value: number; className?: string }) {
    const rounded = Math.round(value);
    return (
        <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5 stars`} role="img">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn('h-3.5 w-3.5', i < rounded ? 'fill-highlight text-highlight' : 'text-border')}
                    aria-hidden
                />
            ))}
        </span>
    );
}

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error('Copy failed — select the text and copy it manually.');
        }
    };
    return (
        <Button type="button" variant="ghost" size="icon-sm" className="rounded-lg" onClick={copy} aria-label={label}>
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
    );
}

// ---------------------------------------------------------------------------
// Charts (recharts 3, colors come from theme tokens)
// ---------------------------------------------------------------------------

/** Fixed status → color mapping so a status keeps its color across charts. */
export const STATUS_COLORS: Record<RequestStatus, string> = {
    ACTIVE: CHART_COLORS[0],
    PENDING: CHART_COLORS[1],
    COMPLETED: CHART_COLORS[2],
    APPROVED: CHART_COLORS[3],
    REJECTED: 'var(--destructive)',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
};

export function hasStatusData(data?: StatusCount[]) {
    return !!data?.some((d) => d.count > 0);
}

export function StatusDonutChart({ data }: { data: StatusCount[] }) {
    const rows = data
        .filter((d) => d.count > 0)
        .map((d) => ({ ...d, name: STATUS_LABEL[d.status] ?? d.status }));
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={rows}
                    dataKey="count"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                    cy="45%"
                >
                    {rows.map((row) => (
                        <Cell key={row.status} fill={STATUS_COLORS[row.status] ?? CHART_COLORS[4]} />
                    ))}
                </Pie>
                <Tooltip {...chartTooltipProps} formatter={(value) => [`${value} requests`, '']} />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => <span style={{ color: 'var(--muted-foreground)' }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function hasMonthData(data: MonthPoint[] | undefined, key: string) {
    return !!data?.some((d) => Number(d[key]) > 0);
}

/** Single-series money trend (monthly spending / earnings). */
export function MoneyAreaChart({ data, dataKey, name }: { data: MonthPoint[]; dataKey: string; name: string }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="label" {...chartAxisProps} />
                <YAxis {...chartAxisProps} width={52} tickFormatter={(v: number) => `$${formatCompact(v)}`} />
                <Tooltip
                    {...chartTooltipProps}
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                    formatter={(value) => [formatMoney(Number(value)), name]}
                />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    name={name}
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    fill={CHART_COLORS[0]}
                    fillOpacity={0.14}
                    activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }}
                    dot={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ---------------------------------------------------------------------------
// Overview widgets
// ---------------------------------------------------------------------------

export function paymentLabel(request: Pick<RentalRequest, 'status' | 'payment'>): { label: string; tone: string } {
    const status = request.payment?.status;
    if (status === 'COMPLETED') return { label: 'Paid', tone: 'text-primary' };
    if (status === 'FAILED') return { label: 'Payment failed', tone: 'text-destructive' };
    if (status === 'PENDING') return { label: 'Payment started', tone: 'text-muted-foreground' };
    if (request.status === 'APPROVED') return { label: 'Awaiting payment', tone: 'text-foreground' };
    return { label: 'Not due', tone: 'text-muted-foreground' };
}

export function RecentRequestsCard({
    title,
    requests,
    loading,
    error,
    onRetry,
    perspective,
    viewAllHref,
}: {
    title: string;
    requests?: RentalRequest[];
    loading: boolean;
    error: unknown;
    onRetry: () => void;
    perspective: 'tenant' | 'landlord';
    viewAllHref: string;
}) {
    const recent = [...(requests ?? [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <section className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <Link href={viewAllHref} className="text-xs font-semibold text-primary hover:underline">
                    View all
                </Link>
            </div>
            {loading ? (
                <div className="space-y-3 p-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-11 w-full rounded-xl" />
                    ))}
                </div>
            ) : error ? (
                <QueryErrorState error={error} onRetry={onRetry} className="m-5" />
            ) : recent.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    title="No requests yet"
                    description={
                        perspective === 'tenant'
                            ? 'Find a home you like and request your dates — it will show up here.'
                            : 'When tenants request one of your listings, the request will appear here.'
                    }
                    className="m-5 border-0 bg-transparent py-10"
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="px-5 py-2.5 font-medium">Property</th>
                                {perspective === 'landlord' && <th className="px-5 py-2.5 font-medium">Tenant</th>}
                                <th className="px-5 py-2.5 font-medium">Dates</th>
                                <th className="px-5 py-2.5 font-medium">Status</th>
                                <th className="px-5 py-2.5 font-medium">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recent.map((request) => {
                                const pay = paymentLabel(request);
                                return (
                                    <tr key={request.id} className="transition-colors hover:bg-muted/40">
                                        <td className="px-5 py-3">
                                            <PropertyCell property={request.property} />
                                        </td>
                                        {perspective === 'landlord' && (
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-foreground">{request.tenant?.name ?? '—'}</p>
                                                <p className="text-xs text-muted-foreground">{request.tenant?.email}</p>
                                            </td>
                                        )}
                                        <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                                            {formatDate(request.startDate)} – {formatDate(request.endDate)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={request.status} />
                                        </td>
                                        <td className={cn('whitespace-nowrap px-5 py-3 text-xs font-medium', pay.tone)}>{pay.label}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export interface QuickAction {
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Quick actions</h3>
            <div className="grid gap-2">
                {actions.map(({ label, description, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-foreground">{label}</span>
                            <span className="block truncate text-xs text-muted-foreground">{description}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
