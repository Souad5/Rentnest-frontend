'use client';

import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Loader2, Send, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, reviewsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const MAX_COMMENT_LENGTH = 500;
// Matches the backend rule (comment min 5) so feedback is instant.
const MIN_COMMENT_LENGTH = 5;

const RATING_LABELS: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very good',
    5: 'Excellent',
};

const reviewSchema = z.object({
    rating: z
        .number({ required_error: 'Please select a star rating', invalid_type_error: 'Please select a star rating' })
        .int()
        .min(1, 'Please select a star rating')
        .max(5),
    comment: z
        .string()
        .trim()
        .min(MIN_COMMENT_LENGTH, `Write at least ${MIN_COMMENT_LENGTH} characters about your stay`)
        .max(MAX_COMMENT_LENGTH, `Keep it under ${MAX_COMMENT_LENGTH} characters`),
});

type ReviewValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    propertyId: string;
    /** Invoked after a successful submission so the parent can refresh the reviews list. */
    onSuccess?: () => void;
    className?: string;
}

export function ReviewForm({ propertyId, onSuccess, className }: ReviewFormProps) {
    const [hovered, setHovered] = useState(0);
    const [success, setSuccess] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ReviewValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0, comment: '' },
    });

    const comment = useWatch({ control, name: 'comment' }) ?? '';

    const onSubmit = async (values: ReviewValues) => {
        setSuccess(false);
        try {
            await reviewsApi.createReview({ propertyId, rating: values.rating, comment: values.comment });
            reset({ rating: 0, comment: '' });
            setSuccess(true);
            toast.success('Review submitted', { description: 'Thanks for helping other tenants decide.' });
            onSuccess?.();
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'We couldn’t submit your review. Please try again.';
            setError('root', { type: 'server', message });
            toast.error(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn('space-y-4', className)}>
            {errors.root?.message && (
                <div role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                    <span>{errors.root.message}</span>
                </div>
            )}

            {success && (
                <div role="status" className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Review submitted. Thank you for sharing your experience!</span>
                </div>
            )}

            <Controller
                control={control}
                name="rating"
                render={({ field }) => {
                    const display = hovered || field.value;
                    return (
                        <div className="space-y-1.5">
                            <Label id={`rating-label-${propertyId}`} className="text-xs">
                                Your rating
                            </Label>
                            <div className="flex items-center gap-1.5">
                                <div
                                    role="radiogroup"
                                    aria-labelledby={`rating-label-${propertyId}`}
                                    aria-invalid={Boolean(errors.rating) || undefined}
                                    className="flex items-center gap-0.5"
                                    onMouseLeave={() => setHovered(0)}
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="radio"
                                            aria-checked={field.value === value}
                                            aria-label={`${value} star${value > 1 ? 's' : ''} — ${RATING_LABELS[value]}`}
                                            disabled={isSubmitting}
                                            onClick={() => field.onChange(value)}
                                            onMouseEnter={() => setHovered(value)}
                                            className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
                                        >
                                            <Star
                                                className={cn(
                                                    'h-7 w-7 transition-colors',
                                                    value <= display ? 'fill-highlight text-highlight' : 'text-muted-foreground/40',
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {display > 0 && (
                                    <span className="ml-1 text-xs font-medium text-muted-foreground">{RATING_LABELS[display]}</span>
                                )}
                            </div>
                            {errors.rating?.message && <p className="text-xs text-destructive">{errors.rating.message}</p>}
                        </div>
                    );
                }}
            />

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`review-comment-${propertyId}`} className="text-xs">
                        Your review
                    </Label>
                    <span
                        className={cn(
                            'text-[11px] tabular-nums',
                            comment.length >= MAX_COMMENT_LENGTH ? 'text-destructive' : 'text-muted-foreground',
                        )}
                    >
                        {comment.length}/{MAX_COMMENT_LENGTH}
                    </span>
                </div>
                <Textarea
                    id={`review-comment-${propertyId}`}
                    maxLength={MAX_COMMENT_LENGTH}
                    placeholder="How was the location, the condition of the home and the landlord’s responsiveness?"
                    rows={4}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.comment) || undefined}
                    className="resize-none rounded-xl text-sm"
                    {...register('comment')}
                />
                {errors.comment?.message && <p className="text-xs text-destructive">{errors.comment.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="h-10 w-full rounded-xl">
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting review…
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" /> Submit review
                    </>
                )}
            </Button>
        </form>
    );
}
