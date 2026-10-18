import { Container } from '@/components/shared/Container';
import { cn } from '@/lib/utils';

interface PageHeroProps {
    eyebrow?: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    align?: 'left' | 'center';
    children?: React.ReactNode;
    className?: string;
}

/** Header band used by the content pages (about, contact, help, blog, legal). */
export function PageHero({ eyebrow, title, description, align = 'center', children, className }: PageHeroProps) {
    const centered = align === 'center';
    return (
        <section className={cn('relative overflow-hidden border-b border-border bg-muted/40', className)}>
            <Container className={cn('relative py-14 sm:py-20', centered && 'text-center')}>
                <div className={cn('space-y-4', centered && 'mx-auto max-w-3xl')}>
                    {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
                    <h1 className="font-serif text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">{title}</h1>
                    {description && (
                        <p
                            className={cn(
                                'text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg',
                                centered ? 'mx-auto max-w-2xl' : 'max-w-2xl',
                            )}
                        >
                            {description}
                        </p>
                    )}
                </div>
                {children && <div className="mt-8">{children}</div>}
            </Container>
        </section>
    );
}
