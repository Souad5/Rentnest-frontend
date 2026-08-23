'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { AppInput } from '../shared/AppInput';
import { AppButton } from '../shared/AppButton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Hero() {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [range, setRange] = useState<DateRange | undefined>();
    const [datesOpen, setDatesOpen] = useState(false);

    const today = new Date();

    const dateLabel = range?.from
        ? range.to && range.from !== range.to
            ? `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d')}`
            : format(range.from, 'MMM d')
        : null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (location.trim()) params.set('q', location.trim());
        if (range?.from) params.set('moveIn', format(range.from, 'yyyy-MM-dd'));
        if (range?.to) params.set('moveOut', format(range.to, 'yyyy-MM-dd'));

        const qs = params.toString();
        router.push(qs ? `/properties?${qs}` : '/properties');
    };

    return (
        <section className="relative mt-2">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative h-120 sm:h-135 rounded-[32px] overflow-hidden bg-[#181818] text-white flex flex-col justify-center items-center text-center px-6 shadow-xl"
            >
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute inset-0"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
                        alt="Luxury Home & Apartment Rental"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/60" />

                {/* Headline Focused on Home & Apartment Rentals */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 max-w-3xl space-y-4 mb-12"
                >
                    <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-tight tracking-tight">
                        Find your perfect <br />
                        <span className="italic font-serif font-light text-neutral-300">rental home</span> or{' '}
                        <span className="italic font-serif font-light text-neutral-300">apartment</span>
                    </h1>
                </motion.div>

                {/* Floating Search Pill */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-white/95 backdrop-blur-md rounded-full shadow-2xl p-2 sm:p-3 border border-white/20 text-[#1c1d1d] z-20"
                >
                    <form onSubmit={handleSearch} className="grid grid-cols-12 items-stretch text-left text-xs sm:text-sm">
                        {/* Location Input */}
                        <div className="col-span-12 sm:col-span-5 px-4 py-2 border-b sm:border-b-0 sm:border-r border-neutral-200">
                            <label htmlFor="hero-location" className="block text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                City, address, or apartment...
                            </label>
                            <AppInput
                                id="hero-location"
                                type="text"
                                name="q"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Search rentals..."
                                className="w-full bg-transparent font-medium text-neutral-900 focus:outline-none border-none p-0 shadow-none h-auto min-h-0 text-xs sm:text-sm rounded-none"
                            />
                        </div>

                        {/* Move-in / Move-out Range Picker */}
                        <div className="col-span-8 sm:col-span-5 px-4 py-2 sm:border-r border-neutral-200">
                            <span className="block text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                Move-in / Move-out
                            </span>
                            <Popover open={datesOpen} onOpenChange={setDatesOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="Select move-in and move-out dates"
                                        className="flex w-full items-center gap-1.5 font-semibold text-neutral-900 outline-none focus-visible:text-black truncate"
                                    >
                                        <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                                        <span className={dateLabel ? '' : 'font-normal text-neutral-400'}>
                                            {dateLabel ?? 'Add dates'}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="center" className="w-auto p-0">
                                    <Calendar
                                        mode="range"
                                        selected={range}
                                        onSelect={(selected) => {
                                            setRange(selected);
                                            if (selected?.from && selected?.to) {
                                                setDatesOpen(false);
                                            }
                                        }}
                                        disabled={{ before: today }}
                                        numberOfMonths={2}
                                        captionLayout="dropdown"
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Search Button */}
                        <div className="col-span-4 sm:col-span-2 flex items-center justify-end pr-1 py-2 sm:py-0">
                            <AppButton
                                type="submit"
                                aria-label="Search Rentals"
                                className="w-full sm:w-12 sm:max-w-32 sm:h-12 bg-[#1c1d1d] hover:bg-black text-white rounded-full flex items-center justify-center gap-2 p-0 transition-all shadow-md"
                            >
                                <Search className="w-5 h-5 shrink-0" />
                                <span className="sm:hidden font-medium">Search</span>
                            </AppButton>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </section>
    );
}
