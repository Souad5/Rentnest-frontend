import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    icon: LucideIcon;
    hint?: React.ReactNode;
    /** Kept for API compatibility; cards are uniformly neutral. */
    tone?: 'primary' | 'highlight' | 'ink' | 'muted';
    loading?: boolean;
    className?: string;
}

/** Overview card used on every dashboard. Flat, neutral, identical everywhere. */
export function StatCard({ label, value, icon: Icon, hint, loading, className }: StatCardProps) {
    return (
        <div className={cn('flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5', className)}>
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </div>
            {loading ? (
                <Skeleton className="h-8 w-24 rounded-md" />
            ) : (
                <p className="truncate text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
            )}
            {hint && !loading && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}
