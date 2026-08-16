import { Badge } from '@/components/ui/badge';

export type StatusType =
    | 'AVAILABLE'
    | 'RENTED'
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'ACTIVE'
    | 'SUSPENDED';

interface StatusBadgeProps {
    status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<StatusType, string> = {
        AVAILABLE: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
        ACTIVE: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
        COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
        PENDING: 'bg-amber-500/10 text-amber-600 border-amber-200',
        RENTED: 'bg-slate-500/10 text-slate-600 border-slate-200',
        FAILED: 'bg-rose-500/10 text-rose-600 border-rose-200',
        SUSPENDED: 'bg-rose-500/10 text-rose-600 border-rose-200',
    };

    return (
        <Badge variant="outline" className={`${styles[status]} font-medium text-xs px-2 py-0.5`}>
            {status}
        </Badge>
    );
}