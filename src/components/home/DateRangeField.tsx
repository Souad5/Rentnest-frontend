'use client';

import { useMemo, useState } from 'react';
import { format, startOfToday } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarDays, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangeFieldProps {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    className?: string;
}

/** Move-in / move-out picker rendered inside the hero search bar. */
export function DateRangeField({ value, onChange, className }: DateRangeFieldProps) {
    const [open, setOpen] = useState(false);
    const today = useMemo(() => startOfToday(), []);

    const label = value?.from
        ? value.to
            ? `${format(value.from, 'MMM d')} – ${format(value.to, 'MMM d, yyyy')}`
            : `From ${format(value.from, 'MMM d, yyyy')}`
        : 'Move-in – move-out';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={value?.from ? `Selected dates: ${label}. Change dates` : 'Choose move-in and move-out dates'}
                    className={cn(
                        'inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56',
                        value?.from ? 'text-foreground' : 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{label}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto rounded-2xl border border-border p-0">
                <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground">When do you want to move in?</p>
                        <p className="text-xs text-muted-foreground">Pick a move-in date, then a move-out date.</p>
                    </div>
                    {value?.from && (
                        <button
                            type="button"
                            onClick={() => onChange(undefined)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" /> Clear
                        </button>
                    )}
                </div>
                <Calendar
                    mode="range"
                    selected={value}
                    onSelect={(range) => {
                        onChange(range);
                        if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) setOpen(false);
                    }}
                    disabled={{ before: today }}
                    startMonth={today}
                    defaultMonth={value?.from ?? today}
                    numberOfMonths={1}
                    className="rounded-2xl bg-popover p-3"
                />
            </PopoverContent>
        </Popover>
    );
}
