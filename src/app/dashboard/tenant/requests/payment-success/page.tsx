'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
            <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Your payment has been processed and your rental is now active.
                    You will receive a confirmation shortly.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <AppButton asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Link href="/dashboard/tenant">View My Rentals</Link>
                </AppButton>
                <AppButton asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                </AppButton>
            </div>
        </div>
    );
}