'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FaqItem } from '@/content/faq';
import { cn } from '@/lib/utils';

interface FaqAccordionProps {
    items: FaqItem[];
    /** Index of the item open on first render (-1 for none). */
    defaultOpen?: number;
    showCategory?: boolean;
    className?: string;
}

/** Accessible disclosure list (button + region, aria-expanded/controls). Multiple items may be open. */
export function FaqAccordion({ items, defaultOpen = -1, showCategory = false, className }: FaqAccordionProps) {
    const baseId = useId();
    const [openSet, setOpenSet] = useState<Set<string>>(
        () => new Set(defaultOpen >= 0 && items[defaultOpen] ? [items[defaultOpen].question] : []),
    );

    const toggle = (key: string) =>
        setOpenSet((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    return (
        <div className={cn('divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm', className)}>
            {items.map((item, index) => {
                const isOpen = openSet.has(item.question);
                const buttonId = `${baseId}-q-${index}`;
                const panelId = `${baseId}-a-${index}`;
                return (
                    <div key={item.question}>
                        <h3>
                            <button
                                id={buttonId}
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => toggle(item.question)}
                                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:px-6"
                            >
                                <span className="space-y-1">
                                    {showCategory && (
                                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary">
                                            {item.category}
                                        </span>
                                    )}
                                    <span className="block text-sm font-semibold text-foreground sm:text-base">{item.question}</span>
                                </span>
                                <ChevronDown
                                    aria-hidden
                                    className={cn(
                                        'mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                                        isOpen && 'rotate-180 text-primary',
                                    )}
                                />
                            </button>
                        </h3>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={buttonId}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">{item.answer}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
