import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/** Placeholder shaped like an AppDataTable while an admin list loads. */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Skeleton className="h-9 w-full max-w-sm rounded-xl" />
                <Skeleton className="h-9 w-40 rounded-xl" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex gap-4 border-b border-border px-4 py-3">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-4 flex-1 rounded-md" />
                    ))}
                </div>
                <div className="divide-y divide-border">
                    {Array.from({ length: rows }).map((_, r) => (
                        <div key={r} className="flex items-center gap-4 px-4 py-4">
                            {Array.from({ length: columns }).map((_, c) => (
                                <Skeleton key={c} className={c === 0 ? 'h-9 flex-1 rounded-xl' : 'h-4 flex-1 rounded-md'} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <span className="sr-only">Loading…</span>
        </div>
    );
}

/** Error card with a Retry button for failed admin requests. */
export function ErrorState({
    title = 'Could not load this data',
    message,
    onRetry,
    retrying,
}: {
    title?: string;
    message?: string;
    onRetry: () => void;
    retrying?: boolean;
}) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-card px-6 py-12 text-center shadow-sm"
        >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {message && <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{message}</p>}
            <Button variant="outline" className="mt-5 rounded-xl" onClick={onRetry} disabled={retrying}>
                <RotateCw className={retrying ? 'animate-spin' : undefined} />
                Retry
            </Button>
        </div>
    );
}

/** Small "label: value" pills shown under page headers. */
export function CountPills({ items }: { items: Array<{ label: string; value: number | string }> }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                >
                    {item.label}
                    <span className="font-semibold text-foreground">{item.value}</span>
                </span>
            ))}
        </div>
    );
}
