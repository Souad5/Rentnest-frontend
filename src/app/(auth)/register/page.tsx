'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'TENANT', // Default role
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.name || !formData.email || !formData.password) {
                throw new Error('Please fill in all required fields.');
            }

            // Simulated signup delay
            await new Promise((resolve) => setTimeout(resolve, 800));
            router.push('/dashboard');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md w-full space-y-6 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm">
            <div className="space-y-2 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                    <Building2 className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an Account</h1>
                <p className="text-sm text-muted-foreground">Join RentNest to manage or find your next rental home</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-9"
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-9"
                            required
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-9"
                            required
                        />
                    </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Account Role</label>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'TENANT' })}
                            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${formData.role === 'TENANT'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-input bg-transparent text-muted-foreground hover:bg-accent'
                                }`}
                        >
                            <User className="h-4 w-4" /> Tenant
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'LANDLORD' })}
                            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${formData.role === 'LANDLORD'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-input bg-transparent text-muted-foreground hover:bg-accent'
                                }`}
                        >
                            <ShieldCheck className="h-4 w-4" /> Landlord
                        </button>
                    </div>
                </div>

                <Button type="submit" className="w-full gap-2 mt-4" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign in
                </Link>
            </div>
        </div>
    );
}