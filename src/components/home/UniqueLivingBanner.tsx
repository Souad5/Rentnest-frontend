'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AppButton } from '../shared/AppButton';

export function UniqueLivingBanner() {
    return (
        <section>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative bg-[#181818] text-white rounded-[32px] p-8 sm:p-14 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center gap-8 shadow-2xl"
            >
                <div className="lg:col-span-7 space-y-6 z-10">
                    <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
                        Discover modern <br />
                        apartment living
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed font-light">
                        Step into fully furnished homes and premium apartment units built for comfort and style. Find flexible lease options today!
                    </p>
                    <AppButton className="bg-white text-[#1c1d1d] hover:bg-neutral-100 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md">
                        Explore Rental Units
                    </AppButton>
                </div>

                <div className="lg:col-span-5 relative h-64 sm:h-80 flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute right-0 top-2 w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-lg"
                        >
                            <Image
                                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80"
                                alt="Modern Apartment Studio"
                                fill
                                className="object-cover"
                            />
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                            className="absolute right-28 bottom-4 w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-lg"
                        >
                            <Image
                                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80"
                                alt="Luxury Home Rental"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}