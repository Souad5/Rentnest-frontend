'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { differenceInCalendarDays, format, isValid, parseISO, startOfToday } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { AlertCircle, CalendarDays, CheckCircle2, Info, Loader2, LogIn, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, rentalsApi } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

const rentalSchema = z
    .object({
        startDate: z
            .date({ required_error: 'Choose a move-in date', invalid_type_error: 'Choose a move-in date' })
            .refine((d) => d >= startOfToday(), 'Move-in date can’t be in the past'),
        endDate: z.date({ required_error: 'Choose a move-out date', invalid_type_error: 'Choose a move-out date' }),
    })
    .refine((v) => v.endDate > v.startDate, {
        path: ['endDate'],
        message: 'Move-out must be after move-in',
    });

type RentalValues = z.infer<typeof rentalSchema>;

interface RentalRequestFormProps {
    propertyId: string;
    propertyTitle: string;
    price: number;
    isAvailable: boolean;
    /** ISO date (YYYY-MM-DD or full ISO) — e.g. from `?moveIn=` */
    defaultStartDate?: string;
    defaultEndDate?: string;
    className?: string;
}

/** Parses a date-only string as a *local* day so Dhaka users don't get shifted dates. */
function parseDay(value?: string): Date | undefined {
    if (!value) return undefined;
    const d = parseISO(value.length > 10 ? value.slice(0, 10) : value);
    return isValid(d) ? d : undefined;
}

function describeDuration(start: Date, end: Date) {
    const nights = differenceInCalendarDays(end, start);
    if (nights < 31) return `${nights} ${nights === 1 ? 'day' : 'days'}`;
    const months = Math.floor(nights / 30);
    const days = nights % 30;
    return `about ${months} ${months === 1 ? 'month' : 'months'}${days ? ` ${days} ${days === 1 ? 'day' : 'days'}` : ''}`;
}

/**
 * Inline booking form for the property details page.
 * Tenants pick a date range and submit a rental request (POST /rentals);
 * logged-out visitors are sent to login and back, other roles get an explanation.
 */
