'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, CalendarDays, RefreshCw, SearchX, SlidersHorizontal, X } from 'lucide-react';

import { AISearchBox, type SearchSubmit } from '@/components/shared/AISearchBox';
import { Container } from '@/components/shared/Container';
import { EmptyState } from '@/components/shared/EmptyState';
import PropertyCard, { PropertyCardSkeleton } from '@/components/shared/PropertyCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, propertiesApi } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

import {
    DEFAULT_PAGE_SIZE,
    DEFAULT_SORT,
    FILTER_KEYS,
    PAGE_SIZES,
    SORT_OPTIONS,
    activeFilterCount,
    datesHrefQuery,
    readExploreState,
    toApiQuery,
} from './explore-params';
import { FilterControls, type FilterValues } from './FilterControls';
import { Pagination } from './Pagination';

type Patch = Record<string, string | number | null | undefined>;

const shortDate = (iso: string) => format(parseISO(iso), 'MMM d, yyyy');

export function ExploreView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const state = useMemo(() => readExploreState(searchParams), [searchParams]);
    const apiQuery = useMemo(() => toApiQuery(state), [state]);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    /**
     * Merges a patch into the URL. Any filter change resets to page 1 unless told otherwise.
     * Uses the native History API (synced into useSearchParams by Next) so filter changes
     * don't wait on an RSC round trip, and reads the live URL so back-to-back commits
     * (e.g. min then max price) never merge into a stale snapshot.
     */
    const setParams = useCallback(
        (patch: Patch, opts: { resetPage?: boolean; history?: 'push' | 'replace' } = {}) => {
            const next = new URLSearchParams(
                typeof window !== 'undefined' ? window.location.search : searchParams.toString(),
            );
            for (const [key, value] of Object.entries(patch)) {
                if (value === undefined || value === null || value === '') next.delete(key);
                else next.set(key, String(value));
            }
            if (opts.resetPage !== false && !('page' in patch)) next.delete('page');
            // Keep URLs short: drop defaults.
            if (next.get('page') === '1') next.delete('page');
            if (next.get('sort') === DEFAULT_SORT) next.delete('sort');
            if (next.get('limit') === String(DEFAULT_PAGE_SIZE)) next.delete('limit');

            const qs = next.toString();
            const url = qs ? `${pathname}?${qs}` : pathname;
            if (opts.history === 'push') window.history.pushState(null, '', url);
            else window.history.replaceState(null, '', url);
        },
        [pathname, searchParams],
    );

    const categoriesQuery = useQuery({
        queryKey: ['explore', 'categories'],
        queryFn: async () => (await propertiesApi.categories()).data,
        staleTime: 10 * 60 * 1000,
    });
    const locationsQuery = useQuery({
        queryKey: ['explore', 'locations', 50],
        queryFn: async () => (await propertiesApi.locations(50)).data,
        staleTime: 10 * 60 * 1000,
    });
    const listQuery = useQuery({
        queryKey: ['explore', 'properties', apiQuery],
        queryFn: ({ signal }) => propertiesApi.list(apiQuery, { signal }),
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000,
    });

    const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
    const locations = locationsQuery.data ?? [];

    // `?category=Apartment` (footer links) resolves to the matching id once categories load.
    const resolvedCategoryId =
        state.categoryId ||
        (state.category ? (categories.find((c) => c.name.toLowerCase() === state.category.toLowerCase())?.id ?? '') : '');
    const categoryLabel = state.categoryId
        ? (categories.find((c) => c.id === state.categoryId)?.name ?? 'Selected category')
        : state.category;

    const filterValues: FilterValues = {
        categoryId: resolvedCategoryId,
        location: state.location,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        bedrooms: state.bedrooms,
        minRating: state.minRating,
    };

    const handleFilterChange = useCallback(
        (key: keyof FilterValues, value: string | null) => {
            if (key === 'categoryId') setParams({ categoryId: value, category: null });
            else setParams({ [key]: value });
        },
        [setParams],
    );

    const handleSearch = (submitted: SearchSubmit) => {
        // A new search replaces the keyword; structured filters the AI extracted are merged in.
        const patch: Patch = { search: submitted.search?.trim() || null };
        if (submitted.location) patch.location = submitted.location;
        if (submitted.categoryId) {
            patch.categoryId = submitted.categoryId;
            patch.category = null;
        }
        if (submitted.minPrice != null) patch.minPrice = submitted.minPrice;
        if (submitted.maxPrice != null) patch.maxPrice = submitted.maxPrice;
        if (submitted.bedrooms != null) patch.bedrooms = submitted.bedrooms;
        setParams(patch, { history: 'push' });
    };

    const clearAll = () => {
        const patch: Patch = { moveIn: null, moveOut: null };
        FILTER_KEYS.forEach((k) => (patch[k] = null));
        setParams(patch);
    };

    const goToPage = (page: number) => {
        setParams({ page }, { history: 'push' });
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (state.search) chips.push({ key: 'search', label: `“${state.search}”`, onRemove: () => setParams({ search: null }) });
    if (categoryLabel)
        chips.push({ key: 'category', label: categoryLabel, onRemove: () => setParams({ categoryId: null, category: null }) });
    if (state.location) chips.push({ key: 'location', label: state.location, onRemove: () => setParams({ location: null }) });
    if (state.minPrice)
        chips.push({ key: 'minPrice', label: `From ${formatPrice(Number(state.minPrice))}`, onRemove: () => setParams({ minPrice: null }) });
    if (state.maxPrice)
        chips.push({ key: 'maxPrice', label: `Up to ${formatPrice(Number(state.maxPrice))}`, onRemove: () => setParams({ maxPrice: null }) });
    if (state.bedrooms)
        chips.push({ key: 'bedrooms', label: `${state.bedrooms}+ bedrooms`, onRemove: () => setParams({ bedrooms: null }) });
    if (state.minRating)
        chips.push({ key: 'minRating', label: `${state.minRating}+ stars`, onRemove: () => setParams({ minRating: null }) });
    if (state.moveIn || state.moveOut) {
        const label = state.moveIn && state.moveOut
            ? `Dates: ${shortDate(state.moveIn)} – ${shortDate(state.moveOut)}`
            : state.moveIn
              ? `Dates: from ${shortDate(state.moveIn)}`
              : `Dates: until ${shortDate(state.moveOut)}`;
        chips.push({ key: 'dates', label, onRemove: () => setParams({ moveIn: null, moveOut: null }, { resetPage: false }) });
    }

    const filterCount = activeFilterCount(state);
    const hrefQuery = datesHrefQuery(state);
    const properties = listQuery.data?.data ?? [];
    const meta = listQuery.data?.meta;
    const total = meta?.total ?? properties.length;
    const totalPages = meta?.totalPages ?? 1;
    const showSkeleton = listQuery.isPending || (listQuery.isPlaceholderData && listQuery.isFetching);
    const rangeStart = total === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const rangeEnd = Math.min(state.page * state.limit, total);

    const filterControls = (layout: 'bar' | 'stack') => (
        <FilterControls
            layout={layout}
            values={filterValues}
            categories={categories}
            locations={locations}
            optionsLoading={categoriesQuery.isPending || locationsQuery.isPending}
            onChange={handleFilterChange}
        />
    );

    return (
        <>
            <section className="border-b border-border bg-muted/40">
                <Container className="py-10 sm:py-14">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Explore rentals</p>
                    <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                        Find a home that fits your budget and your commute
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Every listing below is open for rental requests right now. Search by neighbourhood, set a monthly
                        budget, or describe what you need in plain words and let our AI search fill in the filters.
                    </p>
                    <AISearchBox
                        key={state.search}
                        defaultValue={state.search}
                        onSubmit={handleSearch}
                        size="lg"
                        className="mt-6 max-w-3xl"
                    />
                </Container>
            </section>

            <Container className="py-8 sm:py-10">
                {/* Desktop filter bar: full-width so the grid keeps 4 cards per row. */}
                <div className="hidden rounded-2xl border border-border bg-card p-4 shadow-sm lg:block">
                    {filterControls('bar')}
                </div>

                <div ref={resultsRef} className="scroll-mt-24 pt-0 lg:pt-6">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div aria-live="polite" className="text-sm text-muted-foreground">
                            {listQuery.isPending ? (
                                <Skeleton className="h-4 w-48 rounded-full" />
                            ) : listQuery.isError ? (
                                'Results unavailable'
                            ) : total === 0 ? (
                                'No homes match these filters'
                            ) : (
                                <>
                                    Showing{' '}
                                    <span className="font-semibold text-foreground">
                                        {rangeStart}–{rangeEnd}
                                    </span>{' '}
                                    of <span className="font-semibold text-foreground">{total.toLocaleString()}</span>{' '}
                                    {total === 1 ? 'home' : 'homes'}
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                className="h-10 rounded-xl px-3 lg:hidden"
                                onClick={() => setSheetOpen(true)}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                                {filterCount > 0 && (
                                    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                                        {filterCount}
                                    </span>
                                )}
                            </Button>

                            <div className="flex items-center gap-2">
                                <Label htmlFor="explore-sort" className="sr-only">
                                    Sort by
                                </Label>
                                <Select value={state.sort} onValueChange={(v) => setParams({ sort: v })}>
                                    <SelectTrigger id="explore-sort" className="h-10 w-[180px] rounded-xl bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="end">
                                        {SORT_OPTIONS.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Label htmlFor="explore-limit" className="sr-only">
                                    Results per page
                                </Label>
                                <Select value={String(state.limit)} onValueChange={(v) => setParams({ limit: v })}>
                                    <SelectTrigger id="explore-limit" className="h-10 w-[110px] rounded-xl bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="end">
                                        {PAGE_SIZES.map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                                {n} / page
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {chips.length > 0 && (
                        <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
                            {chips.map((chip) => (
                                <li key={chip.key}>
                                    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-xs font-medium text-foreground">
                                        {chip.key === 'dates' && <CalendarDays className="h-3.5 w-3.5 text-primary" />}
                                        <span className="truncate">{chip.label}</span>
                                        <button
                                            type="button"
                                            onClick={chip.onRemove}
                                            aria-label={`Remove filter ${chip.label}`}
                                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                </li>
                            ))}
                            <li>
                                <Button variant="link" className="h-auto px-1 text-xs" onClick={clearAll}>
                                    Clear all
                                </Button>
                            </li>
                        </ul>
                    )}

                    {/* Results */}
                    <div className="mt-6">
                        {listQuery.isError ? (
                            <div
                                role="alert"
                                className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-14 text-center"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <h2 className="text-base font-semibold text-foreground">We couldn&apos;t load properties</h2>
                                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                                    {listQuery.error instanceof ApiError
                                        ? listQuery.error.message
                                        : 'Check your connection and try again.'}
                                </p>
                                <Button
                                    className="mt-5 h-10 rounded-xl px-4"
                                    onClick={() => listQuery.refetch()}
                                    disabled={listQuery.isFetching}
                                >
                                    <RefreshCw className={cn('h-4 w-4', listQuery.isFetching && 'animate-spin')} /> Retry
                                </Button>
                            </div>
                        ) : showSkeleton ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <PropertyCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : properties.length === 0 ? (
                            state.page > 1 && total > 0 ? (
                                <EmptyState
                                    icon={SearchX}
                                    title="This page is empty"
                                    description={`There are only ${totalPages} ${totalPages === 1 ? 'page' : 'pages'} of results for these filters.`}
                                    action={
                                        <Button className="h-10 rounded-xl px-4" onClick={() => goToPage(1)}>
                                            Back to first page
                                        </Button>
                                    }
                                />
                            ) : (
                                <EmptyState
                                    icon={SearchX}
                                    title={filterCount > 0 ? 'No homes match your filters' : 'No homes are listed right now'}
                                    description={
                                        filterCount > 0
                                            ? 'Try widening your budget, picking another neighbourhood or removing a filter.'
                                            : 'New listings appear here as soon as landlords publish them. Check back soon.'
                                    }
                                    action={
                                        filterCount > 0 ? (
                                            <Button className="h-10 rounded-xl px-4" onClick={clearAll}>
                                                Clear filters
                                            </Button>
                                        ) : undefined
                                    }
                                />
                            )
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {properties.map((property, i) => (
                                    <PropertyCard key={property.id} property={property} hrefQuery={hrefQuery} priority={i < 4} />
                                ))}
                            </div>
                        )}
                    </div>

                    {!listQuery.isError && totalPages > 1 && (
                        <Pagination
                            className="mt-10"
                            page={Math.min(state.page, totalPages)}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                            disabled={listQuery.isFetching}
                        />
                    )}
                </div>
            </Container>

            {/* Mobile / tablet filters */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full gap-0 sm:max-w-sm">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle className="font-serif text-lg">Filters</SheetTitle>
                        <SheetDescription>Results update as you change filters.</SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">{filterControls('stack')}</div>
                    <SheetFooter className="flex-row gap-2 border-t border-border">
                        <Button
                            variant="outline"
                            className="h-10 flex-1 rounded-xl"
                            onClick={clearAll}
                            disabled={filterCount === 0 && !state.moveIn && !state.moveOut}
                        >
                            Reset
                        </Button>
                        <Button className="h-10 flex-1 rounded-xl" onClick={() => setSheetOpen(false)}>
                            {listQuery.isFetching ? 'Updating…' : `Show ${total.toLocaleString()} ${total === 1 ? 'home' : 'homes'}`}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
