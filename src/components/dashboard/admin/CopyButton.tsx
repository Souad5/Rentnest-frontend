'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface CopyButtonProps {
    value: string;
    label: string;
    /** Toast shown after copying. */
    successMessage?: string;
    children?: React.ReactNode;
    className?: string;
}

/** Copies text to the clipboard. Icon-only unless children are given. */
export function CopyButton({ value, label, successMessage = 'Copied to clipboard', children, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success(successMessage);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error('Clipboard access was blocked by the browser');
        }
    };

    const Icon = copied ? Check : Copy;

    if (children) {
        return (
            <Button variant="outline" className={className ?? 'rounded-xl'} onClick={copy} aria-label={label}>
                <Icon />
                {children}
            </Button>
        );
    }

    return (
        <Button variant="ghost" size="icon-sm" className={className ?? 'rounded-xl'} onClick={copy} aria-label={label} title={label}>
            <Icon className={copied ? 'text-primary' : undefined} />
        </Button>
    );
}
