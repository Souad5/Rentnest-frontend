import Link from 'next/link';
import { Home, Search, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FileQuestion className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">404</h1>
                    <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
                    <p className="text-sm text-muted-foreground">
                        Sorry, we couldn&apos;t find the page or property listing you were looking for.
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-center">
                    <Button
                        asChild
                        variant="default"
                        className="flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Return Home
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                        <Link href="/properties">
                            <Search className="h-4 w-4" />
                            Browse Listings
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}