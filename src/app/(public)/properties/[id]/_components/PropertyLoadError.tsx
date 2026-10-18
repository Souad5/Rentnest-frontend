'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Friendly state when the API is unreachable or errors while loading a property. */
export function PropertyLoadError({ message }: { message?: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return (
        <Container className="py-20 sm:py-28">
            <div
                role="alert"
                className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm"
            >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">We couldn&apos;t load this home</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {message || 'Our servers didn’t respond in time. Please try again in a moment.'}
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Button
                        className="h-10 rounded-xl px-4"
                        disabled={pending}
                        onClick={() => startTransition(() => router.refresh())}
                    >
                        <RefreshCw className={cn('h-4 w-4', pending && 'animate-spin')} /> Retry
                    </Button>
                    <Button asChild variant="outline" className="h-10 rounded-xl px-4">
                        <Link href="/properties">
                            <ArrowLeft className="h-4 w-4" /> Back to Explore
                        </Link>
                    </Button>
                </div>
            </div>
        </Container>
    );
}
