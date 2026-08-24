'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { addDays, format, startOfToday } from 'date-fns';
import {
    AlertCircle,
    Calendar as CalendarIcon,
    CheckCircle,
    ChevronDown,
    Loader2,
    Send,
} from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { AppButton } from '../shared/AppButton';

interface RentalRequestFormProps {
    propertyId: string;
    propertyTitle: string;
    price: number;
    isAvailable: boolean;
    defaultStartDate?: string;
    defaultEndDate?: string;
}

const parseDateParam = (value?: string) => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

export function RentalRequestForm({
    propertyId,
    propertyTitle,
    price,
    isAvailable,
    defaultStartDate,
    defaultEndDate,
}: RentalRequestFormProps) {
    const { user, token } = useAuth();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const initialStart = parseDateParam(defaultStartDate);
    const [startDate, setStartDate] = useState<Date | undefined>(initialStart);
    const [endDate, setEndDate] = useState<Date | undefined>(() => {
        const end = parseDateParam(defaultEndDate);
        return end && (!initialStart || end > initialStart) ? end : undefined;
    });
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const today = startOfToday();

    const handleSelectStart = (date?: Date) => {
        setStartDate(date);
        if (!date || (endDate && date >= endDate)) {
            setEndDate(undefined);
        }
        setStartOpen(false);
    };

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

        if (startDate >= endDate) {
            setError('End date must be after the start date.');
            return;
        }

        try {
            setLoading(true);
            await rentalApi.createRental(
                {
                    propertyId,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
                token
            );

            toast.success('Rental request submitted', {
                description: 'The landlord will review your application shortly.',
            });
            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                router.push('/dashboard/tenant');
            }, 1500);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Something went wrong';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <AppButton className="w-full gap-2 font-medium" disabled={!isAvailable}>
                    <Send className="h-4 w-4" />
                    {isAvailable ? 'Request to Rent' : 'Property Rented'}
                </AppButton>
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
                            <Popover open={startOpen} onOpenChange={setStartOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="startDate"
                                        aria-invalid={!startDate && !!error}
                                        className="w-full justify-between px-3 font-normal"
                                    >
                                        <span className="flex items-center gap-2 truncate text-sm">
                                            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            {startDate ? (
                                                format(startDate, 'MMM d, yyyy')
                                            ) : (
                                                <span className="text-muted-foreground font-normal">
                                                    Pick a move-in date
                                                </span>
                                            )}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={handleSelectStart}
                                        disabled={{ before: today }}
                                        captionLayout="dropdown"
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="endDate" className="text-xs">
                                Move-out Date
                            </Label>
                            <Popover open={endOpen} onOpenChange={setEndOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="endDate"
                                        aria-invalid={!endDate && !!error}
                                        className="w-full justify-between px-3 font-normal"
                                    >
                                        <span className="flex items-center gap-2 truncate text-sm">
                                            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            {endDate ? (
                                                format(endDate, 'MMM d, yyyy')
                                            ) : (
                                                <span className="text-muted-foreground font-normal">
                                                    Pick a move-out date
                                                </span>
                                            )}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(date) => {
                                            setEndDate(date);
                                            setEndOpen(false);
                                        }}
                                        disabled={{
                                            before: startDate ? addDays(startDate, 1) : today,
                                        }}
                                        captionLayout="dropdown"
                                        defaultMonth={
                                            startDate ? addDays(startDate, 1) : undefined
                                        }
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <AppButton type="submit" disabled={loading} className="w-full gap-2 mt-2">
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
                        </AppButton>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
