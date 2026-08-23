'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

function PaymentCancelContent() {
    const searchParams = useSearchParams();
    const requestId = searchParams.get('request');

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full border-border text-center shadow-sm">
                <CardHeader className="pt-8 pb-4 space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                        <XCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                        Payment Cancelled
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your checkout transaction was cancelled or interrupted. No funds were debited from your account.
                    </p>
                    <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                        Your rental request has not been paid. You can safely retry the payment at any time while your request remains approved.
                    </p>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                    {requestId ? (
                        <Button asChild variant="default" className="w-full gap-2">
                            <Link href={`/dashboard/tenant/requests/${encodeURIComponent(requestId)}/pay`}>
                                <RefreshCw className="h-4 w-4" /> Return to Payment
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild variant="default" className="w-full gap-2">
                            <Link href="/dashboard/tenant">
                                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                            </Link>
                        </Button>
                    )}
                    <Button asChild variant="outline" className="w-full gap-2">
                        <Link href="/properties">
                            <Building2 className="h-4 w-4" /> Browse Listings
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function PaymentCancelPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
                    <Card className="max-w-md w-full border-border text-center shadow-sm">
                        <CardContent className="py-10 text-sm text-muted-foreground">Loading…</CardContent>
                    </Card>
                </div>
            }
        >
            <PaymentCancelContent />
        </Suspense>
    );
}
