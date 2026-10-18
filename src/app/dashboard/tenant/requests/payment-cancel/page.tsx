import { redirect } from 'next/navigation';

interface LegacyPaymentCancelProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Legacy return URL: forward to the shared cancel page, keeping the request id.
export default async function LegacyPaymentCancelPage({ searchParams }: LegacyPaymentCancelProps) {
    const params = await searchParams;
    const raw = params.requestId ?? params.request;
    const requestId = Array.isArray(raw) ? raw[0] : raw;
    redirect(requestId ? `/payment/cancel?request=${encodeURIComponent(requestId)}` : '/payment/cancel');
}
