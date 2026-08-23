'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    CheckCircle2,
    Building2,
    Home,
    Loader2,
    RefreshCw,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentsApi, ApiError } from '@/lib/api';

interface PaymentRecord {
    id: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    amount: number;
    paidAt: string | null;
}

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment');

    const [payment, setPayment] = useState<PaymentRecord | null>(null);
    const [verifying, setVerifying] = useState<boolean>(true);
    const [verifyError, setVerifyError] = useState<string | null>(null);

    const verifyPayment = useCallback(async () => {
        if (!paymentId) {
            // No verifiable reference: do NOT claim success from the URL alone.
            setVerifying(false);
            return;
        }
        setVerifying(true);
        setVerifyError(null);
        try {
            const res = await paymentsApi.getPaymentById(paymentId);
            setPayment((res.data as PaymentRecord) ?? null);
        } catch (err) {
            if (err instanceof ApiError && err.status === 404) {
                setVerifyError('We could not find a payment record for this reference.');
            } else {
                setVerifyError('Could not verify your payment right now. Please try again.');
            }
        } finally {
            setVerifying(false);
        }
    }, [paymentId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        verifyPayment();
    }, [verifyPayment]);

    const isCompleted = payment?.status === 'COMPLETED';
    const isFailed = payment?.status === 'FAILED';

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full border-border text-center shadow-sm">
                <CardHeader className="pt-8 pb-4 space-y-4">
                    <div
                        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                            isFailed
                                ? 'bg-rose-500/10 text-rose-600'
                                : isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-amber-500/10 text-amber-600'
                        }`}
                    >
                        {isFailed ? (
                            <XCircle className="h-10 w-10" />
                        ) : isCompleted ? (
                            <CheckCircle2 className="h-10 w-10" />
                        ) : (
                            <Loader2 className="h-10 w-10 animate-spin" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                        {isCompleted
                            ? 'Payment Successful!'
                            : isFailed
                                ? 'Payment Not Completed'
                                : 'Confirming Your Payment…'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {isCompleted ? (
                        <>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Your payment has been verified and your lease is now active. A receipt has been emailed to you.
                            </p>
                            <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        Paid &amp; Verified
                                    </span>
                                </div>
                                {payment?.amount != null && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount</span>
                                        <span className="font-semibold text-foreground">
                                            ${payment.amount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : isFailed ? (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This payment did not go through. You have not been charged for this rental request — please retry the payment from your dashboard.
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {verifyError ??
                                    'Your payment is being confirmed. This can take a few moments. Once confirmed, your rental request will show as Active in your dashboard.'}
                            </p>
                            {!verifyError && !verifying && (
                                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                                    We are still waiting for confirmation from our payment provider.
                                </p>
                            )}
                            {(verifyError || (!verifying && paymentId)) && (
                                <Button variant="outline" size="sm" onClick={verifyPayment} className="gap-2">
                                    <RefreshCw className="h-3.5 w-3.5" /> Check Again
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                    <Button asChild variant="default" className="w-full gap-2">
                        <Link href="/dashboard/tenant">
                            <Home className="h-4 w-4" /> Go to Dashboard
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full gap-2">
                        <Link href="/properties">
                            <Building2 className="h-4 w-4" /> Browse Properties
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Checking your payment…</p>
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}
