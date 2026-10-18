'use client';

import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ReviewForm } from '@/components/reviews/ReviewForm';

interface ReviewTarget {
    propertyId: string;
    propertyTitle?: string;
}

interface ReviewFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Property being reviewed; kept null-safe so closing animations never crash. */
    propertyId?: string | null;
    propertyTitle?: string;
    /** Invoked once the review has been submitted successfully (before auto-close). */
    onSuccess?: () => void;
    /** Delay before auto-closing after a successful submission (lets the user read the confirmation). */
    closeDelayMs?: number;
}

/**
 * Reusable "Leave a Review" dialog around ReviewForm.
 *
 * The backend only accepts reviews from tenants with an APPROVED/ACTIVE rental
 * and one review per tenant per property — violations surface as inline form
 * errors via ApiError messages, so no extra gating happens here.
 */
export function ReviewFormModal({
    open,
    onOpenChange,
    propertyId,
    propertyTitle,
    onSuccess,
    closeDelayMs = 2000,
}: ReviewFormModalProps) {
    // Snapshot the target while open so content (and the dialog's exit
    // animation) survives the parent clearing its state on close.
    const [target, setTarget] = useState<ReviewTarget | null>(null);
    if (open && propertyId && (target?.propertyId !== propertyId || target?.propertyTitle !== propertyTitle)) {
        setTarget({ propertyId, propertyTitle });
    }

    // Pending auto-close from a previous submission must not close a dialog
    // reopened (possibly for another property) within the delay.
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = null;
    }, [open, target?.propertyId]);
    useEffect(() => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl p-5 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-serif text-lg tracking-tight">
                        <Star className="h-4 w-4 fill-highlight text-highlight" />
                        Rate your stay
                    </DialogTitle>
                    <DialogDescription>
                        Share your experience at{' '}
                        <span className="font-semibold text-foreground">
                            {target?.propertyTitle || 'this property'}
                        </span>{' '}
                        to help other tenants make informed decisions.
                    </DialogDescription>
                </DialogHeader>

                {target && (
                    <ReviewForm
                        key={target.propertyId}
                        propertyId={target.propertyId}
                        onSuccess={() => {
                            onSuccess?.();
                            if (closeTimer.current) clearTimeout(closeTimer.current);
                            closeTimer.current = setTimeout(() => onOpenChange(false), closeDelayMs);
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
