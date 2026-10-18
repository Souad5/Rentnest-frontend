'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { dashboardHomeFor } from '@/config/site';

/** /dashboard has no content of its own: send each role to its home. */
export default function DashboardIndexPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) router.replace(dashboardHomeFor(user.role));
    }, [isLoading, user, router]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" role="status">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Opening your dashboard…</p>
        </div>
    );
}
