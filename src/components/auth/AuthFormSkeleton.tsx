import { Skeleton } from '@/components/ui/skeleton';

/** Suspense fallback while search params resolve. */
export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
    return (
        <div className="space-y-7" aria-busy="true" aria-label="Loading form">
            <div className="space-y-3">
                <Skeleton className="h-9 w-2/3 rounded-xl" />
                <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
            <div className="space-y-4">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                ))}
                <Skeleton className="h-11 w-full rounded-xl" />
            </div>
        </div>
    );
}
