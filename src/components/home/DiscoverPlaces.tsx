'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const DESTINATIONS = [
    {
        name: 'Scotland',
        count: '351 rental homes',
        img: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80',
        elevated: false,
    },
    {
        name: 'Germany',
        count: '452 apartments',
        img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
        elevated: true,
    },
    {
        name: 'Nepal',
        count: '370 residential stays',
        img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        elevated: false,
    },
];

export function DiscoverPlaces() {
    return (
        <section className="pt-12 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6"
            >
                <h2 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#1c1d1d] leading-none">
                    Discover <br />
                    rental destinations
                </h2>
                <div className="max-w-xs space-y-2 text-xs text-neutral-500 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Verified Rentals</span>
                    </div>
                    <p>
                        Explore handpicked apartments, luxury villas, and family homes available for short or long term lease.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 items-end">
                {DESTINATIONS.map((dest, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`group relative cursor-pointer ${dest.elevated ? 'md:-translate-y-8' : ''}`}
                    >
                        <div
                            className={`relative w-full overflow-hidden shadow-lg bg-neutral-200 rounded-b-[24px] ${dest.elevated ? 'h-107.5 rounded-t-[160px]' : 'h-96 rounded-t-[140px]'
                                }`}
                        >
                            <Image
                                src={dest.img}
                                alt={dest.name}
                                fill
                                priority={dest.elevated}
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white space-y-0.5">
                                <h3 className="font-serif text-2xl font-normal">{dest.name}</h3>
                                <p className="text-xs text-neutral-300 font-light">{dest.count}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}