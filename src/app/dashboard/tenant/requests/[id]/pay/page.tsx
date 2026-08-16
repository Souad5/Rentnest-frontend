'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, ArrowLeft, CheckCircle2, Lock, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface TenantPaymentPageProps {
    params: Promise<{ id: string }>;
}

export default function TenantPaymentPage({ params }: TenantPaymentPageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'BANK'>('CARD');
    const [cardHolder, setCardHolder] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Mock payment details based on request ID
    const paymentAmount = 2400;
    const platformFee = 25;
    const totalAmount = paymentAmount + platformFee;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/tenant');
            }, 2500);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Payment Successful!</h2>
                <p className="text-sm text-muted-foreground">
                    Your payment of <span className="font-semibold text-foreground">${totalAmount.toLocaleString()}</span> for Request ID <span className="font-mono">{id}</span> has been processed.
                </p>
                <p className="text-xs text-muted-foreground animate-pulse">Redirecting to your tenant dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-4 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/dashboard/tenant">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                </Button>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader className="pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" /> Complete Payment
                        </CardTitle>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> 256-Bit SSL Encrypted
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {/* Payment Summary */}
                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="h-4 w-4 text-primary" /> Rental Security Deposit / Rent
                            </span>
                            <span className="font-semibold text-foreground">${paymentAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Processing Fee</span>
                            <span className="font-semibold text-foreground">${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border font-bold text-base">
                            <span>Total Due</span>
                            <span className="text-primary text-xl">${totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Method Tabs */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant={paymentMethod === 'CARD' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('CARD')}
                            className="w-full justify-center gap-2"
                        >
                            <CreditCard className="h-4 w-4" /> Credit / Debit Card
                        </Button>
                        <Button
                            type="button"
                            variant={paymentMethod === 'BANK' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('BANK')}
                            className="w-full justify-center gap-2"
                        >
                            <ShieldCheck className="h-4 w-4" /> Bank Transfer (ACH)
                        </Button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {paymentMethod === 'CARD' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Cardholder Name</label>
                                    <Input
                                        placeholder="e.g. Alex Johnson"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Card Number</label>
                                    <Input
                                        placeholder="4532 •••• •••• 8892"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        maxLength={19}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Expiration (MM/YY)</label>
                                        <Input
                                            placeholder="MM/YY"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">CVC / CVV</label>
                                        <Input
                                            placeholder="123"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value)}
                                            maxLength={4}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-4 rounded-xl border border-dashed border-border text-center space-y-2">
                                <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto" />
                                <p className="text-sm font-medium">Bank Transfer via Plaid</p>
                                <p className="text-xs text-muted-foreground">
                                    Clicking pay below will securely connect your online bank account.
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full gap-2 text-base font-semibold py-5 mt-2"
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing Payment...' : `Pay $${totalAmount.toLocaleString()}`}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="bg-muted/30 border-t border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground mx-auto flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-primary" /> Payments are handled securely via RentNest Escrow Guarantee.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}