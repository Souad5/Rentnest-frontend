'use client';

import { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Drops every cached query when the signed-in user changes (logout, or a
 * different account in the same tab) so one user's private data — requests,
 * payments, stats — is never shown to the next one from cache.
 */
function ClearCacheOnUserChange({ client }: { client: QueryClient }) {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const previous = useRef<string | null>(userId);

    useEffect(() => {
        if (previous.current !== null && previous.current !== userId) client.clear();
        previous.current = userId;
    }, [client, userId]);

    return null;
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ClearCacheOnUserChange client={queryClient} />
            {children}
            <Toaster position="top-right" richColors closeButton />
        </QueryClientProvider>
    );
}
