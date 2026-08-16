export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8 animate-pulse">
            {/* Hero / Banner Skeleton */}
            <div className="h-64 sm:h-80 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />

            {/* Header Skeleton */}
            <div className="space-y-3">
                <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-9 w-64 rounded bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-card"
                    >
                        <div className="h-48 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="flex justify-between pt-2">
                            <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <div className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800 mt-2" />
                    </div>
                ))}
            </div>
        </div>
    );
}