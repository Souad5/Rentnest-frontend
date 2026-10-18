'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { publicApi, ApiError } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { FormErrorBanner, FormField, fieldClass } from './form';
import { cn } from '@/lib/utils';

const MESSAGE_MAX = 2000;

const schema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    subject: z
        .string()
        .trim()
        .min(3, 'Subject must be at least 3 characters')
        .max(120, 'Subject must be 120 characters or fewer'),
    message: z
        .string()
        .trim()
        .min(10, 'Message must be at least 10 characters')
        .max(MESSAGE_MAX, `Message must be ${MESSAGE_MAX} characters or fewer`),
});
type Values = z.infer<typeof schema>;

export function ContactForm() {
    const { user } = useAuth();
    const [apiError, setApiError] = useState<string | null>(null);
    const [sentTo, setSentTo] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<Values>({
        resolver: zodResolver(schema),
        // `values` keeps name/email in sync once the signed-in user loads.
        values: { name: user?.name ?? '', email: user?.email ?? '', subject: '', message: '' },
        resetOptions: { keepDirtyValues: true },
    });
    const message = useWatch({ control, name: 'message' }) ?? '';

    const onSubmit = async (values: Values) => {
        setApiError(null);
        try {
            const res = await publicApi.contact(values);
            toast.success(res.message || 'Message sent — we’ll be in touch soon.');
            setSentTo(values.email);
            reset({ name: values.name, email: values.email, subject: '', message: '' });
        } catch (err) {
            const msg =
                err instanceof ApiError
                    ? err.status === 429
                        ? 'Too many messages in a short time. Please wait a few minutes and try again.'
                        : err.message
                    : 'Could not reach the server. Check your connection and try again.';
            setApiError(msg);
            toast.error(msg);
        }
    };

    if (sentTo) {
        return (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12" role="status">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CheckCircle2 className="h-7 w-7" />
                </span>
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">Message sent</h2>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Thanks for getting in touch. Our support team reads every message and will reply to{' '}
                    <span className="font-medium break-all text-foreground">{sentTo}</span> during support hours.
                </p>
                <button
                    type="button"
                    onClick={() => setSentTo(null)}
                    className="mt-2 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
            aria-labelledby="contact-form-title"
        >
            <div className="space-y-1">
                <h2 id="contact-form-title" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                    Send us a message
                </h2>
                <p className="text-sm text-muted-foreground">All fields are required. We usually reply within one working day.</p>
            </div>

            <FormErrorBanner message={apiError} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField id="contact-name" label="Your name" error={errors.name?.message}>
                    <input
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        className={fieldClass}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        readOnly={isSubmitting}
                        {...register('name')}
                    />
                </FormField>
                <FormField id="contact-email" label="Email address" error={errors.email?.message}>
                    <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={fieldClass}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        readOnly={isSubmitting}
                        {...register('email')}
                    />
                </FormField>
            </div>

            <FormField id="contact-subject" label="Subject" error={errors.subject?.message}>
                <input
                    id="contact-subject"
                    type="text"
                    maxLength={120}
                    placeholder="e.g. Question about a rental request"
                    className={fieldClass}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                    readOnly={isSubmitting}
                    {...register('subject')}
                />
            </FormField>

            <FormField
                id="contact-message"
                label="Message"
                error={errors.message?.message}
                labelAction={
                    <span
                        className={cn(
                            'text-xs tabular-nums',
                            message.length > MESSAGE_MAX ? 'text-destructive' : 'text-muted-foreground',
                        )}
                        aria-live="polite"
                    >
                        {message.length}/{MESSAGE_MAX}
                    </span>
                }
                hint="Include a property name or request date if your question is about a specific rental."
            >
                <textarea
                    id="contact-message"
                    rows={6}
                    placeholder="How can we help?"
                    className={cn(fieldClass, 'h-auto min-h-36 resize-y py-3 leading-relaxed')}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    readOnly={isSubmitting}
                    {...register('message')}
                />
            </FormField>

            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 sm:w-auto"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
        </form>
    );
}
