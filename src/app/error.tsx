'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Unhandled Runtime Error:', error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Something went wrong!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        An unexpected error occurred while loading this page. Please try again or return to the homepage.
                    </p>
                    {error.digest && (
                        <p className="mt-2 inline-block rounded bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground/70">
                            Error Digest: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-center">
                    <Button
                        onClick={() => reset()}
                        variant="default"
                        className="flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Go to Homepage
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}