'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info, Loader2, RefreshCw, Lightbulb, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, aiApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminInsights } from '@/types/api';
import { errorMessage } from './useAdminQuery';

type Severity = AdminInsights['insights'][number]['severity'];

const severityStyle: Record<Severity, { card: string; icon: string; Icon: typeof Info; label: string }> = {
    positive: { card: 'border-primary/30 bg-primary/5', icon: 'bg-primary/10 text-primary', Icon: TrendingUp, label: 'Positive' },
    warning: { card: 'border-highlight/50 bg-highlight/10', icon: 'bg-highlight/25 text-foreground', Icon: AlertTriangle, label: 'Needs attention' },
    info: { card: 'border-border bg-muted/40', icon: 'bg-muted text-muted-foreground', Icon: Info, label: 'Info' },
};

function NotConfigured() {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
                <p className="font-medium text-foreground">AI is not configured</p>
                <p className="mt-0.5 text-muted-foreground">
                    Set <code className="rounded bg-muted px-1 font-mono text-xs">ANTHROPIC_API_KEY</code> on the backend to generate insights
                    from your platform data.
                </p>
            </div>
        </div>
    );
}

/**
 * 503 is also returned when Claude is temporarily rate limited ("busy"), which
 * must stay retryable; only the "not configured" 503 hides the generate button.
 */
function isNotConfigured(error: unknown) {
    return error instanceof ApiError && error.status === 503 && /not configured/i.test(error.message);
}

/** Claude-generated summary of the admin stats, generated on demand. */
export function AIInsightsPanel() {
    const status = useQuery({
        queryKey: ['ai', 'status'],
        queryFn: async () => (await aiApi.status()).data,
        staleTime: 5 * 60_000,
    });

    const insights = useMutation({
        mutationFn: async () => (await aiApi.adminInsights()).data,
        onError: (error) => {
            if (!isNotConfigured(error)) toast.error(errorMessage(error, 'Could not generate insights'));
        },
    });

    const notConfigured = status.data?.enabled === false || isNotConfigured(insights.error);
    const data = insights.data;

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="ai-insights-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-ink-foreground">
                        <Lightbulb className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                        <h2 id="ai-insights-title" className="font-serif text-lg font-semibold tracking-tight text-foreground">
                            AI insights
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {data
                                ? `Generated ${formatDate(data.generatedAt, { dateStyle: 'medium', timeStyle: 'short' })}`
                                : 'A quick read of growth, revenue and backlog trends, written by Claude from live platform stats.'}
                        </p>
                    </div>
                </div>
                {!notConfigured && (
                    <Button
                        className="rounded-xl"
                        variant={data ? 'outline' : 'default'}
                        onClick={() => insights.mutate()}
                        disabled={insights.isPending || status.isPending}
                    >
                        {insights.isPending ? <Loader2 className="animate-spin" /> : data ? <RefreshCw /> : <Lightbulb />}
                        {insights.isPending ? 'Analysing…' : data ? 'Regenerate' : 'Generate insights'}
                    </Button>
                )}
            </div>

            <div className="mt-5" aria-live="polite">
                {notConfigured ? (
                    <NotConfigured />
                ) : insights.isPending ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-28 rounded-xl" />
                            ))}
                        </div>
                    </div>
                ) : insights.isError ? (
                    <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-destructive">{errorMessage(insights.error, 'Could not generate insights.')}</p>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => insights.mutate()}>
                            <RefreshCw />
                            Retry
                        </Button>
                    </div>
                ) : data ? (
                    <div className="space-y-4">
                        <p className="rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground">{data.summary}</p>
                        {data.insights.length > 0 && (
                            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {data.insights.map((insight, i) => {
                                    const style = severityStyle[insight.severity] ?? severityStyle.info;
                                    return (
                                        <li key={`${insight.title}-${i}`} className={cn('rounded-xl border p-4', style.card)}>
                                            <div className="flex items-start gap-3">
                                                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', style.icon)}>
                                                    <style.Icon className="h-4 w-4" aria-hidden />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{style.label}</p>
                                                    <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">{insight.detail}</p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                ) : (
                    <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        Click <span className="font-medium text-foreground">Generate insights</span> to get a summary with highlights and items that
                        need your attention.
                    </p>
                )}
            </div>
        </section>
    );
}
