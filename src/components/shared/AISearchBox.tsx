'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, MapPin, Search, Lightbulb, Tag } from 'lucide-react';
import { aiApi, toQueryString } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { SearchFilters, SearchSuggestion } from '@/types/api';

export interface SearchSubmit extends SearchFilters {
    search?: string;
}

interface AISearchBoxProps {
    defaultValue?: string;
    placeholder?: string;
    /** Called with the chosen search; defaults to navigating to /properties. */
    onSubmit?: (params: SearchSubmit) => void;
    size?: 'md' | 'lg';
    className?: string;
    /** Extra controls rendered inside the bar before the submit button (e.g. a date picker). */
    children?: React.ReactNode;
    /** Extra query params appended when navigating (e.g. moveIn/moveOut). */
    extraParams?: Record<string, string | undefined>;
}

const typeIcon = {
    property: Building2,
    location: MapPin,
    category: Tag,
    query: Lightbulb,
} as const;

/**
 * Search input with AI-powered suggestions (Claude via POST /ai/search-suggestions).
 * Basic catalogue matches are always shown; AI suggestions and extracted
 * filters (e.g. "2 bed under $500 in Dhaka") are added when available.
 */
export function AISearchBox({
    defaultValue = '',
    placeholder = 'Try “2 bed apartment in Gulshan under $700”',
    onSubmit,
    size = 'md',
    className,
    children,
    extraParams,
}: AISearchBoxProps) {
    const router = useRouter();
    const listId = useId();
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [source, setSource] = useState<'ai' | 'basic' | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const typedRef = useRef(false);

    // Suggestions only apply to the current query when it is long enough.
    const hasQuery = query.trim().length >= 2;
    const visible = hasQuery ? suggestions : [];

    // Debounced fetch of suggestions while the user types.
    useEffect(() => {
        if (!typedRef.current) return;
        const q = query.trim();
        if (q.length < 2) return; // short queries just hide the dropdown (see `hasQuery`)
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await aiApi.searchSuggestions(q, controller.signal);
                setSuggestions(res.data.suggestions);
                setFilters(res.data.filters ?? {});
                setSource(res.data.source);
                setActive(-1);
                setOpen(true);
            } catch {
                // Suggestions are a progressive enhancement; plain search still works.
                if (!controller.signal.aborted) setSuggestions([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 350);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    // Close on outside click.
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const submit = (params: SearchSubmit) => {
        setOpen(false);
        if (onSubmit) {
            onSubmit(params);
            return;
        }
        router.push(`/properties${toQueryString({ ...params, ...extraParams })}`);
    };

    const choose = (s: SearchSuggestion) => {
        if (s.type === 'property' && s.propertyId) {
            setOpen(false);
            router.push(`/properties/${s.propertyId}${toQueryString(extraParams ?? {})}`);
            return;
        }
        if (s.type === 'location') {
            setQuery(s.location ?? s.text);
            submit({ location: s.location ?? s.text });
            return;
        }
        if (s.type === 'category' && s.categoryId) {
            setQuery(s.text);
            submit({ categoryId: s.categoryId });
            return;
        }
        setQuery(s.text);
        submit({ search: s.text });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hasQuery && active >= 0 && suggestions[active]) {
            choose(suggestions[active]);
            return;
        }
        const q = query.trim();
        // When the AI understood structured intent, apply it as filters.
        if (hasQuery && source === 'ai' && Object.keys(filters).length > 0) {
            submit({ ...filters });
            return;
        }
        submit(q ? { search: q } : {});
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || !hasQuery || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const filterChips = Object.entries(hasQuery ? filters : {}).filter(([, v]) => v !== undefined && v !== null && v !== '');

    return (
        <div ref={wrapperRef} className={cn('relative w-full', className)}>
            <form
                onSubmit={handleSubmit}
                role="search"
                className={cn(
                    'flex w-full flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center',
                    size === 'lg' && 'p-2.5 shadow-lg',
                )}
            >
                <label className="flex min-w-0 flex-1 items-center gap-2 px-2">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="sr-only">Search properties</span>
                    <input
                        value={query}
                        onChange={(e) => {
                            typedRef.current = true;
                            // Filters / highlighted option belong to the previous query; drop them
                            // so an Enter before the next debounce can't submit stale intent.
                            setFilters({});
                            setSource(null);
                            setActive(-1);
                            setQuery(e.target.value);
                        }}
                        onFocus={() => suggestions.length > 0 && setOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        className={cn(
                            'h-10 w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none',
                            size === 'lg' && 'h-11 text-base',
                        )}
                    />
                    {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
                </label>
                {children}
                <button
                    type="submit"
                    className={cn(
                        'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        size === 'lg' && 'h-11',
                    )}
                >
                    <Search className="h-4 w-4" /> Search
                </button>
            </form>

            {open && visible.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl">
                    <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>Suggestions</span>
                        {source === 'ai' && (
                            <span className="inline-flex items-center gap-1 text-primary">
                                <Lightbulb className="h-3 w-3" /> AI-powered
                            </span>
                        )}
                    </div>
                    <ul id={listId} role="listbox" className="max-h-80 overflow-y-auto py-1">
                        {visible.map((s, i) => {
                            const Icon = typeIcon[s.type] ?? Search;
                            return (
                                <li key={`${s.type}-${s.text}-${i}`} role="option" aria-selected={i === active}>
                                    <button
                                        type="button"
                                        onMouseEnter={() => setActive(i)}
                                        onClick={() => choose(s)}
                                        className={cn(
                                            'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                            i === active ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
                                        )}
                                    >
                                        <Icon className={cn('h-4 w-4 shrink-0', s.type === 'query' ? 'text-primary' : 'text-muted-foreground')} />
                                        <span className="truncate">{s.text}</span>
                                        <span className="ml-auto shrink-0 text-[11px] capitalize text-muted-foreground">{s.type}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {source === 'ai' && filterChips.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                            <span>Press Enter to search with:</span>
                            {filterChips.map(([key, value]) => (
                                <span key={key} className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
                                    {key === 'categoryId' ? 'category' : `${key}: ${String(value)}`}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
