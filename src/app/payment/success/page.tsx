'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    CheckCircle2,
    Building2,
    Clock,
    Home,
    Loader2,
    RefreshCw,
    Star,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewFormModal } from '@/components/forms/ReviewFormModal';
import { Logo } from '@/components/shared/Logo';
import { paymentsApi, ApiError } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import type { Payment } from '@/types/api';

type PaymentRecord = Payment;

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment');

    const [payment, setPayment] = useState<PaymentRecord | null>(null);
    const [verifying, setVerifying] = useState<boolean>(true);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [reviewOpen, setReviewOpen] = useState<boolean>(false);
    const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

    const verifyPayment = useCallback(async () => {
        if (!paymentId) {
            // No verifiable reference: do NOT claim success from the URL alone.
            setVerifyError('No payment reference was provided. Check Payments in your dashboard for the latest status.');
            setVerifying(false);
            return;
        }
        setVerifying(true);
        setVerifyError(null);
        try {
            const res = await paymentsApi.detail(paymentId);
            setPayment(res.data ?? null);
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

    const reviewedProperty = isCompleted ? payment?.rentalRequest?.property : undefined;

    return (
        <div className="flex min-h-[80vh] flex-1 flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
            <Logo />
            <Card className="w-full max-w-md rounded-2xl border-border text-center shadow-sm">
                <CardHeader className="pt-8 pb-4 space-y-4">
                    <div
                        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                            isFailed
                                ? 'bg-destructive/10 text-destructive'
                                : isCompleted
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-highlight/20 text-foreground'
                        }`}
                    >
                        {isFailed ? (
                            <XCircle className="h-10 w-10" />
                        ) : isCompleted ? (
                            <CheckCircle2 className="h-10 w-10" />
                        ) : verifying ? (
                            <Loader2 className="h-10 w-10 animate-spin" />
                        ) : (
                            <Clock className="h-10 w-10" />
                        )}
                    </div>
                    <CardTitle className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                        {isCompleted
                            ? 'Payment Successful!'
                            : isFailed
                                ? 'Payment Not Completed'
                                : verifying
                                    ? 'Confirming Your Payment…'
                                    : 'Payment Not Confirmed Yet'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {isCompleted ? (
                        <>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Your payment has been verified and your rental is now active. The receipt and transaction ID are under Payments in your dashboard.
                            </p>
                            <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-left text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-semibold text-primary">
                                        Paid &amp; Verified
                                    </span>
                                </div>
                                {payment?.amount != null && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount</span>
                                        <span className="font-semibold text-foreground">
                                            {formatMoney(payment.amount)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* [Payment Success] → [Leave Review] step */}
                            {reviewedProperty && (
                                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                    {reviewSubmitted ? (
                                        <div className="flex items-center gap-2 text-xs text-primary">
                                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                                            <span>
                                                Review published — thanks for helping the
                                                RentNest community!
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 justify-center">
                                                    <Star className="h-4 w-4 fill-highlight text-highlight" />
                                                    Enjoying {reviewedProperty.title}?
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Your lease is active — leave a rating so
                                                    other tenants know what to expect.
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => setReviewOpen(true)}
                                                className="h-9 w-full gap-1.5 rounded-xl text-xs font-medium"
                                            >
                                                <Star className="h-3.5 w-3.5" />
                                                Leave a Review
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
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
                                <p className="rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                                    We are still waiting for confirmation from our payment provider.
                                </p>
                            )}
                            {paymentId && (verifyError || !verifying) && (
                                <Button variant="outline" size="sm" onClick={verifyPayment} disabled={verifying} className="h-9 gap-2 rounded-xl px-3">
                                    <RefreshCw className="h-3.5 w-3.5" /> Check Again
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                    <Button asChild variant="default" className="h-10 w-full gap-2 rounded-xl">
                        <Link href="/dashboard/tenant/requests">
                            <Home className="h-4 w-4" /> My requests
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-10 w-full gap-2 rounded-xl">
                        <Link href="/properties">
                            <Building2 className="h-4 w-4" /> Browse homes
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            <ReviewFormModal
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                onSuccess={() => setReviewSubmitted(true)}
                propertyId={reviewedProperty?.id}
                propertyTitle={reviewedProperty?.title}
            />
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Checking your payment…</p>
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}
