// src/app/dashboard/tenant/page.tsx
import { redirect } from 'next/navigation';

interface TenantOverviewPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// The tenant overview now lives at /dashboard/tenant/requests; keep this
// route as a redirect so legacy links (post-login, checkout return URLs,
// payment pages) still land on the rental requests table. The query string
// is forwarded so flags like ?payment=success survive the hop.
export default async function TenantDashboardPage({ searchParams }: TenantOverviewPageProps) {
    const params = await searchParams;
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
            query.set(key, value);
        } else if (Array.isArray(value) && typeof value[0] === 'string') {
            query.set(key, value[0]);
        }
    }

    const queryString = query.toString();
    redirect(
        queryString
            ? `/dashboard/tenant/requests?${queryString}`
            : '/dashboard/tenant/requests'
    );
}
