'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppButton } from '../shared/AppButton';

const CATEGORIES = [
    {
        title: 'Apartments',
        count: '721,525 properties',
        img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
    },
    {
        title: 'Family Homes',
        count: '482,543 properties',
        img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80',
    },
    {
        title: 'Luxury Villas',
        count: '357,422 properties',
        img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80',
    },
    {
        title: 'Condos & Studios',
        count: '528,131 properties',
        img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
    },
    {
        title: 'Townhouses',
        count: '79,389 properties',
        img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80',
    },
];

export function PropertyTypes() {
    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1d1d]">
                    Browse rentals by category
                </h2>
                <div className="hidden sm:flex items-center gap-3">
                    <AppButton
                        aria-label="Previous"
                        className="w-9 h-9 rounded-full border border-neutral-300 bg-transparent text-neutral-600 hover:bg-neutral-200 p-0 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </AppButton>
                    <AppButton
                        aria-label="Next"
                        className="w-9 h-9 rounded-full border border-neutral-300 bg-transparent text-neutral-600 hover:bg-neutral-200 p-0 flex items-center justify-center"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </AppButton>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {CATEGORIES.map((item, idx) => (
                    <motion.div key={idx} whileHover={{ y: -6 }} className="group cursor-pointer space-y-2">
                        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-neutral-200 shadow-sm">
                            <Image
                                src={item.img}
                                alt={item.title}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-[#1c1d1d]">{item.title}</h3>
                            <p className="text-[11px] text-neutral-500">{item.count}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="pt-2">
                <AppButton className="bg-transparent border-none p-0 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-[#1c1d1d]">
                    View All Categories →
                </AppButton>
            </div>
        </section>
    );
}