'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';

import { AppButton } from '@/components/shared/AppButton';
import { AppInput } from '@/components/shared/AppInput';

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
} as const;

export default function LoginPage() {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await login({ email, password });
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message || 'Invalid credentials. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-[#f4f3f0]">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden shadow-2xl shadow-black/10">

                {/* LEFT — brand / illustration panel */}
                <div className="relative min-h-75 lg:min-h-screen overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/Login Pic.jpg')" }}
                        initial={{ scale: 1.12, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content over image */}
                    <motion.div
                        className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12 text-white"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.p variants={fadeUp} className="text-sm font-medium text-white/80">
                            RentNest
                        </motion.p>

                        <div className="max-w-lg">
                            <motion.p variants={fadeUp} className="mb-3 text-sm text-white/70">
                                Renting made simple
                            </motion.p>

                            <motion.h1
                                variants={fadeUp}
                                className="text-4xl font-bold leading-tight lg:text-6xl"
                            >
                                Find a place
                                <br />
                                to call home.
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="mt-5 max-w-md text-sm leading-6 text-white/75"
                            >
                                Discover verified homes and apartments that fit your
                                lifestyle and budget.
                            </motion.p>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT — form panel */}
                <div className="bg-white flex flex-col justify-between p-8 sm:p-12">

                    {/* Logo row */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-between"
                    >
                        <Link href="/" className="text-lg font-extrabold tracking-tight text-[#1c1d1d]">
                            RentNest
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm text-neutral-500 hover:text-[#1c1d1d] transition-colors"
                        >
                            Sign up
                        </Link>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        className="w-full max-w-sm mx-auto space-y-6"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.h2
                            variants={fadeUp}
                            className="text-3xl font-extrabold tracking-tight text-[#1c1d1d]"
                        >
                            Sign In
                        </motion.h2>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="p-3 text-xs text-destructive-foreground bg-destructive/15 border border-destructive/20 rounded-md overflow-hidden"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <motion.div variants={fadeUp} className="space-y-1">
                                <label htmlFor="email" className="text-xs font-medium text-neutral-600">
                                    Email or Username
                                </label>
                                <AppInput
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="rounded-full h-12 px-5"
                                />
                            </motion.div>

                            <motion.div variants={fadeUp} className="space-y-1">
                                <label htmlFor="password" className="text-xs font-medium text-neutral-600">
                                    Password
                                </label>
                                <div className="relative">
                                    <AppInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="rounded-full h-12 px-5 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUp}>
                                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                                    <AppButton
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 rounded-full cursor-pointer bg-[#1c1d1d] hover:bg-[#1c1d1d]/90 text-white font-semibold"
                                    >
                                        {submitting ? 'Signing in...' : 'Sign In →'}
                                    </AppButton>
                                </motion.div>
                            </motion.div>
                        </form>

                        <motion.p variants={fadeUp} className="text-center text-xs text-neutral-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-[#1c1d1d] underline font-medium">
                                Register here
                            </Link>
                        </motion.p>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="flex items-center justify-center text-[11px] text-neutral-400 pt-8"
                    >
                        <span>© 2025 RentNest</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}