'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Loader2, Send, Star } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppButton } from '@/components/shared/AppButton';
import { cn } from '@/lib/utils';
import { reviewsApi, ApiError } from '@/lib/api';

const MAX_COMMENT_LENGTH = 500;
// Matches the backend Zod rule so feedback is instant instead of a failed request.
const MIN_COMMENT_LENGTH = 5;

const RATING_LABELS: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very good',
    5: 'Excellent',
};

interface ReviewFormProps {
    propertyId: string;
    /** Invoked after a successful submission so the parent can refresh the reviews list. */
    onSuccess?: () => void;
    className?: string;
}

export function ReviewForm({ propertyId, onSuccess, className }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const displayRating = hoveredRating || rating;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (rating < 1) {
            setError('Please select a star rating.');
            return;
        }

        if (!comment.trim()) {
            setError('Please write a short comment about your experience.');
            return;
        }

        if (comment.trim().length < MIN_COMMENT_LENGTH) {
            setError(
                `Your review is too short — it must be at least ${MIN_COMMENT_LENGTH} characters long.`
            );
            return;
        }

        try {
            setSubmitting(true);
            await reviewsApi.createReview({
                propertyId,
                rating,
                comment: comment.trim(),
            });

            // Refresh the parent list first, then surface feedback and reset.
            onSuccess?.();
            setSuccess(true);
            setRating(0);
            setHoveredRating(0);
            setComment('');
            toast.success('Review submitted successfully', {
                description: 'Thanks for sharing your experience!',
            });

            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : 'Failed to submit your review. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Review submitted successfully. Thank you for your feedback!</span>
                </div>
            )}

            <div className="space-y-1.5">
                <Label className="text-xs">Your rating</Label>
                <div className="flex items-center gap-1.5">
                    <div
                        className="flex items-center gap-0.5"
                        role="radiogroup"
                        aria-label="Star rating"
                        onMouseLeave={() => setHoveredRating(0)}
                    >
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={rating === value}
                                aria-label={`${value} star${value > 1 ? 's' : ''}`}
                                disabled={submitting}
                                onClick={() => setRating(value)}
                                onMouseEnter={() => setHoveredRating(value)}
                                className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none"
                            >
                                <Star
                                    className={cn(
                                        'h-7 w-7 transition-colors',
                                        value <= displayRating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-muted-foreground/40'
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    {displayRating > 0 && (
                        <span className="ml-1 text-xs font-medium text-muted-foreground">
                            {RATING_LABELS[displayRating]}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="review-comment" className="text-xs">
                        Your review
                    </Label>
                    <span
                        className={cn(
                            'text-[11px] tabular-nums',
                            comment.length >= MAX_COMMENT_LENGTH
                                ? 'text-destructive'
                                : comment.trim().length > 0 &&
                                    comment.trim().length < MIN_COMMENT_LENGTH
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                        )}
                    >
                        {comment.length}/{MAX_COMMENT_LENGTH}
                        {comment.trim().length > 0 &&
                            comment.trim().length < MIN_COMMENT_LENGTH &&
                            ` · min ${MIN_COMMENT_LENGTH} characters`}
                    </span>
                </div>
                <Textarea
                    id="review-comment"
                    value={comment}
                    maxLength={MAX_COMMENT_LENGTH}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Share details about your stay — location, condition, landlord responsiveness..."
                    rows={4}
                    disabled={submitting}
                    className="resize-none text-sm"
                />
            </div>

            <AppButton type="submit" disabled={submitting} className="w-full gap-2">
                {submitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Review...</span>
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        <span>Submit Review</span>
                    </>
                )}
            </AppButton>
        </form>
    );
}
