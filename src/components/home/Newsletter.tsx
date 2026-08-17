'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { FaFacebookF, FaXTwitter, FaYoutube, FaPaperPlane } from 'react-icons/fa6';

export function Newsletter() {
    const [email, setEmail] = useState('');

    const socialLinks = [
        { icon: FaFacebookF, label: 'Facebook' },
        { icon: FaXTwitter, label: 'Twitter' },
        { icon: FaYoutube, label: 'YouTube' },
        { icon: FaPaperPlane, label: 'Telegram' },
    ];

    return (
        <section>
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6 }}
                className="bg-[#e9e8e3] rounded-[32px] p-8 sm:p-14 text-center space-y-8"
            >
                <motion.h2
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-serif text-4xl sm:text-5xl font-normal text-[#1c1d1d]"
                >
                    Stay tuned
                </motion.h2>

                <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 items-center text-left">
                    {/* Email Form */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-neutral-600">Via email</label>
                        <div className="relative flex items-center">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white rounded-full px-4 py-2.5 text-xs text-neutral-900 focus:outline-none shadow-sm pr-10"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Submit Email"
                                className="absolute right-1 w-8 h-8 bg-[#1c1d1d] text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Social Icons from react-icons/fa6 */}
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-neutral-600">
                            Follow us on social media
                        </label>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social, idx) => {
                                const Icon = social.icon;
                                return (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label={social.label}
                                        className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-neutral-800 hover:bg-[#1c1d1d] hover:text-white transition-colors shadow-sm"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}