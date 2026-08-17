'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const ARTICLES = [
    {
        title: 'More and more EU hosts rely on annual rental income',
        img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    },
    {
        title: 'Helping hosts in Massachusetts make their homes more energy efficient',
        img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    },
    {
        title: 'How four owners turned their historic homes into legendary stays',
        img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    },
];

export function StayUpToDate() {
    return (
        <section className="space-y-8">
            <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1d1d]"
            >
                Stay up to date
            </motion.h2>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.15 } },
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {ARTICLES.map((article, idx) => (
                    <motion.div
                        key={idx}
                        variants={{
                            hidden: { opacity: 0, y: 25 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                        }}
                        whileHover={{ y: -6 }}
                        className="group cursor-pointer space-y-3"
                    >
                        <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-neutral-200 shadow-sm">
                            <Image
                                src={article.img}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="font-semibold text-sm sm:text-base text-[#1c1d1d] leading-snug group-hover:text-neutral-600 transition-colors">
                            {article.title}
                        </h3>
                    </motion.div>
                ))}
            </motion.div>

            <div className="pt-2">
                <motion.button
                    whileHover={{ x: 5 }}
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-[#1c1d1d] transition-colors"
                >
                    Show All →
                </motion.button>
            </div>
        </section>
    );
}