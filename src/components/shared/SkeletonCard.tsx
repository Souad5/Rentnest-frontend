import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonCard() {
    return (
        <div className="flex flex-col space-y-3.5">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-5 w-2/3 rounded-full" />
            <div className="flex gap-3">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-1 h-6 w-28 rounded-full" />
        </div>
    );
}
