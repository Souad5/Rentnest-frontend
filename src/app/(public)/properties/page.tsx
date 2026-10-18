import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/shared/Container';
import { PropertyCardSkeleton } from '@/components/shared/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ExploreView } from './_components/ExploreView';

export const metadata: Metadata = {
    title: 'Explore rental homes',
    description:
        'Browse available apartments, studios and family homes on RentNest. Filter by location, monthly budget, bedrooms and tenant rating, then request your dates online.',
};

export default function PropertiesPage() {
    // useSearchParams() in ExploreView needs a Suspense boundary.
    return (
        <Suspense fallback={<ExploreFallback />}>
            <ExploreView />
        </Suspense>
    );
}

function ExploreFallback() {
    return (
        <div aria-busy="true">
            <section className="border-b border-border bg-muted/40">
                <Container className="space-y-4 py-10 sm:py-14">
                    <Skeleton className="h-3 w-28 rounded-full" />
                    <Skeleton className="h-10 w-full max-w-xl rounded-xl" />
                    <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
                    <Skeleton className="mt-2 h-14 w-full max-w-3xl rounded-2xl" />
                </Container>
            </section>
            <Container className="py-8 sm:py-10">
                <Skeleton className="hidden h-[78px] w-full rounded-2xl lg:block" />
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 12 }, (_, i) => (
                        <PropertyCardSkeleton key={i} />
                    ))}
                </div>
            </Container>
        </div>
    );
}
