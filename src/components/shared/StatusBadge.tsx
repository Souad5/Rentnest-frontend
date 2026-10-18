import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType =
    | 'AVAILABLE'
    | 'RENTED'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'FAILED'
    | 'SUSPENDED'
    | 'BANNED'
    | 'READ'
    | 'UNREAD';

// Status colors stay inside the brand palette: teal = good, amber = waiting,
// red (destructive) = bad, muted = neutral/closed.
const tone: Record<StatusType, string> = {
    AVAILABLE: 'border-primary/30 bg-primary/10 text-primary',
    ACTIVE: 'border-primary/30 bg-primary/10 text-primary',
    APPROVED: 'border-primary/30 bg-primary/10 text-primary',
    COMPLETED: 'border-primary/30 bg-primary/10 text-primary',
    READ: 'border-border bg-muted text-muted-foreground',
    PENDING: 'border-highlight/40 bg-highlight/15 text-foreground',
    UNREAD: 'border-highlight/40 bg-highlight/15 text-foreground',
    RENTED: 'border-border bg-muted text-muted-foreground',
    REJECTED: 'border-destructive/30 bg-destructive/10 text-destructive',
    FAILED: 'border-destructive/30 bg-destructive/10 text-destructive',
    SUSPENDED: 'border-destructive/30 bg-destructive/10 text-destructive',
    BANNED: 'border-destructive/30 bg-destructive/10 text-destructive',
};

interface StatusBadgeProps {
    status: StatusType | string;
    className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    const key = status.toUpperCase() as StatusType;
    return (
        <Badge
            variant="outline"
            className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', tone[key] ?? tone.RENTED, className)}
        >
            {status.toLowerCase()}
        </Badge>
    );
}

export { StatusBadge };
