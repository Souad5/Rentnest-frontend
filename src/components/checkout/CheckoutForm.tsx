'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AlertCircle, Loader2, Lock } from 'lucide-react';

import { paymentsApi, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/format';

interface CheckoutFormProps {
    rentalRequestId: string;
    amount: number;
    clientSecret: string;
}

export function CheckoutForm({ amount, clientSecret }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Guards against double submission racing past button disabled-state
    // (double clicks, Strict Mode remounts).
    const submitLockRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;
        if (submitLockRef.current) return;
        submitLockRef.current = true;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // 1. Ask Stripe for the authoritative intent status BEFORE confirming.
            //    Re-confirming an already-succeeded intent triggers
            //    payment_intent_unexpected_state, so settle it directly instead.
            const existing = await stripe.retrievePaymentIntent(clientSecret);

            if (existing.paymentIntent?.status === 'succeeded') {
                await paymentsApi.confirmPayment(existing.paymentIntent.id);
                toast.success('Payment successful', {
                    description: 'Your lease is now active.',
                });
                router.push('/dashboard/tenant/requests?payment=success');
                return;
            }

            // 2. Confirm the payment: card credentials go browser -> Stripe only.
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (stripeError) {
                const message =
                    stripeError.message || 'An error occurred with your payment.';
                setErrorMessage(message);
                toast.error(message);
                setIsProcessing(false);
                submitLockRef.current = false;
                return;
            }

            // 3. ONLY a Stripe-confirmed 'succeeded' may be verified by our backend;
            //    anything else would make /payments/confirm reject with a 400.
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                try {
                    await paymentsApi.confirmPayment(paymentIntent.id);
                    toast.success('Payment successful', {
                        description: 'Your lease is now active.',
                    });
                    router.push('/dashboard/tenant/requests?payment=success');
                } catch (err) {
                    if (err instanceof ApiError && err.status === 400) {
                        // Server disagrees with the client-side status: surface honestly.
                        const message =
                            err.message || 'Payment could not be verified.';
                        setErrorMessage(message);
                        toast.error(message);
                        setIsProcessing(false);
                        submitLockRef.current = false;
                        return;
                    }
                    throw err;
                }
                return;
            }

            // Not succeeded yet (e.g. processing / requires_action): stop and inform.
            const incompleteMessage = `Payment not completed${paymentIntent?.status ? ` (status: ${paymentIntent.status})` : ''}. Please try again.`;
            setErrorMessage(incompleteMessage);
            toast.error(incompleteMessage);
            setIsProcessing(false);
            submitLockRef.current = false;
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : 'Failed to process payment. Please try again.';
            setErrorMessage(message);
            toast.error(message);
            setIsProcessing(false);
            submitLockRef.current = false;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
                <PaymentElement options={{ layout: 'tabs' }} />
            </div>

            {errorMessage && (
                <p
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                </p>
            )}

            <Button type="submit" disabled={!stripe || isProcessing} className="h-11 w-full rounded-xl text-sm font-semibold">
                {isProcessing ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing…
                    </>
                ) : (
                    <>
                        <Lock className="h-4 w-4" />
                        Pay {formatMoney(amount)}
                    </>
                )}
            </Button>
        </form>
    );
}
