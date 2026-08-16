'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';
import { AppButton } from '@/components/shared/AppButton';
import { AppInput } from '@/components/shared/AppInput';

export default function RegisterPage() {
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'TENANT' | 'LANDLORD'>('TENANT');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await register({
                name,
                email,
                password,
                role,
            });
        } catch (err) {
            if (err instanceof ApiError) {
                setError(
                    err.message ||
                    'Registration failed. Please try again.'
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
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Create your Account
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Join RentNest as a Tenant or Landlord
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 text-xs text-destructive-foreground bg-destructive/15 border border-destructive/20 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Account Type */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">
                            Account Type
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            <AppButton
                                type="button"
                                onClick={() => setRole('TENANT')}
                                className={
                                    role === 'TENANT'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-muted-foreground border border-border hover:bg-muted'
                                }
                            >
                                Tenant
                            </AppButton>

                            <AppButton
                                type="button"
                                onClick={() => setRole('LANDLORD')}
                                className={
                                    role === 'LANDLORD'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-muted-foreground border border-border hover:bg-muted'
                                }
                            >
                                Landlord
                            </AppButton>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1">
                        <label
                            htmlFor="name"
                            className="text-xs font-medium text-foreground"
                        >
                            Full Name
                        </label>

                        <AppInput
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>

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
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Submit */}
                    <AppButton
                        type="submit"
                        disabled={submitting}
                        className="w-full"
                    >
                        {submitting
                            ? 'Creating account...'
                            : `Register as ${role === 'TENANT'
                                ? 'Tenant'
                                : 'Landlord'
                            }`}
                    </AppButton>
                </form>

                {/* Login */}
                <div className="text-center text-xs text-muted-foreground">
                    Already have an account?{' '}

                    <Link
                        href="/login"
                        className="text-primary underline font-medium"
                    >
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    );
}