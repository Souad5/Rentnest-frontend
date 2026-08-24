'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CreditCard,
    Loader2,
    ShieldAlert,
    CheckCircle2,
    Receipt,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { rentalsApi, paymentsApi, ApiError } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

// Initialize Stripe outside component render
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface RentalRequestDetail {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    property?: {
        title: string;
        location?: string;
        price: number;
        images?: string[];
        imageUrl?: string | null;
    };
}

export default function TenantPaymentPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.id as string;
    const { token, isLoading: authLoading } = useAuth();

    const [requestDetail, setRequestDetail] = useState<RentalRequestDetail | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Elements must never see a changed clientSecret prop (it is immutable
    // after mount), so keep the options object identity stable and remount
    // the whole tree via `key` if the secret ever differs.
    const elementsOptions = useMemo<StripeElementsOptions>(
        () => ({
            clientSecret: clientSecret as string,
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#10b981',
                },
            },
        }),
        [clientSecret]
    );

    // StrictMode double-invokes effects in dev; a second createPaymentIntent
    // call can mint a second PaymentIntent and swap the clientSecret out from
    // under the mounted <Elements>.
    const initializedFor = useRef<string | null>(null);

    const initCheckout = useCallback(async () => {
        if (!requestId || !token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            // 1. Fetch Request details for the order summary
            const rentalResponse = await rentalsApi.getById(requestId);
            const rental = (rentalResponse as { data?: RentalRequestDetail }).data || rentalResponse;

            const reqData = rental as RentalRequestDetail;
            setRequestDetail(reqData);

            if (reqData.status !== 'APPROVED') {
                setError(
                    reqData.status === 'ACTIVE'
                        ? 'This rental request is already paid and active.'
                        : 'This rental request is not approved for payment.'
                );
                setLoading(false);
                return;
            }

            // 2. Initialize PaymentIntent on backend (amount determined server-side).
            //    The backend reuses an existing pending session, so the returned
            //    secret always matches the persisted payment record.
            const paymentRes = await paymentsApi.createPaymentIntent(requestId);

            if (paymentRes.data?.alreadyPaid) {
                // Stripe already settled this rental: verify via the success page.
                try {
                    const history = await paymentsApi.getPayments();
                    const match = history.data?.find((p) => p.rentalRequestId === requestId);
                    router.push(
                        match
                            ? `/payment/success?payment=${encodeURIComponent(match.id)}&request=${encodeURIComponent(requestId)}`
                            : '/dashboard/tenant'
                    );
                } catch {
                    router.push('/dashboard/tenant');
                }
                return;
            }

            if (paymentRes.data?.clientSecret) {
                setClientSecret(paymentRes.data.clientSecret);
            } else {
                throw new Error('Failed to obtain client secret from payment provider.');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to prepare checkout. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    }, [requestId, token, router]);

    useEffect(() => {
        if (authLoading) return;
        if (initializedFor.current === requestId) return;
        initializedFor.current = requestId;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        initCheckout();
    }, [initCheckout, authLoading, requestId]);

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Preparing secure checkout environment...</p>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="max-w-md mx-auto my-12 text-center p-8 border border-border rounded-2xl bg-card shadow-xs space-y-4">
                <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-lg font-bold text-foreground">Sign in required</h2>
                <p className="text-xs text-muted-foreground">
                    You need to be signed in as a tenant to access this payment.
                </p>
                <Button asChild size="sm" variant="outline">
                    <Link href="/login">Sign In</Link>
                </Button>
            </div>
        );
    }

    if (error || !requestDetail) {
        return (
            <div className="max-w-md mx-auto my-12 text-center p-8 border border-border rounded-2xl bg-card shadow-xs space-y-4">
                <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-lg font-bold text-foreground">Checkout Unavailable</h2>
                <p className="text-xs text-muted-foreground">{error || 'Rental details not found.'}</p>
                <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/tenant">Return to Requests</Link>
                </Button>
            </div>
        );
    }

    const amount = requestDetail.property?.price || 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <div>
                <Button variant="ghost" asChild className="gap-2 text-muted-foreground px-0 hover:bg-transparent">
                    <Link href="/dashboard/tenant">
                        <ArrowLeft className="h-4 w-4" /> Back to Requests
                    </Link>
                </Button>
            </div>

            {/* Page Title */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <CreditCard className="h-7 w-7 text-emerald-600" />
                    Complete Rental Payment
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review details and enter payment information to activate your lease.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Stripe Form */}
                <div className="md:col-span-7 space-y-4">
                    {clientSecret && (
                        <Elements
                            key={clientSecret}
                            stripe={stripePromise}
                            options={elementsOptions}
                        >
                            <CheckoutForm
                                rentalRequestId={requestId}
                                amount={amount}
                                clientSecret={clientSecret}
                            />
                        </Elements>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div className="md:col-span-5 space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-5">
                        <div className="flex items-center gap-2 pb-4 border-b border-border">
                            <Receipt className="h-5 w-5 text-muted-foreground" />
                            <h2 className="font-semibold text-foreground text-base">Payment Summary</h2>
                        </div>

                        {/* Property Card Info */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                    {requestDetail.property?.imageUrl || requestDetail.property?.images?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={requestDetail.property.imageUrl || requestDetail.property.images![0]}
                                            alt={requestDetail.property.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Building2 className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                                        {requestDetail.property?.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {requestDetail.property?.location}
                                    </p>
                                </div>
                            </div>

                            {/* Lease Dates */}
                            <div className="p-3 rounded-xl bg-muted/50 border border-border/60 text-xs space-y-1.5">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" /> Start Date
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {new Date(requestDetail.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" /> End Date
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {new Date(requestDetail.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="pt-4 border-t border-border space-y-2 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>First Month Rent</span>
                                <span className="font-medium text-foreground">${amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Service Fee</span>
                                <span className="font-medium text-foreground">$0.00</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border/60">
                                <span>Total Due Now</span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    ${amount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="pt-2 text-[11px] text-muted-foreground space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span>Instant lease activation upon approval</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span>Automated digital receipt emailed to you</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}