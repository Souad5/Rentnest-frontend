'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { ApiError } from '@/lib/api';
import type { ApiEnvelope } from '@/types/api';

/** Query keys for every admin resource, so pages can share and patch caches. */
export const adminKeys = {
    stats: ['admin', 'stats'] as const,
    users: ['admin', 'users'] as const,
    properties: ['admin', 'properties'] as const,
    rentals: ['admin', 'rentals'] as const,
    payments: ['admin', 'payments'] as const,
    categories: ['admin', 'categories'] as const,
    reviews: ['admin', 'reviews'] as const,
    messages: ['admin', 'messages'] as const,
    subscribers: ['admin', 'subscribers'] as const,
};

/**
 * Fetches an admin list/resource and unwraps the API envelope.
 * Pages render inside RoleGuard, so a token is always present when this runs.
 */
export function useAdminQuery<T>(key: readonly string[], fetcher: () => Promise<ApiEnvelope<T>>) {
    return useQuery({
        queryKey: key,
        queryFn: async () => (await fetcher()).data,
        staleTime: 30_000,
    });
}

/** Helpers for optimistic list updates on a cached admin array. */
export function useAdminCache<T extends { id: string }>(key: readonly string[]) {
    const queryClient = useQueryClient();

    const snapshot = useCallback(() => queryClient.getQueryData<T[]>(key), [queryClient, key]);

    const restore = useCallback(
        (previous: T[] | undefined) => {
            if (previous) queryClient.setQueryData<T[]>(key, previous);
        },
        [queryClient, key],
    );

    const patch = useCallback(
        (id: string, changes: Partial<T>) => {
            queryClient.setQueryData<T[]>(key, (old) => old?.map((item) => (item.id === id ? { ...item, ...changes } : item)));
        },
        [queryClient, key],
    );

    const remove = useCallback(
        (id: string) => {
            queryClient.setQueryData<T[]>(key, (old) => old?.filter((item) => item.id !== id));
        },
        [queryClient, key],
    );

    const upsert = useCallback(
        (item: T) => {
            queryClient.setQueryData<T[]>(key, (old) => {
                if (!old) return [item];
                return old.some((x) => x.id === item.id) ? old.map((x) => (x.id === item.id ? { ...x, ...item } : x)) : [item, ...old];
            });
        },
        [queryClient, key],
    );

    /**
     * Overview numbers depend on every list, so stats are always refreshed after a change;
     * pass other keys whose data the change affects (e.g. cascaded deletes).
     */
    const invalidateStats = useCallback(
        (...related: ReadonlyArray<readonly string[]>) => {
            for (const queryKey of [adminKeys.stats, ...related]) {
                void queryClient.invalidateQueries({ queryKey });
            }
        },
        [queryClient],
    );

    return useMemo(
        () => ({ snapshot, restore, patch, remove, upsert, invalidateStats }),
        [snapshot, restore, patch, remove, upsert, invalidateStats],
    );
}

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
    if (error instanceof ApiError || error instanceof Error) return error.message || fallback;
    return fallback;
}
