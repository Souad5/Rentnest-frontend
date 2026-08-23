'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AlertCircle, Loader2 } from 'lucide-react';

import { paymentsApi, ApiError } from '@/lib/api';
import { AppButton } from '@/components/shared/AppButton';

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
                router.push('/dashboard/tenant?payment=success');
                return;
            }

            // 2. Confirm the payment: card credentials go browser -> Stripe only.
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (stripeError) {
                setErrorMessage(stripeError.message || 'An error occurred with your payment.');
                setIsProcessing(false);
                submitLockRef.current = false;
                return;
            }

            // 3. ONLY a Stripe-confirmed 'succeeded' may be verified by our backend;
            //    anything else would make /payments/confirm reject with a 400.
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                try {
                    await paymentsApi.confirmPayment(paymentIntent.id);
                    router.push('/dashboard/tenant?payment=success');
                } catch (err) {
                    if (err instanceof ApiError && err.status === 400) {
                        // Server disagrees with the client-side status: surface honestly.
                        setErrorMessage(err.message || 'Payment could not be verified.');
                        setIsProcessing(false);
                        submitLockRef.current = false;
                        return;
                    }
                    throw err;
                }
                return;
            }

            // Not succeeded yet (e.g. processing / requires_action): stop and inform.
            setErrorMessage(
                `Payment not completed${paymentIntent?.status ? ` (status: ${paymentIntent.status})` : ''}. Please try again.`
            );
            setIsProcessing(false);
            submitLockRef.current = false;
        } catch (err) {
            setErrorMessage(
                err instanceof ApiError ? err.message : 'Failed to process payment. Please try again.'
            );
            setIsProcessing(false);
            submitLockRef.current = false;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
                <PaymentElement options={{ layout: 'tabs' }} />
            </div>

            {errorMessage && (
                <p className="flex items-start gap-1.5 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{errorMessage}</span>
                </p>
            )}

            <AppButton
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-all"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay $${amount.toFixed(2)}`
                )}
            </AppButton>
        </form>
    );
}
