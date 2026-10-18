'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Building2, KeyRound, Loader2, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';
import { siteConfig } from '@/config/site';
import { FormErrorBanner, FormField, fieldClass } from '@/components/content/form';
import { PasswordInput } from './PasswordInput';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';
import { cn } from '@/lib/utils';

const schema = z.object({
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});
type Values = z.infer<typeof schema>;

const demoIcons = { TENANT: UserRound, LANDLORD: Building2, ADMIN: ShieldCheck } as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function LoginForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') ?? undefined;
    const [apiError, setApiError] = useState<string | null>(null);
    const [demoLoading, setDemoLoading] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

    const onSubmit = async (values: Values) => {
        setApiError(null);
        try {
            await login({ email: values.email, password: values.password }, from);
            toast.success('Welcome back!');
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message || 'Invalid email or password.'
                    : 'Could not reach the server. Check your connection and try again.';
            setApiError(message);
            toast.error(message);
        }
    };

    const signInAsDemo = async (account: (typeof siteConfig.demoAccounts)[number]) => {
        setDemoLoading(account.role);
        setApiError(null);
        // Fill the fields visibly, then submit through the normal validated path.
        setValue('email', account.email, { shouldValidate: true, shouldDirty: true });
        setValue('password', account.password, { shouldValidate: true, shouldDirty: true });
        await wait(350);
        await handleSubmit(onSubmit)();
        setDemoLoading(null);
    };

    const busy = isSubmitting || demoLoading !== null;
    const registerHref = from ? `/register?from=${encodeURIComponent(from)}` : '/register';

    return (
        <div className="space-y-7">
            <div className="space-y-2">
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                    Sign in to manage your rental requests, payments and listings.
                </p>
            </div>

            <GoogleSignInButton redirectTo={from} onError={setApiError} text="signin_with" />

            <AuthDivider label="or sign in with email" />

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <FormErrorBanner message={apiError} />

                <FormField id="email" label="Email address" error={errors.email?.message}>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={fieldClass}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        readOnly={busy}
                        {...register('email')}
                    />
                </FormField>

                <FormField
                    id="password"
                    label="Password"
                    error={errors.password?.message}
                    labelAction={
                        <Link href="/help" className="text-xs font-medium text-primary hover:underline">
                            Trouble signing in?
                        </Link>
                    }
                >
                    <PasswordInput
                        id="password"
                        autoComplete="current-password"
                        placeholder="Your password"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        readOnly={busy}
                        {...register('password')}
                    />
                </FormField>

                <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isSubmitting ? 'Signing in…' : 'Sign in'}
                </button>
            </form>

            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <KeyRound className="h-3.5 w-3.5" /> Try a demo account
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {siteConfig.demoAccounts.map((account) => {
                        const Icon = demoIcons[account.role];
                        const loading = demoLoading === account.role;
                        return (
                            <button
                                key={account.role}
                                type="button"
                                onClick={() => signInAsDemo(account)}
                                disabled={busy}
                                aria-label={`Sign in as demo ${account.label.toLowerCase()}`}
                                className={cn(
                                    'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60',
                                    loading && 'border-primary/50 bg-accent text-accent-foreground',
                                )}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4 text-primary" />}
                                {account.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                New to {siteConfig.name}?{' '}
                <Link href={registerHref} className="font-semibold text-primary hover:underline">
                    Create an account
                </Link>
            </p>
        </div>
    );
}
