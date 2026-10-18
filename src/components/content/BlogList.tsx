'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { blogPosts, type BlogPost } from '@/content/blog';
import { EmptyState } from '@/components/shared/EmptyState';
import { BlogCard } from './BlogCard';
import { cn } from '@/lib/utils';

type Filter = 'All' | BlogPost['category'];
const CATEGORIES: BlogPost['category'][] = ['Renting tips', 'For landlords', 'Neighbourhoods', 'Money & payments'];

export function BlogList() {
    const [filter, setFilter] = useState<Filter>('All');
    const [query, setQuery] = useState('');

    const posts = useMemo(() => {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        return blogPosts.filter((p) => {
            if (filter !== 'All' && p.category !== filter) return false;
            if (!terms.length) return true;
            const haystack = `${p.title} ${p.excerpt} ${p.category} ${p.author}`.toLowerCase();
            return terms.every((t) => haystack.includes(t));
        });
    }, [filter, query]);

    const showFeatured = filter === 'All' && !query.trim() && posts.length > 0;
    const [featured, ...rest] = posts;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by category">
                    {(['All', ...CATEGORIES] as Filter[]).map((c) => {
                        const count = c === 'All' ? blogPosts.length : blogPosts.filter((p) => p.category === c).length;
                        return (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setFilter(c)}
                                aria-pressed={filter === c}
                                className={cn(
                                    'inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    filter === c
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted',
                                )}
                            >
                                {c}
                                <span className={cn('text-xs', filter === c ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="relative w-full lg:max-w-xs">
                    <label htmlFor="blog-search" className="sr-only">
                        Search articles
                    </label>
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        id="blog-search"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search articles"
                        className="h-11 w-full rounded-xl border border-input bg-card pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                            className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <p className="sr-only" aria-live="polite">
                {posts.length} {posts.length === 1 ? 'article' : 'articles'} shown
            </p>

            {posts.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No articles match"
                    description="Try another keyword or category."
                    action={
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setFilter('All');
                            }}
                            className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            Show all articles
                        </button>
                    }
                />
            ) : (
                <>
                    {showFeatured && <BlogCard post={featured} featured />}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {(showFeatured ? rest : posts).map((post) => (
                            <BlogCard key={post.slug} post={post} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
