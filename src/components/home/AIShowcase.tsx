'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { openChatAssistant } from '@/components/ai/chat-events';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, LoaderCircle, MessageCircleMore, Search, Sparkles, WandSparkles } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { aiApi, toQueryString } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { SearchFilters } from '@/types/api';
import { Reveal } from './Reveal';

const EXAMPLES = [
    'Family flat in Dhanmondi under $600',
    '2 bedroom apartment in Gulshan',
    'Studio in Banani for one person',
    '3 bed house in Chattogram',
    'Furnished apartment in Uttara with parking',
];

const FEATURES: Array<{ title: string; body: string; where: React.ReactNode; icon: LucideIcon }> = [
    {
        title: 'Smart search suggestions',
        body: 'As you type, RentNest matches real listings, areas and categories, while AI reads intent like budget, bedrooms and neighbourhood and turns it into filters.',
        where: 'In the search bar on this page and on Explore.',
        icon: Search,
    },
    {
        title: 'AI rental assistant',
        body: 'Ask anything — “Which areas suit a family near a school?” or “What does the rental process involve?” — and get a short answer with up to three matching listings.',
        where: (
            <button
                type="button"
                onClick={() => openChatAssistant()}
                className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
            >
                Open the assistant
            </button>
        ),
        icon: MessageCircleMore,
    },
    {
        title: 'AI listing writer for landlords',
        body: 'Enter the basics — location, rooms, size, amenities — and get a polished 90–160 word description, key highlights and amenity suggestions to review and edit.',
        where: (
            <Link href="/dashboard/landlord/properties/new" className="font-medium text-primary underline-offset-4 hover:underline">
                Open the listing writer
            </Link>
        ),
        icon: WandSparkles,
    },
];

const hasFilters = (f?: SearchFilters | null) =>
    !!f && Object.values(f).some((v) => v !== undefined && v !== null && v !== '');

export function AIShowcase() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [pending, setPending] = useState<string | null>(null);
    const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

    useEffect(() => {
        let active = true;
        aiApi
            .status()
            .then((res) => active && setAiEnabled(res.data.enabled))
            .catch(() => active && setAiEnabled(false));
        return () => {
            active = false;
        };
    }, []);

    const run = async (raw: string) => {
        const q = raw.trim();
        if (!q || pending) return;
        setQuery(q);
        setPending(q);
        // Let AI translate the sentence into filters; fall back to a text search.
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        let target = `/properties${toQueryString({ search: q })}`;
        try {
            const res = await aiApi.searchSuggestions(q, controller.signal);
            if (res.data.source === 'ai' && hasFilters(res.data.filters)) {
                target = `/properties${toQueryString({ ...res.data.filters })}`;
            }
        } catch {
            /* fall back to plain text search */
        } finally {
            clearTimeout(timeout);
        }
        router.push(target);
    };

    return (
        <section className="bg-background py-16 sm:py-20">
            <Container>
                <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
                    <div>
                        <Reveal>
                            <SectionHeading
                                eyebrow="AI features"
                                title="Renting, with a helpful assistant built in"
                                description="RentNest uses Claude by Anthropic to understand what you are looking for — and to help landlords present their homes clearly."
                                className="mb-8"
                            />
                        </Reveal>
                        <ul className="space-y-4">
                            {FEATURES.map(({ title, body, where, icon: Icon }, i) => (
                                <li key={title}>
                                    <Reveal delay={i * 0.08}>
                                        <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    <span className="font-semibold text-foreground">Where: </span>
                                                    {where}
                                                </p>
                                            </div>
                                        </div>
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Reveal delay={0.1} className="lg:sticky lg:top-24">
                        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
                            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
                            <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-highlight/15 blur-3xl" />

                            <div className="relative">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="inline-flex items-center gap-2 font-serif text-xl font-semibold tracking-tight text-foreground">
                                        <Sparkles className="h-5 w-5 text-primary" /> Try it now
                                    </p>
                                    {aiEnabled !== null && (
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                                                aiEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            <span className={cn('h-1.5 w-1.5 rounded-full', aiEnabled ? 'bg-primary' : 'bg-muted-foreground')} />
                                            {aiEnabled ? 'AI online' : 'Basic search mode'}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Describe your ideal home in a sentence. We&apos;ll work out the area, budget and bedrooms and open matching
                                    listings.
                                </p>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        void run(query);
                                    }}
                                    className="mt-5 flex flex-col gap-2 sm:flex-row"
                                >
                                    <label htmlFor="ai-showcase-query" className="sr-only">
                                        Describe the home you want
                                    </label>
                                    <input
                                        id="ai-showcase-query"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        maxLength={120}
                                        placeholder="e.g. quiet 2 bed flat near Bashundhara"
                                        className="h-11 w-full min-w-0 rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!query.trim() || !!pending}
                                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                                    >
                                        {pending === query.trim() && pending ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className="h-4 w-4" />
                                        )}
                                        Search
                                    </button>
                                </form>

                                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Or tap an example</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {EXAMPLES.map((example) => {
                                        const loading = pending === example;
                                        return (
                                            <button
                                                key={example}
                                                type="button"
                                                onClick={() => void run(example)}
                                                disabled={!!pending}
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-wait',
                                                    loading && 'border-primary bg-primary/10 text-primary',
                                                )}
                                            >
                                                {loading ? (
                                                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                                                )}
                                                {example}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground" aria-live="polite">
                                    {pending ? (
                                        <span className="inline-flex items-center gap-2 text-foreground">
                                            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" /> Understanding “{pending}” and opening results…
                                        </span>
                                    ) : (
                                        <>
                                            <span className="font-semibold text-foreground">How it works: </span>
                                            your sentence is sent to our AI search endpoint, which returns structured filters (location, price range,
                                            bedrooms, category). If AI is unavailable, we run a regular keyword search instead — you always get results.
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
