import { cn } from '@/lib/utils';

interface SectionHeadingProps {
    /** Kept for API compatibility; the minimal design doesn't render eyebrow labels. */
    eyebrow?: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    align?: 'left' | 'center';
    action?: React.ReactNode;
    className?: string;
}

export function SectionHeading({ title, description, align = 'left', action, className }: SectionHeadingProps) {
    const centered = align === 'center';
    return (
        <div
            className={cn(
                'mb-8 flex flex-col gap-3',
                centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className={cn('space-y-1.5', centered && 'max-w-2xl')}>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
                {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
