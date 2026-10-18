'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/** 1 … 4 5 6 … 12 — first, last and the current page's neighbours. */
export function getPageItems(page: number, totalPages: number): PageItem[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
    // Keep the window five wide near the edges so the control doesn't jump around.
    if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
    if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));

    const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const items: PageItem[] = [];
    sorted.forEach((p, i) => {
        const prev = sorted[i - 1];
        if (prev !== undefined && p - prev === 2) items.push(prev + 1);
        else if (prev !== undefined && p - prev > 2) items.push(items.length < 3 ? 'ellipsis-start' : 'ellipsis-end');
        items.push(p);
    });
    return items;
}

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    className?: string;
}

export function Pagination({ page, totalPages, onPageChange, disabled, className }: PaginationProps) {
    if (totalPages <= 1) return null;
    const items = getPageItems(page, totalPages);

    return (
        <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
            <Button
                variant="outline"
                className="h-10 rounded-xl px-3"
                onClick={() => onPageChange(page - 1)}
                disabled={disabled || page <= 1}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
            </Button>

            <span className="px-3 text-sm text-muted-foreground sm:hidden">
                Page <span className="font-semibold text-foreground">{page}</span> of {totalPages}
            </span>

            <ul className="hidden items-center gap-1.5 sm:flex">
                {items.map((item) =>
                    typeof item === 'number' ? (
                        <li key={item}>
                            <Button
                                variant={item === page ? 'default' : 'ghost'}
                                className="h-10 min-w-10 rounded-xl px-3 tabular-nums"
                                onClick={() => item !== page && onPageChange(item)}
                                disabled={disabled}
                                aria-label={`Page ${item}`}
                                aria-current={item === page ? 'page' : undefined}
                            >
                                {item}
                            </Button>
                        </li>
                    ) : (
                        <li key={item} aria-hidden className="px-1 text-sm text-muted-foreground">
                            …
                        </li>
                    ),
                )}
            </ul>

            <Button
                variant="outline"
                className="h-10 rounded-xl px-3"
                onClick={() => onPageChange(page + 1)}
                disabled={disabled || page >= totalPages}
                aria-label="Next page"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
}