export function RentalRequestForm({
    propertyId,
    propertyTitle,
    price,
    isAvailable,
    defaultStartDate,
    defaultEndDate,
    className,
}: RentalRequestFormProps) {
    const { user, isLoading: authLoading } = useAuth();
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const today = startOfToday();
    const initialStart = parseDay(defaultStartDate);
    const startOk = initialStart && initialStart >= today ? initialStart : undefined;
    const initialEnd = parseDay(defaultEndDate);
    const endOk = startOk && initialEnd && initialEnd > startOk ? initialEnd : undefined;

    const form = useForm<RentalValues>({
        resolver: zodResolver(rentalSchema),
        defaultValues: { startDate: startOk, endDate: endOk },
    });
    const {
        control,
        handleSubmit,
        setValue,
        setError,
        clearErrors,
        reset,
        formState: { errors, isSubmitting },
    } = form;

    // Fields start empty, so values are optional until zod validates them on submit.
    const setDates = (from?: Date, to?: Date) => {
        setValue('startDate', from as Date);
        setValue('endDate', to as Date);
    };

    const startDate = useWatch({ control, name: 'startDate' });
    const endDate = useWatch({ control, name: 'endDate' });
    const hasRange = Boolean(startDate && endDate && endDate > startDate);

    const loginHref = (() => {
        const qs = new URLSearchParams();
        if (startDate) qs.set('moveIn', format(startDate, 'yyyy-MM-dd'));
        if (endDate) qs.set('moveOut', format(endDate, 'yyyy-MM-dd'));
        const back = `/properties/${propertyId}${qs.toString() ? `?${qs}` : ''}`;
        return `/login?from=${encodeURIComponent(back)}`;
    })();

    const onSubmit = async (values: RentalValues) => {
        try {
            await rentalsApi.create({
                propertyId,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
            });
            toast.success('Rental request sent', {
                description: `The landlord of ${propertyTitle} will review your dates. We'll notify you on your dashboard.`,
            });
            setSubmitted(true);
            reset({ startDate: undefined, endDate: undefined });
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.status === 409
                        ? 'Those dates overlap a booking that is already approved for this home. Please choose different dates.'
                        : err.status === 401
                          ? 'Your session has expired. Please log in again to send a request.'
                          : err.message
                    : 'We couldn’t send your request. Check your connection and try again.';
            if (err instanceof ApiError && err.status === 409) {
                setError('endDate', { type: 'server', message: 'Dates unavailable' });
            }
            setError('root', { type: 'server', message });
            toast.error(message);
        }
    };

    if (submitted) {
        return (
            <div className={cn('space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm', className)}>
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">Request sent</p>
                        <p className="text-muted-foreground">
                            The landlord will approve or decline your dates. Once approved you can pay the first month
                            securely from your dashboard.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                    <Button asChild className="h-10 flex-1 rounded-xl">
                        <Link href="/dashboard/tenant/requests">View my requests</Link>
                    </Button>
                    <Button variant="outline" className="h-10 flex-1 rounded-xl" onClick={() => setSubmitted(false)}>
                        Request other dates
                    </Button>
                </div>
            </div>
        );
    }

    if (!isAvailable) {
        return (
            <div className={cn('flex items-start gap-3 rounded-2xl border border-border bg-muted/60 p-4 text-sm', className)}>
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                    This home is currently rented, so it isn&apos;t taking new requests. Browse{' '}
                    <Link href="/properties" className="font-medium text-primary underline-offset-4 hover:underline">
                        similar available homes
                    </Link>
                    .
                </p>
            </div>
        );
    }

    if (authLoading) {
        return (
            <div className={cn('space-y-3', className)}>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
            </div>
        );
    }

    if (user && user.role !== 'TENANT') {
        return (
            <div className={cn('flex items-start gap-3 rounded-2xl border border-border bg-muted/60 p-4 text-sm', className)}>
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                    You&apos;re signed in as {user.role === 'LANDLORD' ? 'a landlord' : 'an admin'}. Rental requests can only
                    be sent from a tenant account — log in with a tenant account to book this home.
                </p>
            </div>
        );
    }

    const dateError = errors.startDate?.message ?? errors.endDate?.message;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn('space-y-4', className)}>
            <fieldset className="space-y-1.5">
                <legend className="mb-1.5 text-xs font-medium text-muted-foreground">Rental dates</legend>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            aria-describedby={dateError ? 'rental-dates-error' : undefined}
                            aria-label={
                                startDate && endDate
                                    ? `Rental dates: ${format(startDate, 'MMM d, yyyy')} to ${format(endDate, 'MMM d, yyyy')}. Change dates`
                                    : 'Choose rental dates'
                            }
                            className={cn(
                                'grid w-full grid-cols-2 overflow-hidden rounded-xl border border-input bg-background text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                                dateError && 'border-destructive',
                            )}
                        >
                            <span className="border-r border-input px-3 py-2.5">
                                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Move-in
                                </span>
                                <span className={cn('block truncate text-sm', !startDate && 'text-muted-foreground')}>
                                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Add date'}
                                </span>
                            </span>
                            <span className="px-3 py-2.5">
                                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Move-out
                                </span>
                                <span className={cn('block truncate text-sm', !endDate && 'text-muted-foreground')}>
                                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Add date'}
                                </span>
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-auto rounded-2xl p-0">
                        <Calendar
                            mode="range"
                            selected={{ from: startDate, to: endDate }}
                            onSelect={(range: DateRange | undefined, clicked: Date) => {
                                clearErrors();
                                // Start a fresh range when one is already complete.
                                if (startDate && endDate) {
                                    setDates(clicked, undefined);
                                    return;
                                }
                                const from = range?.from;
                                const to = range?.to && from && range.to > from ? range.to : undefined;
                                setDates(from, to);
                                if (from && to) setCalendarOpen(false);
                            }}
                            disabled={{ before: today }}
                            defaultMonth={startDate ?? today}
                            numberOfMonths={1}
                            min={1}
                            autoFocus
                        />
                        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
                            <span>{startDate && !endDate ? 'Now pick your move-out date' : 'Pick move-in, then move-out'}</span>
                            {(startDate || endDate) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-lg"
                                    onClick={() => reset({ startDate: undefined, endDate: undefined })}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
                {dateError && (
                    <p id="rental-dates-error" className="text-xs text-destructive">
                        {dateError}
                    </p>
                )}
            </fieldset>

            {hasRange && startDate && endDate && (
                <dl className="space-y-2 rounded-xl bg-muted/60 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                        <dt className="flex items-center gap-1.5 text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" /> Stay length
                        </dt>
                        <dd className="font-medium text-foreground">{describeDuration(startDate, endDate)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Monthly rent</dt>
                        <dd className="font-medium text-foreground">{formatPrice(price)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
                        <dt className="font-semibold text-foreground">Estimated first month payment</dt>
                        <dd className="font-serif text-base font-semibold text-foreground">{formatPrice(price)}</dd>
                    </div>
                </dl>
            )}

            {errors.root?.message && (
                <div role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                    <span>{errors.root.message}</span>
                </div>
            )}

            {user ? (
                <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl text-sm font-semibold">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Sending request…
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" /> Request to rent
                        </>
                    )}
                </Button>
            ) : (
                <Button asChild className="h-11 w-full rounded-xl text-sm font-semibold">
                    <Link href={loginHref}>
                        <LogIn className="h-4 w-4" /> Log in to request
                    </Link>
                </Button>
            )}

            <p className="text-center text-xs text-muted-foreground">
                You won&apos;t be charged now. Pay the first month online only after the landlord approves.
            </p>
        </form>
    );
}
