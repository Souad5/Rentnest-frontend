'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';

interface AsyncState<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
}

/**
 * Runs an async loader on mount and exposes loading / error / data plus a
 * `retry` callback. The loader is read from a ref, so callers can pass an
 * inline arrow function without re-triggering the request every render.
 */
export function useAsync<T>(loader: () => Promise<T>) {
    const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });
    const [attempt, setAttempt] = useState(0);
    const loaderRef = useRef(loader);

    useEffect(() => {
        loaderRef.current = loader;
    });

    useEffect(() => {
        let active = true;
        loaderRef.current().then(
            (data) => {
                if (active) setState({ data, error: null, loading: false });
            },
            (err: unknown) => {
                if (!active) return;
                const message =
                    err instanceof ApiError
                        ? err.message
                        : 'We could not reach RentNest right now. Check your connection and try again.';
                setState({ data: null, error: message, loading: false });
            },
        );
        return () => {
            active = false;
        };
    }, [attempt]);

    const retry = useCallback(() => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        setAttempt((n) => n + 1);
    }, []);

    return { ...state, retry };
}
