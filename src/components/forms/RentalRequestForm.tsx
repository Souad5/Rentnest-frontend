'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/providers/AuthProvider';
import { rentalApi } from '@/lib/api';

interface RentalRequestFormProps {
    propertyId: string;
    propertyTitle: string;
    price: number;
    isAvailable: boolean;
}

export function RentalRequestForm({
    propertyId,
    propertyTitle,
    price,
    isAvailable,
}: RentalRequestFormProps) {
    const { user, token } = useAuth();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user || !token) {
            router.push(`/login?redirect=/properties/${propertyId}`);
            return;
        }

        if (user.role !== 'TENANT') {
            setError('Only tenant accounts can submit rental requests.');
            return;
        }

        if (!startDate || !endDate) {
            setError('Please select both start and end dates.');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            setError('End date must be after the start date.');
            return;
        }

        try {
            setLoading(true);
            await rentalApi.createRental(
                {
                    propertyId,
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString(),
                },
                token
            );

            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                router.push('/dashboard/tenant');
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2 font-medium" disabled={!isAvailable}>
                    <Send className="h-4 w-4" />
                    {isAvailable ? 'Request to Rent' : 'Property Rented'}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Rental</DialogTitle>
                    <DialogDescription>
                        Submit your rental request for <span className="font-semibold text-foreground">{propertyTitle}</span> at ${price}/month.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center space-y-2">
                        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                        <p className="text-base font-semibold">Rental Request Submitted!</p>
                        <p className="text-xs text-muted-foreground">Redirecting to tenant dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="startDate" className="text-xs">
                                Move-in Date
                            </Label>
                            <div className="relative">
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="pl-9 text-sm"
                                />
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="endDate" className="text-xs">
                                Move-out Date
                            </Label>
                            <div className="relative">
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    className="pl-9 text-sm"
                                />
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Submitting Request...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    <span>Submit Request</span>
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}