'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { paymentsApi, ApiError } from '@/lib/api';

interface CheckoutFormProps {
    rentalRequestId: string;
    amount: number;
    clientSecret: string;
}

export function CheckoutForm({ rentalRequestId, amount }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // 1. Confirm payment with Stripe on the client side
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (stripeError) {
                setErrorMessage(stripeError.message || 'An error occurred with your payment.');
                setIsProcessing(false);
                return;
            }

            // 2. If Stripe payment succeeds, notify backend to update status to ACTIVE
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                await paymentsApi.confirmPayment(
                    rentalRequestId,
                    paymentIntent.id,
                    amount
                );

                // 3. Redirect back to tenant requests with success state
                router.push('/dashboard/tenant/requests?payment=success');
            } else {
                setErrorMessage('Payment verification pending. Please check back shortly.');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage('Failed to verify payment with server. Please contact support.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                    }}
                />
            </div>

            {errorMessage && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-all gap-2"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing Payment...</span>
                    </>
                ) : (
                    <>
                        <Lock className="h-4 w-4" />
                        <span>Pay ${amount.toFixed(2)} Securely</span>
                    </>
                )}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Encrypted 256-bit Stripe Secure Checkout</span>
            </div>
        </form>
    );
}