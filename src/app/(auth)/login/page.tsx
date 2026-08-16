'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';

import { AppButton } from '@/components/shared/AppButton';
import { AppInput } from '@/components/shared/AppInput';

export default function LoginPage() {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                setError(
                    err.message ||
                    'Invalid credentials. Please try again.'
                );
            } else {
                setError(
                    'An unexpected error occurred. Please try again.'
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Welcome Back
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Log in to your RentNest account
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 text-xs text-destructive-foreground bg-destructive/15 border border-destructive/20 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email */}
                    <div className="space-y-1">
                        <label
                            htmlFor="email"
                            className="text-xs font-medium text-foreground"
                        >
                            Email Address
                        </label>

                        <AppInput
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label
                            htmlFor="password"
                            className="text-xs font-medium text-foreground"
                        >
                            Password
                        </label>

                        <AppInput
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Submit */}
                    <AppButton
                        type="submit"
                        disabled={submitting}
                        className="w-full cursor-pointer"
                    >
                        {submitting ? 'Logging in...' : 'Sign In'}
                    </AppButton>
                </form>

                {/* Register */}
                <div className="text-center text-xs text-muted-foreground">
                    Don&apos;t have an account?{' '}

                    <Link
                        href="/register"
                        className="text-primary underline font-medium"
                    >
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
}