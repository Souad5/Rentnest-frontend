'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { AppInput } from './AppInput';
import { AppButton } from './AppButton';

export default function Footer() {
    const [email, setEmail] = useState('');

    const socialLinks = [
        { icon: FaFacebookF, label: 'Facebook', href: '#' },
        { icon: FaXTwitter, label: 'Twitter', href: '#' },
        { icon: FaInstagram, label: 'Instagram', href: '#' },
        { icon: FaLinkedinIn, label: 'LinkedIn', href: '#' },
    ];

    return (
        <footer className="bg-[#181818] text-white rounded-t-[32px] pt-12 pb-8">
            <div className="container px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
                {/* Top Section: Brand Info, Navigation Columns & Newsletter */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="md:col-span-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#181818]">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <span className="font-serif text-2xl font-bold tracking-tight">RentNest</span>
                        </div>
                        <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                            RentNest makes finding, leasing, and managing long-term apartments and short-stay rental homes effortless worldwide.
                        </p>
                    </div>

                    {/* Quick Links Column */}
                    <div className="md:col-span-3 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                            Rental Types
                        </h3>
                        <ul className="space-y-2 text-xs text-neutral-400">
                            <li>
                                <Link href="/properties?type=apartments" className="hover:text-white transition-colors">
                                    Apartments
                                </Link>
                            </li>
                            <li>
                                <Link href="/properties?type=houses" className="hover:text-white transition-colors">
                                    Family Homes
                                </Link>
                            </li>
                            <li>
                                <Link href="/properties?type=villas" className="hover:text-white transition-colors">
                                    Luxury Villas
                                </Link>
                            </li>
                            <li>
                                <Link href="/properties?type=studios" className="hover:text-white transition-colors">
                                    Studios & Condos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="md:col-span-5 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                            Rental Alerts
                        </h3>
                        <p className="text-xs text-neutral-400">
                            Subscribe to receive weekly updates on newly listed apartments and properties.
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center pt-1">
                            <AppInput
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-800 text-white placeholder:text-neutral-500 rounded-full px-4 py-2.5 text-xs border border-neutral-700 focus:border-neutral-500 pr-10 shadow-none"
                            />
                            <AppButton
                                type="submit"
                                aria-label="Subscribe"
                                className="absolute right-1 w-8 h-8 bg-white text-[#181818] rounded-full p-0 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                            </AppButton>
                        </form>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-neutral-500">
                        © {new Date().getFullYear()} RentNest Technologies, Inc. All rights reserved.
                    </p>

                    {/* Social Icons with AppButton */}
                    <div className="flex items-center gap-2">
                        {socialLinks.map((social, idx) => {
                            const Icon = social.icon;
                            return (
                                <AppButton
                                    key={idx}
                                    aria-label={social.label}
                                    className="w-8 h-8 bg-neutral-800 text-neutral-300 rounded-full p-0 flex items-center justify-center hover:bg-white hover:text-[#181818] transition-colors"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </AppButton>
                            );
                        })}
                    </div>

                    {/* Policy Links (pages not built yet — rendered as text, not links) */}
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}