import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';

export default function PropertyNotFound() {
    return (
        <Container className="py-20 sm:py-28">
            <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <SearchX className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">This listing isn&apos;t available</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    The home may have been removed by its landlord, or the link is incorrect. There are plenty of other
                    homes waiting on Explore.
                </p>
                <Button asChild className="mt-6 h-10 rounded-xl px-4">
                    <Link href="/properties">
                        <ArrowLeft className="h-4 w-4" /> Browse available homes
                    </Link>
                </Button>
            </div>
        </Container>
    );
}
