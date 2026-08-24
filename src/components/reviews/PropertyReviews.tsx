'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, MessageSquareQuote, Star } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    reviewsApi,
    rentalsApi,
    ApiError,
    type PropertyReviewsData,
    type Review,
} from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { ReviewForm } from './ReviewForm';

interface ActiveRequestLike {
    status?: string;
    propertyId?: string;
}

const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Recently';
    return formatDistanceToNow(date, { addSuffix: true });
};

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';

function StarRow({ value, className }: { value: number; className?: string }) {
    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        'h-3.5 w-3.5',
                        star <= Math.round(value)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/40'
                    )}
                />
            ))}
        </div>
    );
}

interface PropertyReviewsProps {
    propertyId: string;
    className?: string;
}

export function PropertyReviews({ propertyId, className }: PropertyReviewsProps) {
    const { user, token } = useAuth();
    const [data, setData] = useState<PropertyReviewsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Eligibility rule (mirrors backend): tenants with an APPROVED or ACTIVE
    // (paid) rental request for this property may review it.
    const [canReview, setCanReview] = useState(false);

    const loadReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await reviewsApi.getByPropertyId(propertyId);
            setData(response.data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to load reviews. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadReviews();
    }, [loadReviews]);

    useEffect(() => {
        let cancelled = false;

        const checkEligibility = async () => {
            setCanReview(false);
            if (!token || user?.role !== 'TENANT') return;

            try {
                const response = await rentalsApi.getMyRequests();
                const requests = Array.isArray(response)
                    ? response
                    : ((response as { data?: ActiveRequestLike[] }).data ?? []);
                // Mirrors the backend rule: APPROVED or ACTIVE (paid) qualifies.
                const hasValidRental = requests.some(
                    (request) =>
                        (request?.status === 'APPROVED' ||
                            request?.status === 'ACTIVE') &&
                        request?.propertyId === propertyId
                );
                if (!cancelled) setCanReview(hasValidRental);
            } catch {
                // Eligibility is best-effort; the backend re-validates on POST.
            }
        };

        checkEligibility();

        return () => {
            cancelled = true;
        };
    }, [token, user?.role, propertyId]);

    const reviews = data?.reviews ?? [];
    const totalReviews = data?.totalReviews ?? reviews.length;
    const averageRating = data?.averageRating ?? 0;

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((review) => Math.round(review.rating) === star)
            .length,
    }));

    return (
        <Card className={cn('border-border shadow-xs', className)}>
            <CardHeader>
                <CardTitle className="text-xl">Ratings &amp; Reviews</CardTitle>
                <CardDescription>
                    What tenants say about this property
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadReviews}
                            className="h-8 text-xs shrink-0"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Review eligibility: active tenant of this property */}
                {canReview && !error && (
                    <div className="p-4 sm:p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Rate this property
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                You have an approved or active rental here — share
                                your experience with other tenants.
                            </p>
                        </div>
                        <ReviewForm propertyId={propertyId} onSuccess={loadReviews} />
                    </div>
                )}

                {loading ? (
                    <ReviewsSkeleton />
                ) : !error && totalReviews === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl bg-muted/30">
                        <MessageSquareQuote className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-foreground">
                            No reviews yet for this property
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                            Be the first to share your experience once you&apos;ve stayed here.
                        </p>
                    </div>
                ) : (
                    !error && (
                        <>
                            {/* Summary: average score + star distribution */}
                            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center p-4 rounded-xl border border-border bg-muted/30">
                                <div className="flex flex-col items-center justify-center text-center sm:min-w-32">
                                    <span className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
                                        {averageRating.toFixed(1)}
                                        <span className="text-lg font-medium text-muted-foreground">
                                            {' '}
                                            / 5
                                        </span>
                                    </span>
                                    <StarRow value={averageRating} className="my-1.5" />
                                    <span className="text-xs text-muted-foreground">
                                        Based on {totalReviews}{' '}
                                        {totalReviews === 1 ? 'review' : 'reviews'}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    {distribution.map(({ star, count }) => {
                                        const percentage =
                                            totalReviews > 0
                                                ? Math.round((count / totalReviews) * 100)
                                                : 0;
                                        return (
                                            <div
                                                key={star}
                                                className="flex items-center gap-2 text-xs"
                                            >
                                                <span className="flex items-center gap-0.5 w-8 justify-end font-medium text-foreground">
                                                    {star}
                                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                </span>
                                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-amber-400 transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="w-7 text-right text-muted-foreground tabular-nums">
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Individual review cards */}
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        </>
                    )
                )}
            </CardContent>
        </Card>
    );
}

function ReviewCard({ review }: { review: Review }) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(review.tenant?.name || 'Tenant')}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                        {review.tenant?.name || 'Anonymous Tenant'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(review.createdAt)}
                    </p>
                </div>
                <StarRow value={review.rating} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-12">
                {review.comment}
            </p>
        </div>
    );
}

function ReviewsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6 p-4 rounded-xl border border-border">
                <Skeleton className="h-20 w-24 rounded-xl" />
                <div className="flex-1 space-y-2">
                    {[5, 4, 3].map((star) => (
                        <Skeleton key={star} className="h-2 w-full rounded-full" />
                    ))}
                </div>
            </div>
            {[1, 2].map((item) => (
                <div key={item} className="rounded-xl border border-border p-4 space-y-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
            ))}
        </div>
    );
}
