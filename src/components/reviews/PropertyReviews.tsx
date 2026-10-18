'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, MessageSquareQuote, RefreshCw, Star } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, rentalsApi, reviewsApi, type PropertyReviewsData } from '@/lib/api';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import type { Review } from '@/types/api';
import { ReviewForm } from './ReviewForm';

const INITIAL_VISIBLE = 4;

function relativeTime(iso: string) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? 'Recently' : formatDistanceToNow(date, { addSuffix: true });
}

export function StarRow({ value, className, size = 'sm' }: { value: number; className?: string; size?: 'sm' | 'md' }) {
    return (
        <div className={cn('flex items-center gap-0.5', className)} aria-hidden>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5',
                        star <= Math.round(value) ? 'fill-highlight text-highlight' : 'text-muted-foreground/40',
                    )}
                />
            ))}
        </div>
    );
}

interface PropertyReviewsProps {
    propertyId: string;
    /** Reviews already embedded in the property detail payload (avoids a loading flash). */
    initialReviews?: Review[];
    className?: string;
}

export function PropertyReviews({ propertyId, initialReviews, className }: PropertyReviewsProps) {
    const router = useRouter();
    const { user, token } = useAuth();
    const [showAll, setShowAll] = useState(false);

    const reviewsQuery = useQuery({
        queryKey: ['property-reviews', 'list', propertyId],
        queryFn: async (): Promise<PropertyReviewsData> => (await reviewsApi.getByPropertyId(propertyId)).data,
        initialData: initialReviews
            ? (): PropertyReviewsData => ({
                  reviews: initialReviews as PropertyReviewsData['reviews'],
                  totalReviews: initialReviews.length,
                  averageRating: initialReviews.length
                      ? Math.round((initialReviews.reduce((sum, r) => sum + r.rating, 0) / initialReviews.length) * 10) / 10
                      : 0,
              })
            : undefined,
        staleTime: 60 * 1000,
    });

    // Eligibility (mirrors the backend rule): a tenant with an APPROVED or ACTIVE
    // rental request for this property may review it. The backend re-validates on POST.
    const isTenant = Boolean(token) && user?.role === 'TENANT';
    const eligibilityQuery = useQuery({
        queryKey: ['property-reviews', 'eligibility', user?.id],
        queryFn: async () => (await rentalsApi.mine()).data,
        enabled: isTenant,
        staleTime: 60 * 1000,
    });
    const hasQualifyingRental =
        isTenant &&
        (eligibilityQuery.data ?? []).some(
            (request) => request.propertyId === propertyId && (request.status === 'APPROVED' || request.status === 'ACTIVE'),
        );

    const data = reviewsQuery.data;
    const reviews = data?.reviews ?? [];
    const totalReviews = data?.totalReviews ?? reviews.length;
    const averageRating = data?.averageRating ?? 0;
    const alreadyReviewed = Boolean(user && reviews.some((r) => r.tenant?.id === user.id));
    const canReview = hasQualifyingRental && !alreadyReviewed;

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((review) => Math.round(review.rating) === star).length,
    }));
    const visible = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE);

    const handleSubmitted = () => {
        void reviewsQuery.refetch();
        // Refresh the server-rendered rating in the page header and key facts.
        router.refresh();
    };

    return (
        <div className={cn('space-y-6', className)}>
            {canReview && (
                <div className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Rate this home</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            You have an approved or active rental here — your review helps the next tenant decide.
                        </p>
                    </div>
                    <ReviewForm propertyId={propertyId} onSuccess={handleSubmitted} />
                </div>
            )}
            {hasQualifyingRental && alreadyReviewed && (
                <p className="flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    You&apos;ve already reviewed this home. You can see all your reviews in{' '}
                    <Link href="/dashboard/tenant/reviews" className="font-medium text-primary underline-offset-4 hover:underline">
                        your dashboard
                    </Link>
                    .
                </p>
            )}

            {reviewsQuery.isPending ? (
                <ReviewsSkeleton />
            ) : reviewsQuery.isError ? (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
                >
                    <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {reviewsQuery.error instanceof ApiError ? reviewsQuery.error.message : 'We couldn’t load reviews.'}
                    </span>
                    <Button
                        variant="outline"
                        className="h-9 rounded-xl"
                        onClick={() => reviewsQuery.refetch()}
                        disabled={reviewsQuery.isFetching}
                    >
                        <RefreshCw className={cn('h-4 w-4', reviewsQuery.isFetching && 'animate-spin')} /> Retry
                    </Button>
                </div>
            ) : totalReviews === 0 ? (
                <EmptyState
                    icon={MessageSquareQuote}
                    title="No reviews yet"
                    description="Tenants who rent this home through RentNest can leave the first review once their rental is approved."
                />
            ) : (
                <>
                    <div className="grid items-center gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:grid-cols-[auto_1fr]">
                        <div className="flex flex-col items-center text-center sm:min-w-36">
                            <span className="font-serif text-5xl font-semibold tracking-tight text-foreground tabular-nums">
                                {averageRating.toFixed(1)}
                            </span>
                            <StarRow value={averageRating} size="md" className="my-2" />
                            <span className="text-xs text-muted-foreground">
                                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                            </span>
                        </div>
                        <ul className="space-y-2" aria-label="Rating distribution">
                            {distribution.map(({ star, count }) => {
                                const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                return (
                                    <li key={star} className="flex items-center gap-3 text-xs">
                                        <span className="flex w-8 items-center justify-end gap-0.5 font-medium text-foreground">
                                            {star}
                                            <Star className="h-3 w-3 fill-highlight text-highlight" />
                                        </span>
                                        <div
                                            className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                                            role="progressbar"
                                            aria-label={`${star} star reviews`}
                                            aria-valuenow={pct}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div className="h-full rounded-full bg-highlight transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="w-8 text-right tabular-nums text-muted-foreground">{count}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <ul className="space-y-4">
                        {visible.map((review) => (
                            <li key={review.id}>
                                <ReviewCard review={review} />
                            </li>
                        ))}
                    </ul>

                    {reviews.length > INITIAL_VISIBLE && (
                        <Button variant="outline" className="h-10 rounded-xl" onClick={() => setShowAll((v) => !v)}>
                            {showAll ? 'Show fewer reviews' : `Show all ${reviews.length} reviews`}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}

function ReviewCard({ review }: { review: Pick<Review, 'rating' | 'comment' | 'createdAt' | 'tenant'> }) {
    const name = review.tenant?.name || 'RentNest tenant';
    return (
        <article className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                        {/* Relative time is SSR'd from initialData and can tick over before hydration. */}
                        <time dateTime={review.createdAt} suppressHydrationWarning>
                            {relativeTime(review.createdAt)}
                        </time>
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <StarRow value={review.rating} />
                    <span className="sr-only">Rated {review.rating} out of 5</span>
                </div>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
        </article>
    );
}

function ReviewsSkeleton() {
    return (
        <div className="space-y-4" aria-busy="true">
            <div className="flex items-center gap-6 rounded-2xl border border-border p-5">
                <Skeleton className="h-20 w-28 rounded-xl" />
                <div className="flex-1 space-y-2.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <Skeleton key={star} className="h-2 w-full rounded-full" />
                    ))}
                </div>
            </div>
            {[1, 2].map((item) => (
                <div key={item} className="space-y-3 rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-28 rounded-full" />
                            <Skeleton className="h-3 w-16 rounded-full" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-3/4 rounded-full" />
                </div>
            ))}
        </div>
    );
}
