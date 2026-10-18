import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SectionErrorProps {
    title?: string;
    message?: string | null;
    onRetry: () => void;
    className?: string;
}

/** Inline error panel with a Retry button, used by every home section that fetches data. */
export function SectionError({ title = 'Something went wrong', message, onRetry, className }: SectionErrorProps) {
    return (
        <div
            role="alert"
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center',
                className,
            )}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <TriangleAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                {message && <p className="mx-auto max-w-sm text-sm text-muted-foreground">{message}</p>}
            </div>
            <Button variant="outline" onClick={onRetry} className="h-10 rounded-xl px-4">
                <RefreshCw className="h-4 w-4" /> Retry
            </Button>
        </div>
    );
}
