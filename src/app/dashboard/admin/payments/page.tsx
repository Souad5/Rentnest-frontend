import type { Metadata } from 'next';
import RoleGuard from '@/components/guard/RoleGuard';
import { AdminPaymentsView } from '@/components/dashboard/admin/AdminPaymentsView';

export const metadata: Metadata = { title: 'Payments · Admin' };

export default function AdminPaymentsPage() {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <AdminPaymentsView />
        </RoleGuard>
    );
}
