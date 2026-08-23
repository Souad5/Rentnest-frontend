'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { AppInput } from '../shared/AppInput';
import { AppButton } from '../shared/AppButton';

export function Hero() {
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
                    <form action="/properties" method="GET" className="grid grid-cols-12 items-center text-left text-xs sm:text-sm">
                        {/* Location Input */}
                        <div className="col-span-12 sm:col-span-4 px-4 py-2 border-b sm:border-b-0 sm:border-r border-neutral-200">
                            <label className="block text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                City, address, or apartment...
                            </label>
                            <AppInput
                                type="text"
                                name="location"
                                defaultValue="Milan, Italy"
                                placeholder="Search rentals..."
                                className="w-full bg-transparent font-medium text-neutral-900 focus:outline-none border-none p-0 shadow-none text-xs sm:text-sm"
                            />
                        </div>

                        {/* Move-in Date */}
                        <div className="col-span-6 sm:col-span-2 px-4 py-2 border-r border-neutral-200">
                            <label className="block text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                Move-in
                            </label>
                            <p className="font-semibold text-neutral-900">Jun 23</p>
                        </div>

                        {/* Move-out Date */}
                        <div className="col-span-6 sm:col-span-2 px-4 py-2 sm:border-r border-neutral-200">
                            <label className="block text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                Move-out
                            </label>
                            <p className="font-semibold text-neutral-900">Jun 29</p>
                        </div>

                        {/* Guests / Residents */}
                        <div className="col-span-8 sm:col-span-3 px-4 py-2">
                            <label className="block text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                Residents
                            </label>
                            <p className="font-semibold text-neutral-900">2 Guests</p>
                        </div>

                        {/* Search Button */}
                        <div className="col-span-4 sm:col-span-1 flex justify-end pr-1">
                            <AppButton
                                type="submit"
                                aria-label="Search Rentals"
                                className="w-12 h-12 bg-[#1c1d1d] hover:bg-black text-white rounded-full flex items-center justify-center p-0 transition-all shadow-md"
                            >
                                <Search className="w-5 h-5" />
                            </AppButton>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </section>
    );
}