import { Container } from '@/components/shared/Container';
import { Skeleton } from '@/components/ui/skeleton';

export default function PropertyDetailLoading() {
    return (
        <Container className="pb-16 pt-6 sm:pt-8">
            <Skeleton className="h-4 w-64 max-w-full rounded-full" />
            <div className="mt-6 space-y-3">
                <Skeleton className="h-5 w-40 rounded-full" />
                <Skeleton className="h-10 w-full max-w-2xl rounded-xl" />
                <Skeleton className="h-4 w-72 max-w-full rounded-full" />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4 md:grid-rows-2">
                <Skeleton className="aspect-[4/3] rounded-2xl sm:aspect-[16/9] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[400px]" />
                {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="hidden rounded-2xl md:block" />
                ))}
            </div>
            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
                <div className="space-y-4">
                    <Skeleton className="h-7 w-40 rounded-full" />
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-4 w-11/12 rounded-full" />
                    <Skeleton className="h-4 w-4/5 rounded-full" />
                    <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
                </div>
                <Skeleton className="hidden h-80 rounded-2xl lg:block" />
            </div>
        </Container>
    );
}
