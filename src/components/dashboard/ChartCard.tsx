import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartCardProps {
    title: string;
    description?: string;
    loading?: boolean;
    /** Shown instead of the chart when there is no data to plot. */
    empty?: boolean;
    emptyMessage?: string;
    action?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

/** Card wrapper for recharts charts: consistent header, fixed height, loading + empty states. */
export function ChartCard({ title, description, loading, empty, emptyMessage = 'No data yet.', action, className, children }: ChartCardProps) {
    return (
        <section className={cn('flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm', className)}>
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
                </div>
                {action}
            </div>
            <div className="h-64 w-full">
                {loading ? (
                    <Skeleton className="h-full w-full rounded-xl" />
                ) : empty ? (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : (
                    children
                )}
            </div>
        </section>
    );
}
