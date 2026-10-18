import { cn } from '@/lib/utils';

interface SectionHeadingProps {
    eyebrow?: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    align?: 'left' | 'center';
    action?: React.ReactNode;
    className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = 'left', action, className }: SectionHeadingProps) {
    const centered = align === 'center';
    return (
        <div
            className={cn(
                'mb-10 flex flex-col gap-4',
                centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className={cn('space-y-3', centered && 'max-w-2xl')}>
                {eyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
                )}
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
                {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
