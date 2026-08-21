'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';

export default function PaymentCancelPage() {
    const searchParams = useSearchParams();
    const requestId = searchParams.get('requestId');

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
            <div className="flex flex-col items-center gap-3">
                <XCircle className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold text-foreground">Payment Cancelled</h1>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Your payment was not completed. No charges have been made.
                    You can try again whenever you&apos;re ready.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                {requestId && (
                    <AppButton asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link href={`/dashboard/tenant/requests/${requestId}/pay`}>
                            Try Again
                        </Link>
                    </AppButton>
                )}
                <AppButton asChild variant="outline">
                    <Link href="/dashboard/tenant">Back to Requests</Link>
                </AppButton>
            </div>
        </div>
    );
}