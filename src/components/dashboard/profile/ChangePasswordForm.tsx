'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Check, Circle, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, authApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/components/dashboard/landlord/shared';

// Same policy as the backend: ≥8 characters with at least one letter and one digit.
const PASSWORD_RULES = [
    { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
    { label: 'Contains a letter', test: (v: string) => /[A-Za-z]/.test(v) },
    { label: 'Contains a number', test: (v: string) => /\d/.test(v) },
];

const passwordSchema = z
        .object({
            currentPassword: z.string().max(128).optional(),
            newPassword: z
                .string()
                .min(8, 'Password must be at least 8 characters')
                .max(128, 'Password must be 128 characters or fewer')
                .regex(/[A-Za-z]/, 'Password must contain at least one letter')
                .regex(/\d/, 'Password must contain at least one number'),
            confirmPassword: z.string().min(1, 'Confirm your new password'),
        })
        .refine((v) => v.newPassword === v.confirmPassword, {
            path: ['confirmPassword'],
            message: 'Passwords do not match',
        })
        .refine((v) => !v.currentPassword || v.currentPassword !== v.newPassword, {
            path: ['newPassword'],
            message: 'Choose a password different from your current one',
        });

type PasswordValues = z.infer<typeof passwordSchema>;

function PasswordInput({
    id,
    autoComplete,
    invalid,
    ...props
}: React.ComponentProps<'input'> & { invalid?: boolean }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <Input
                id={id}
                type={visible ? 'text' : 'password'}
                autoComplete={autoComplete}
                className="h-10 rounded-xl pr-10"
                aria-invalid={invalid}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={visible ? 'Hide password' : 'Show password'}
            >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

export function ChangePasswordForm({ authProvider }: { authProvider?: 'LOCAL' | 'GOOGLE' }) {
    const isGoogle = authProvider === 'GOOGLE';
    // Google accounts may not have a password yet; they can set one without the
    // current password. If they already set one, the backend asks for it.
    const [requireCurrent, setRequireCurrent] = useState(!isGoogle);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    });

    const newPassword = useWatch({ control, name: 'newPassword' }) ?? '';

    const onSubmit = async (values: PasswordValues) => {
        if (requireCurrent && !values.currentPassword) {
            setError('currentPassword', { message: 'Enter your current password' });
            return;
        }
        try {
            await authApi.changePassword({
                ...(requireCurrent && values.currentPassword ? { currentPassword: values.currentPassword } : {}),
                newPassword: values.newPassword,
            });
            reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
            if (isGoogle) setRequireCurrent(true);
            toast.success(requireCurrent ? 'Password changed' : 'Password set — you can now also sign in with email');
        } catch (error) {
            const message = errorMessage(error, 'Could not change your password.');
            if (error instanceof ApiError && /current password is required/i.test(message)) {
                setRequireCurrent(true);
                setError('currentPassword', { message: 'This account already has a password — enter it to continue.' });
            } else if (error instanceof ApiError && /current password/i.test(message)) {
                setError('currentPassword', { message });
            }
            toast.error(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {isGoogle && !requireCurrent && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm text-muted-foreground">
                    You signed in with Google, so your account may not have a password yet. Set one here to also sign in
                    with your email address.{' '}
                    <button
                        type="button"
                        onClick={() => setRequireCurrent(true)}
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                        I already have a password
                    </button>
                </div>
            )}

            {requireCurrent && (
                <div className="space-y-1.5">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <PasswordInput
                        id="currentPassword"
                        autoComplete="current-password"
                        invalid={!!errors.currentPassword}
                        {...register('currentPassword')}
                    />
                    {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New password</Label>
                    <PasswordInput
                        id="newPassword"
                        autoComplete="new-password"
                        invalid={!!errors.newPassword}
                        {...register('newPassword')}
                    />
                    {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <PasswordInput
                        id="confirmPassword"
                        autoComplete="new-password"
                        invalid={!!errors.confirmPassword}
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
            </div>

            <ul className="grid gap-1.5 text-xs sm:grid-cols-3" aria-label="Password requirements">
                {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(newPassword);
                    return (
                        <li key={rule.label} className={cn('flex items-center gap-1.5', ok ? 'text-primary' : 'text-muted-foreground')}>
                            {ok ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                            {rule.label}
                        </li>
                    );
                })}
            </ul>

            <div className="flex justify-end">
                <Button type="submit" className="h-10 rounded-xl px-5" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    {requireCurrent ? 'Update password' : 'Set password'}
                </Button>
            </div>
        </form>
    );
}
