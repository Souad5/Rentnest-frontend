import { redirect } from 'next/navigation';

// Legacy return URL: the requests page shows the post-payment confirmation.
export default function LegacyPaymentSuccessPage() {
    redirect('/dashboard/tenant/requests?payment=success');
}
