import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    icon: LucideIcon;
    hint?: React.ReactNode;
    tone?: 'primary' | 'highlight' | 'ink' | 'muted';
    loading?: boolean;
    className?: string;
}

const toneClass = {
    primary: 'bg-primary/10 text-primary',
    highlight: 'bg-highlight/20 text-foreground',
    ink: 'bg-ink text-ink-foreground',
    muted: 'bg-muted text-muted-foreground',
};

/** Overview card used on every dashboard. All cards share size, radius and style. */
export function StatCard({ label, value, icon: Icon, hint, tone = 'primary', loading, className }: StatCardProps) {
    return (
        <div className={cn('flex h-full items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm', className)}>
            <div className="min-w-0 space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                {loading ? (
                    <Skeleton className="h-8 w-24 rounded-lg" />
                ) : (
                    <p className="truncate font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{value}</p>
                )}
                {hint && !loading && <p className="text-xs text-muted-foreground">{hint}</p>}
            </div>
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneClass[tone])}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
    );
}
