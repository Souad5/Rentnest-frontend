import { Container } from '@/components/shared/Container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex-1 bg-background" aria-busy="true" aria-label="Loading page">
            <Container className="space-y-10 py-12 sm:py-16">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-10 w-full max-w-md rounded-xl" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <Skeleton className="aspect-[4/3] w-full rounded-none" />
                            <div className="space-y-3 p-4">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex justify-between pt-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}
