'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
    title: string;
    text?: string;
}

/** Web Share API on supporting devices, copy-link fallback everywhere else. */
export function ShareButton({ title, text }: ShareButtonProps) {
    const share = async () => {
        const url = window.location.href;
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({ title, text, url });
                return;
            } catch (err) {
                // The user closed the share sheet — nothing to do.
                if (err instanceof DOMException && err.name === 'AbortError') return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied', { description: 'Paste it anywhere to share this home.' });
        } catch {
            toast.error('Couldn’t copy the link', { description: url });
        }
    };

    return (
        <Button variant="outline" className="h-9 rounded-xl px-3" onClick={share}>
            <Share2 className="h-4 w-4" /> Share
        </Button>
    );
}
