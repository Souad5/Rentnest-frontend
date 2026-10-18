import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Home, LifeBuoy, Search } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export const metadata: Metadata = {
    title: 'Page not found',
};

export default function NotFound() {
    return (
        <div className="flex min-h-dvh flex-1 flex-col bg-background">
            <header className="flex h-16 items-center px-4 sm:px-8">
                <Logo />
            </header>
            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg text-center">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Compass className="h-8 w-8" />
                    </span>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Error 404</p>
                    <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                        This page has moved out
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                        We couldn’t find the page or listing you were looking for. It may have been removed, or the link
                        may be mistyped.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            <Home className="h-4 w-4" /> Back to home
                        </Link>
                        <Link
                            href="/properties"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted"
                        >
                            <Search className="h-4 w-4" /> Browse properties
                        </Link>
                    </div>
                    <Link
                        href="/help"
                        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                        <LifeBuoy className="h-4 w-4" /> Visit the help center
                    </Link>
                </div>
            </main>
        </div>
    );
}
