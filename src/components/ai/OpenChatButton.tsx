'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { openChatAssistant } from './chat-events';

/** Opens the floating AI assistant (optionally pre-filling a question). */
export function OpenChatButton({
    prompt,
    className,
    children = 'Ask the AI assistant',
}: {
    prompt?: string;
    className?: string;
    children?: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={() => openChatAssistant(prompt)}
            className={cn(
                'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                className,
            )}
        >
            <MessageCircle className="h-4 w-4" />
            {children}
        </button>
    );
}
