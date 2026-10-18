'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Building2, CheckCircle2, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';
import { siteConfig } from '@/config/site';
import { FormErrorBanner, FormField, fieldClass } from '@/components/content/form';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';
import { cn } from '@/lib/utils';

const schema = z
    .object({
        name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
        email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Za-z]/, 'Password must contain at least one letter')
            .regex(/\d/, 'Password must contain at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        role: z.enum(['TENANT', 'LANDLORD']),
    })
    .refine((v) => v.password === v.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });
type Values = z.infer<typeof schema>;

const roles = [
    {
        value: 'TENANT' as const,
        title: 'I want to rent',
        text: 'Search homes, request dates and pay securely.',
        icon: Search,
    },
    {
        value: 'LANDLORD' as const,
        title: 'I’m a landlord',
        text: 'List properties and manage requests and earnings.',
        icon: Building2,
    },
];

export function RegisterForm() {
    const { register: registerUser } = useAuth();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') ?? undefined;
    const initialRole = searchParams.get('role')?.toUpperCase() === 'LANDLORD' ? 'LANDLORD' : 'TENANT';
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: initialRole },
    });

    const password = useWatch({ control, name: 'password' }) ?? '';
    const role = useWatch({ control, name: 'role' }) ?? initialRole;

    const onSubmit = async (values: Values) => {
        setApiError(null);
        try {
            await registerUser(
                { name: values.name, email: values.email, password: values.password, role: values.role },
                from,
            );
            toast.success(`Welcome to ${siteConfig.name}, ${values.name.split(' ')[0]}!`);
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message || 'Could not create your account.'
                    : 'Could not reach the server. Check your connection and try again.';
            setApiError(message);
            toast.error(message);
        }
    };

    // (URLSearchParams.size is missing on Safari < 17, so don't rely on it.)
    const loginHref = from ? `/login?from=${encodeURIComponent(from)}` : '/login';

    return (
        <div className="space-y-7">
            <div className="space-y-2">
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Create your account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Join {siteConfig.name} free — whether you’re looking for a home or have one to let.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <fieldset className="space-y-2">
                    <legend className="mb-2 text-sm font-medium text-foreground">I’m joining as</legend>
                    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                        {roles.map(({ value, title, text, icon: Icon }) => {
                            const selected = role === value;
                            return (
                                <label
                                    key={value}
                                    className={cn(
                                        'relative flex cursor-pointer flex-col gap-2 rounded-2xl border bg-card p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                        selected
                                            ? 'border-primary bg-accent/60 shadow-sm'
                                            : 'border-border hover:border-primary/40 hover:bg-muted/50',
                                    )}
                                >
                                    <input type="radio" value={value} className="sr-only" {...register('role')} />
                                    <span className="flex items-center justify-between">
                                        <span
                                            className={cn(
                                                'flex h-9 w-9 items-center justify-center rounded-xl',
                                                selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        {selected && <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />}
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">{title}</span>
                                    <span className="text-xs leading-relaxed text-muted-foreground">{text}</span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>

                <GoogleSignInButton role={role} redirectTo={from} onError={setApiError} text="signup_with" />

                <AuthDivider label="or register with email" />

                <FormErrorBanner message={apiError} />

                <FormField id="name" label="Full name" error={errors.name?.message}>
                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Nusrat Jahan"
                        className={fieldClass}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        readOnly={isSubmitting}
                        {...register('name')}
                    />
                </FormField>

                <FormField id="email" label="Email address" error={errors.email?.message}>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={fieldClass}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        readOnly={isSubmitting}
                        {...register('email')}
                    />
                </FormField>

                <FormField id="password" label="Password" error={errors.password?.message}>
                    <PasswordInput
                        id="password"
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                        readOnly={isSubmitting}
                        {...register('password')}
                    />
                </FormField>
                <div id="password-strength" className="-mt-2">
                    <PasswordStrength password={password} />
                </div>

                <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
                    <PasswordInput
                        id="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                        readOnly={isSubmitting}
                        {...register('confirmPassword')}
                    />
                </FormField>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isSubmitting ? 'Creating account…' : role === 'LANDLORD' ? 'Create landlord account' : 'Create tenant account'}
                </button>

                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    By creating an account you agree to our{' '}
                    <Link href="/terms" className="font-medium text-foreground underline-offset-2 hover:underline">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-foreground underline-offset-2 hover:underline">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href={loginHref} className="font-semibold text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
