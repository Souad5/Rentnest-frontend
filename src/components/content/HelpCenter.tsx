'use client';

import { useMemo, useState } from 'react';
import { Building2, CreditCard, Home, Search, UserRound, X, type LucideIcon } from 'lucide-react';
import { faqs, type FaqItem } from '@/content/faq';
import { EmptyState } from '@/components/shared/EmptyState';
import { FaqAccordion } from './FaqAccordion';
import { cn } from '@/lib/utils';

type Category = FaqItem['category'];
type Tab = 'All' | Category;

const categoryMeta: Record<Category, { icon: LucideIcon; blurb: string }> = {
    Tenants: { icon: Home, blurb: 'Requests, dates, reviews and the AI assistant' },
    Landlords: { icon: Building2, blurb: 'Listing, approving requests and moderation' },
    Payments: { icon: CreditCard, blurb: 'When you pay, Stripe security and records' },
    Account: { icon: UserRound, blurb: 'Sign-in, Google, profile and passwords' },
};

const categories = Object.keys(categoryMeta) as Category[];

function normalize(text: string) {
    return text.toLowerCase().normalize('NFKD');
}

export function HelpCenter() {
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState<Tab>('All');

    const counts = useMemo(() => {
        const map = new Map<Category, number>();
        for (const f of faqs) map.set(f.category, (map.get(f.category) ?? 0) + 1);
        return map;
    }, []);

    const results = useMemo(() => {
        const terms = normalize(query).split(/\s+/).filter(Boolean);
        return faqs.filter((f) => {
            if (tab !== 'All' && f.category !== tab) return false;
            if (!terms.length) return true;
            const haystack = normalize(`${f.question} ${f.answer} ${f.category}`);
            return terms.every((t) => haystack.includes(t));
        });
    }, [query, tab]);

    const searching = query.trim().length > 0;

    return (
        <div className="space-y-10">
            {/* Search */}
            <div className="mx-auto max-w-2xl">
                <label htmlFor="help-search" className="sr-only">
                    Search help articles
                </label>
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        id="help-search"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search questions, e.g. “payment”, “approve”, “Google”"
                        className="h-14 w-full rounded-2xl border border-input bg-card pr-12 pl-12 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                            className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground" aria-live="polite">
                    {searching
                        ? `${results.length} ${results.length === 1 ? 'answer' : 'answers'} found${tab !== 'All' ? ` in ${tab}` : ''}`
                        : `${faqs.length} answers across ${categories.length} topics`}
                </p>
            </div>

            {/* Topic cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((c) => {
                    const { icon: Icon, blurb } = categoryMeta[c];
                    const active = tab === c;
                    return (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setTab(active ? 'All' : c)}
                            aria-pressed={active}
                            className={cn(
                                'flex items-start gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                active ? 'border-primary bg-accent/60' : 'border-border hover:border-primary/40',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                    active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-foreground">
                                    {c} <span className="font-normal text-muted-foreground">({counts.get(c) ?? 0})</span>
                                </span>
                                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{blurb}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tabs + results */}
            <div className="space-y-5">
                <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div role="tablist" aria-label="FAQ topics" className="inline-flex gap-1 rounded-xl bg-muted p-1">
                        {(['All', ...categories] as Tab[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                role="tab"
                                aria-selected={tab === t}
                                aria-controls="faq-results"
                                onClick={() => setTab(t)}
                                className={cn(
                                    'h-9 shrink-0 rounded-lg px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div id="faq-results" role="tabpanel" aria-label={`${tab} questions`}>
                    {results.length ? (
                        <FaqAccordion
                            key={`${tab}-${query}`}
                            items={results}
                            defaultOpen={searching ? 0 : -1}
                            showCategory={tab === 'All'}
                        />
                    ) : (
                        <EmptyState
                            icon={Search}
                            title="No answers match your search"
                            description="Try a different word, switch topic, or ask the AI assistant or our support team below."
                            action={
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        setTab('All');
                                    }}
                                    className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
                                >
                                    Reset search
                                </button>
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
