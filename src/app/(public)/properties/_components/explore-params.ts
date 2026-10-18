import { isValid, parseISO } from 'date-fns';
import type { PropertyQuery } from '@/types/api';

export type SortValue = NonNullable<PropertyQuery['sort']>;

export const SORT_OPTIONS: ReadonlyArray<{ value: SortValue; label: string }> = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'rating', label: 'Top rated' },
    { value: 'popular', label: 'Most popular' },
    { value: 'oldest', label: 'Oldest' },
];

export const PAGE_SIZES = [12, 24, 48] as const;
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_SORT: SortValue = 'newest';

export const BEDROOM_OPTIONS = [1, 2, 3, 4] as const;
export const RATING_OPTIONS = [3, 4, 4.5] as const;

/** URL params that narrow the result set (used for chips, "Clear all" and the filter badge). */
export const FILTER_KEYS = [
    'search',
    'categoryId',
    'category',
    'location',
    'minPrice',
    'maxPrice',
    'bedrooms',
    'minRating',
] as const;

export interface ExploreState {
    search: string;
    location: string;
    categoryId: string;
    /** Category name (footer links use `?category=Apartment`). */
    category: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    minRating: string;
    sort: SortValue;
    page: number;
    limit: number;
    /** Not filtered on — forwarded to cards so the booking form can prefill dates. */
    moveIn: string;
    moveOut: string;
}

interface ParamsLike {
    get(name: string): string | null;
}

const positiveNumber = (raw: string | null): string => {
    if (!raw) return '';
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? String(n) : '';
};

const isoDay = (raw: string | null): string => {
    if (!raw) return '';
    const d = parseISO(raw);
    return isValid(d) ? raw.slice(0, 10) : '';
};

export function readExploreState(params: ParamsLike): ExploreState {
    const sortRaw = params.get('sort');
    const sort = SORT_OPTIONS.some((o) => o.value === sortRaw) ? (sortRaw as SortValue) : DEFAULT_SORT;

    const pageRaw = Number.parseInt(params.get('page') ?? '', 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

    const limitRaw = Number.parseInt(params.get('limit') ?? '', 10);
    const limit = (PAGE_SIZES as readonly number[]).includes(limitRaw) ? limitRaw : DEFAULT_PAGE_SIZE;

    return {
        search: params.get('search')?.trim() ?? '',
        location: params.get('location')?.trim() ?? '',
        categoryId: params.get('categoryId')?.trim() ?? '',
        category: params.get('category')?.trim() ?? '',
        minPrice: positiveNumber(params.get('minPrice')),
        maxPrice: positiveNumber(params.get('maxPrice')),
        bedrooms: positiveNumber(params.get('bedrooms')),
        minRating: positiveNumber(params.get('minRating')),
        sort,
        page,
        limit,
        moveIn: isoDay(params.get('moveIn')),
        moveOut: isoDay(params.get('moveOut')),
    };
}

/** Everything the API filters/sorts/paginates on — no client-side filtering. */
export function toApiQuery(state: ExploreState): PropertyQuery {
    return {
        search: state.search || undefined,
        location: state.location || undefined,
        categoryId: state.categoryId || undefined,
        // The name filter only applies when no explicit id was chosen.
        category: state.categoryId ? undefined : state.category || undefined,
        minPrice: state.minPrice || undefined,
        maxPrice: state.maxPrice || undefined,
        bedrooms: state.bedrooms || undefined,
        minRating: state.minRating || undefined,
        sort: state.sort,
        page: state.page,
        limit: state.limit,
    };
}

export function activeFilterCount(state: ExploreState): number {
    let count = 0;
    if (state.search) count++;
    if (state.categoryId || state.category) count++;
    if (state.location) count++;
    if (state.minPrice) count++;
    if (state.maxPrice) count++;
    if (state.bedrooms) count++;
    if (state.minRating) count++;
    return count;
}

/** Query string forwarded to property cards so the details page can prefill the booking dates. */
export function datesHrefQuery(state: ExploreState): string | undefined {
    if (!state.moveIn && !state.moveOut) return undefined;
    const qs = new URLSearchParams();
    if (state.moveIn) qs.set('moveIn', state.moveIn);
    if (state.moveOut) qs.set('moveOut', state.moveOut);
    return qs.toString();
}
