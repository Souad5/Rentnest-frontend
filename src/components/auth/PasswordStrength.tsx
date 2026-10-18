import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function passwordScore(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
    // Never call a password "strong" if it misses the server's hard rules.
    const meetsRules = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
    return meetsRules ? Math.max(score, 1) : Math.min(score, 1);
}

const LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

/** 4-segment strength meter + checklist of the server's password rules. */
export function PasswordStrength({ password }: { password: string }) {
    const score = passwordScore(password);
    const barColor = score <= 1 ? 'bg-destructive' : score === 2 ? 'bg-highlight' : 'bg-primary';
    const rules = [
        { ok: password.length >= 8, label: 'At least 8 characters' },
        { ok: /[A-Za-z]/.test(password), label: 'One letter' },
        { ok: /\d/.test(password), label: 'One number' },
    ];

    return (
        <div className="space-y-2" aria-live="polite">
            <div className="flex items-center gap-3">
                <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
                    {[1, 2, 3, 4].map((step) => (
                        <span
                            key={step}
                            className={cn('h-1.5 rounded-full transition-colors', password && score >= step ? barColor : 'bg-muted')}
                        />
                    ))}
                </div>
                <span className="w-16 text-right text-xs font-medium text-muted-foreground">
                    {password ? LABELS[score] : ''}
                </span>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {rules.map((rule) => (
                    <li
                        key={rule.label}
                        className={cn('flex items-center gap-1 text-xs', rule.ok ? 'text-primary' : 'text-muted-foreground')}
                    >
                        <Check className={cn('h-3 w-3', !rule.ok && 'opacity-40')} />
                        {rule.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
