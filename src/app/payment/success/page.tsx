'use client';

import Link from 'next/link';
import { CheckCircle2, Building2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full border-border text-center shadow-sm">
                <CardHeader className="pt-8 pb-4 space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                        Payment Successful!
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Thank you for your payment. Your transaction has been completed, and a formal receipt has been sent to your email address.
                    </p>

                    <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Paid & Verified</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Transaction Guarantee</span>
                            <span className="font-semibold text-foreground">RentNest Escrow Protected</span>
                        </div>
                    </div>
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