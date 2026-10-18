'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

function PaymentCancelContent() {
    const searchParams = useSearchParams();
    const requestId = searchParams.get('request');

    return (
        <div className="flex min-h-[80vh] flex-1 flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
            <Logo />
            <Card className="w-full max-w-md rounded-2xl border-border text-center shadow-sm">
                <CardHeader className="pt-8 pb-4 space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <XCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                        Payment Cancelled
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Checkout was cancelled or interrupted before Stripe confirmed the payment, so you have not been charged.
                    </p>
                    <p className="rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                        Your rental request has not been paid. You can safely retry the payment at any time while your request remains approved.
                    </p>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                    {requestId ? (
                        <Button asChild variant="default" className="h-10 w-full gap-2 rounded-xl">
                            <Link href={`/dashboard/tenant/requests/${encodeURIComponent(requestId)}/pay`}>
                                <RefreshCw className="h-4 w-4" /> Try payment again
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild variant="default" className="h-10 w-full gap-2 rounded-xl">
                            <Link href="/dashboard/tenant/requests">
                                <ArrowLeft className="h-4 w-4" /> My requests
                            </Link>
                        </Button>
                    )}
                    <Button asChild variant="outline" className="h-10 w-full gap-2 rounded-xl">
                        <Link href="/properties">
                            <Building2 className="h-4 w-4" /> Browse homes
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
                <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-md rounded-2xl border-border text-center shadow-sm">
                        <CardContent className="py-10 text-sm text-muted-foreground">Loading…</CardContent>
                    </Card>
                </div>
            }
        >
            <PaymentCancelContent />
        </Suspense>
    );
}
