'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Loader2,
    Lock,
    MapPin,
    Receipt,
    RefreshCw,
    ShieldAlert,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { buildStripeAppearance } from '@/components/checkout/stripe-appearance';
import { rentalsApi, paymentsApi, ApiError } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { formatDate, formatMoney } from '@/lib/format';
import { canOptimizeImage, coverImage } from '@/lib/images';
import type { RentalRequest } from '@/types/api';

// Initialize Stripe outside component render. loadStripe('') rejects (unhandled)
// and leaves the Pay button disabled forever, so only load with a real key.
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

export default function TenantPaymentPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const requestId = params.id as string;
    const { token, isLoading: authLoading } = useAuth();

    const [requestDetail, setRequestDetail] = useState<RentalRequest | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [alreadyPaid, setAlreadyPaid] = useState(false);

    // Elements must never see a changed clientSecret prop (it is immutable
    // after mount), so keep the options object identity stable and remount
    // the whole tree via `key` if the secret ever differs.
    const elementsOptions = useMemo<StripeElementsOptions>(
        () => ({
            clientSecret: clientSecret as string,
            appearance: buildStripeAppearance(),
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
        setAlreadyPaid(false);

        try {
            // 1. Fetch Request details for the order summary
            const rentalResponse = await rentalsApi.detail(requestId);
            const reqData = rentalResponse.data;
            setRequestDetail(reqData);

            if (reqData.status !== 'APPROVED') {
                const paid = reqData.status === 'ACTIVE' || reqData.status === 'COMPLETED';
                setAlreadyPaid(paid);
                setError(
                    paid
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
                // Stripe already settled this rental (the backend just marked it
                // ACTIVE): drop cached "Pay now" rows, then verify via the success page.
                queryClient.invalidateQueries({ queryKey: ['tenant'] });
                try {
                    const history = await paymentsApi.mine();
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
                // e.g. 400 "This rental has already been paid"
                if (/already been paid/i.test(err.message)) setAlreadyPaid(true);
                setError(err.message);
            } else {
                setError('Failed to prepare checkout. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    }, [requestId, token, router, queryClient]);

    useEffect(() => {
        if (authLoading) return;
        if (initializedFor.current === requestId) return;
        initializedFor.current = requestId;
        initCheckout();
    }, [initCheckout, authLoading, requestId]);

    if (authLoading || loading) {
        return (
            <div className="space-y-6" aria-busy="true">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Preparing secure checkout…
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <Skeleton className="h-80 rounded-2xl lg:col-span-7" />
                    <Skeleton className="h-80 rounded-2xl lg:col-span-5" />
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <StateCard
                title="Sign in required"
                message="You need to be signed in as a tenant to access this payment."
                action={
                    <Button asChild className="h-10 rounded-xl">
                        <Link href={`/login?from=${encodeURIComponent(`/dashboard/tenant/requests/${requestId}/pay`)}`}>Sign in</Link>
                    </Button>
                }
            />
        );
    }

    if (!stripePromise && !error && requestDetail) {
        return (
            <StateCard
                title="Payments unavailable"
                message="Online payments are not configured right now. Please try again later or contact support."
                action={
                    <Button asChild variant="outline" className="h-10 rounded-xl">
                        <Link href="/dashboard/tenant/requests">Back to requests</Link>
                    </Button>
                }
            />
        );
    }

    if (error || !requestDetail) {
        return (
            <StateCard
                title={alreadyPaid ? 'Already paid' : 'Checkout unavailable'}
                message={error || 'Rental details not found.'}
                positive={alreadyPaid}
                action={
                    <>
                        {alreadyPaid ? (
                            <Button asChild className="h-10 rounded-xl">
                                <Link href="/dashboard/tenant/payments">View payments</Link>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-10 rounded-xl"
                                onClick={() => {
                                    initializedFor.current = null;
                                    initCheckout();
                                }}
                            >
                                <RefreshCw className="h-4 w-4" /> Try again
                            </Button>
                        )}
                        <Button asChild variant="outline" className="h-10 rounded-xl">
                            <Link href="/dashboard/tenant/requests">Back to requests</Link>
                        </Button>
                    </>
                }
            />
        );
    }

    const amount = requestDetail.property?.price || 0;
    const cover = requestDetail.property ? coverImage(requestDetail.property) : null;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Button variant="ghost" asChild className="-ml-2 h-9 rounded-xl px-2 text-muted-foreground">
                <Link href="/dashboard/tenant/requests">
                    <ArrowLeft className="h-4 w-4" /> Back to requests
                </Link>
            </Button>

            <DashboardPageHeader
                title="Complete your payment"
                description="Review the details and pay securely to activate your rental."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Stripe form */}
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:col-span-7">
                    <div className="mb-5 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-semibold text-foreground">Payment details</h2>
                    </div>
                    {clientSecret && (
                        <Elements key={clientSecret} stripe={stripePromise} options={elementsOptions}>
                            <CheckoutForm rentalRequestId={requestId} amount={amount} clientSecret={clientSecret} />
                        </Elements>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground">
                        Card details go directly to Stripe — RentNest never sees or stores your card number.
                    </p>
                </section>

                {/* Order summary */}
                <aside className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:col-span-5">
                    <div className="flex items-center gap-2 border-b border-border pb-4">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold text-foreground">Payment summary</h2>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                            {cover ? (
                                <Image
                                    src={cover}
                                    alt={requestDetail.property?.title ?? 'Property'}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                    unoptimized={!canOptimizeImage(cover)}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <Building2 className="h-6 w-6" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-serif text-base font-semibold leading-tight tracking-tight text-foreground">
                                {requestDetail.property?.title}
                            </h3>
                            {requestDetail.property?.location && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> {requestDetail.property.location}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" /> Start date
                            </span>
                            <span className="font-medium text-foreground">{formatDate(requestDetail.startDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" /> End date
                            </span>
                            <span className="font-medium text-foreground">{formatDate(requestDetail.endDate)}</span>
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-border pt-4 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>First month&apos;s rent</span>
                            <span className="font-medium text-foreground">{formatMoney(amount)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Service fee</span>
                            <span className="font-medium text-foreground">{formatMoney(0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                            <span>Total due now</span>
                            <span className="text-primary">{formatMoney(amount)}</span>
                        </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                        <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                            Your rental becomes active as soon as payment is confirmed
                        </li>
                        <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                            The transaction ID appears under Payments for your records
                        </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
}

function StateCard({
    title,
    message,
    action,
    positive = false,
}: {
    title: string;
    message: string;
    action: React.ReactNode;
    positive?: boolean;
}) {
    return (
        <div className="mx-auto my-10 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div
                className={
                    positive
                        ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'
                        : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive'
                }
            >
                {positive ? <CheckCircle2 className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <div className="space-y-1.5">
                <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">{action}</div>
        </div>
    );
}
