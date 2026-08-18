import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonCard() {
    return (
        <div className="rounded-xl border border-border overflow-hidden p-4 space-y-3 bg-white">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
            </div>
        </div>
    );
}