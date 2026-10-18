'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Unhandled runtime error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[70vh] flex-1 items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-7 w-7" />
                </span>
                <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    An unexpected error stopped this page from loading. Please try again — if it keeps happening, contact our
                    support team.
                </p>
                {error.digest && (
                    <p className="mt-4 inline-block rounded-lg bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
                        Reference: {error.digest}
                    </p>
                )}
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        <RefreshCw className="h-4 w-4" /> Try again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                        <Home className="h-4 w-4" /> Go to homepage
                    </Link>
                </div>
                <Link href="/contact" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                    Contact support
                </Link>
            </div>
        </div>
    );
}
