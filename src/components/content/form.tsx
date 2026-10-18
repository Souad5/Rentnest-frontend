import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared input styling for auth + contact forms (token classes only). */
export const fieldClass =
    'h-11 w-full min-w-0 rounded-xl border border-input bg-card px-4 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

interface FormFieldProps {
    id: string;
    label: string;
    error?: string;
    hint?: React.ReactNode;
    labelAction?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

/** Label + control + inline error. Pass `aria-describedby={`${id}-error`}` to the control. */
export function FormField({ id, label, error, hint, labelAction, className, children }: FormFieldProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <div className="flex items-center justify-between gap-2">
                <label htmlFor={id} className="text-sm font-medium text-foreground">
                    {label}
                </label>
                {labelAction}
            </div>
            {children}
            {error ? (
                <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                </p>
            ) : (
                hint && <div className="text-xs text-muted-foreground">{hint}</div>
            )}
        </div>
    );
}

/** Full-width error banner for API errors. */
export function FormErrorBanner({ message, className }: { message: string | null; className?: string }) {
    if (!message) return null;
    return (
        <div
            role="alert"
            className={cn(
                'flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive',
                className,
            )}
        >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">{message}</p>
        </div>
    );
}
