'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldAlert, CreditCard, CalendarDays, MapPin } from 'lucide-react';

import { AppButton } from '@/components/shared/AppButton';
import { rentalsApi, paymentsApi, ApiError } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';


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
    };
}

export default function TenantPaymentPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.id as string;

    const [requestDetail, setRequestDetail] = useState<RentalRequestDetail | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const initCheckout = useCallback(async () => {
        if (!requestId) return;
        setLoading(true);
        setError(null);

        try {
            const rentalResponse = await rentalsApi.getById(requestId);
            const reqData = ((rentalResponse as { data?: RentalRequestDetail }).data || rentalResponse) as RentalRequestDetail;
            setRequestDetail(reqData);

            const amountToPay = reqData.property?.price ?? 0;

            if (reqData.status !== 'APPROVED') {
                setError('This rental request is not approved for payment.');
                return;
            }

            if (amountToPay <= 0) {
                setError('Invalid property rental price.');
                return;
            }

            const paymentRes = await paymentsApi.createPaymentIntent(requestId, amountToPay);

            if (paymentRes.data?.transactionId) {
                setPaymentIntentId(paymentRes.data.transactionId); // ✅ only need this
            } else {
                throw new Error('Failed to obtain payment intent.');
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
    }, [requestId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        initCheckout();
    }, [initCheckout]);

    const handleConfirmPayment = async () => {
        if (!paymentIntentId) return;

        setIsProcessing(true);
        setPaymentError(null);

        try {
            const amount = requestDetail?.property?.price ?? 0;

            // Just call your backend confirm directly — no Stripe.js needed
            await paymentsApi.confirmPayment(requestId, paymentIntentId, amount);
            router.push('/dashboard/tenant/requests/payment-success');
        } catch (err) {
            if (err instanceof ApiError) {
                setPaymentError(err.message);
            } else {
                setPaymentError('Payment failed. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Preparing checkout…</p>
            </div>
        );
    }

    if (error || !requestDetail) {
        return (
            <div className="max-w-sm mx-auto my-16 text-center space-y-3">
                <ShieldAlert className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-sm text-muted-foreground">{error || 'Rental details not found.'}</p>
                <AppButton asChild size="sm" variant="ghost">
                    <Link href="/dashboard/tenant">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to requests
                    </Link>
                </AppButton>
            </div>
        );
    }

    const amount = requestDetail.property?.price ?? 0;

    return (
        <div className="max-w-md mx-auto space-y-6 py-8 px-4">
            {/* Back */}
            <Link
                href="/dashboard/tenant"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to requests
            </Link>

            {/* Payment Summary Card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Payment Summary
                    </p>
                    <h1 className="text-xl font-semibold text-foreground">
                        {requestDetail.property?.title}
                    </h1>
                </div>

                <div className="space-y-3 text-sm">
                    {requestDetail.property?.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{requestDetail.property.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>
                            {new Date(requestDetail.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {' – '}
                            {new Date(requestDetail.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-foreground">${amount.toFixed(2)}</span>
                </div>
            </div>

            {/* Pay Button */}
            <AppButton
                onClick={() => setDialogOpen(true)}
                disabled={!paymentIntentId}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2"
            >
                <CreditCard className="h-4 w-4" />
                Pay ${amount.toFixed(2)}
            </AppButton>

            <p className="text-center text-[11px] text-muted-foreground">
                Payments are securely processed by Stripe
            </p>

            {/* Confirm Payment Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            You are about to pay <strong>${amount.toFixed(2)}</strong> for{' '}
                            <strong>{requestDetail.property?.title}</strong>. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {paymentError && (
                        <p className="text-xs text-destructive text-center px-1">{paymentError}</p>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <AppButton
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </AppButton>
                        <AppButton
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing…
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    Confirm Payment
                                </>
                            )}
                        </AppButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}