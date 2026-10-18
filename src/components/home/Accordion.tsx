'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItemData {
    question: string;
    answer: string;
}

/** Small accessible single-open accordion (button + region pattern). */
export function Accordion({ items, defaultOpen = 0 }: { items: AccordionItemData[]; defaultOpen?: number | null }) {
    const baseId = useId();
    const reduce = useReducedMotion();
    const [open, setOpen] = useState<number | null>(defaultOpen);

    return (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {items.map((item, i) => {
                const isOpen = open === i;
                const buttonId = `${baseId}-q-${i}`;
                const panelId = `${baseId}-a-${i}`;
                return (
                    <div key={item.question}>
                        <h3>
                            <button
                                id={buttonId}
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => setOpen(isOpen ? null : i)}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:px-6 sm:text-base"
                            >
                                <span>{item.question}</span>
                                <span
                                    className={cn(
                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300',
                                        isOpen && 'rotate-45 border-primary bg-primary text-primary-foreground',
                                    )}
                                >
                                    <Plus className="h-4 w-4" />
                                </span>
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
                                    transition={{ duration: reduce ? 0 : 0.25, ease: 'easeOut' }}
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
