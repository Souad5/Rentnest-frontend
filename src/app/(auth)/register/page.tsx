'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';

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
            await register({ name, email, password, role });
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message || 'Registration failed. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your Account</h1>
                    <p className="text-sm text-muted-foreground">Join RentNest as a Tenant or Landlord</p>
                </div>

                {error && (
                    <div className="p-3 text-xs text-destructive-foreground bg-destructive/15 border border-destructive/20 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Account Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole('TENANT')}
                                className={`py-2 text-xs font-semibold rounded-md border transition-colors ${role === 'TENANT'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                                    }`}
                            >
                                Tenant
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('LANDLORD')}
                                className={`py-2 text-xs font-semibold rounded-md border transition-colors ${role === 'LANDLORD'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                                    }`}
                            >
                                Landlord
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 px-4 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {submitting ? 'Creating account...' : `Register as ${role === 'TENANT' ? 'Tenant' : 'Landlord'}`}
                    </button>
                </form>

                <div className="text-center text-xs text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-primary underline font-medium">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    );
}