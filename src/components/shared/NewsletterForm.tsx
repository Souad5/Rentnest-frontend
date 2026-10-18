'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { publicApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({ email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address') });
type Values = z.infer<typeof schema>;

/** Newsletter signup wired to POST /newsletter. `tone="ink"` for dark bands. */
export function NewsletterForm({ tone = 'default', className }: { tone?: 'default' | 'ink'; className?: string }) {
    const [done, setDone] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(schema) });

    const onSubmit = async ({ email }: Values) => {
        try {
            const res = await publicApi.subscribe(email);
            setDone(res.message || 'Subscribed');
            toast.success(res.message || 'You are subscribed!');
            reset();
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : 'Could not subscribe right now. Please try again.');
        }
    };

    const ink = tone === 'ink';

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn('w-full space-y-2', className)}>
            <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor={`newsletter-${tone}`}>
                    Email address
                </label>
                <input
                    id={`newsletter-${tone}`}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    {...register('email', { onChange: () => setDone(null) })}
                    className={cn(
                        'h-11 w-full min-w-0 rounded-xl border px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        ink
                            ? 'border-ink-foreground/20 bg-ink-foreground/10 text-ink-foreground placeholder:text-ink-foreground/60'
                            : 'border-input bg-card text-foreground placeholder:text-muted-foreground',
                    )}
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Subscribe
                </button>
            </div>
            {errors.email && <p className={cn('text-xs', ink ? 'text-highlight' : 'text-destructive')}>{errors.email.message}</p>}
            {done && (
                <p className={cn('flex items-center gap-1.5 text-xs', ink ? 'text-ink-foreground/80' : 'text-primary')}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {done}
                </p>
            )}
        </form>
    );
}
