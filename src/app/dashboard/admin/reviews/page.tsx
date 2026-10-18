import type { Metadata } from 'next';
import RoleGuard from '@/components/guard/RoleGuard';
import { AdminReviewsView } from '@/components/dashboard/admin/AdminReviewsView';

export const metadata: Metadata = { title: 'Reviews · Admin' };

export default function AdminReviewsPage() {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <AdminReviewsView />
        </RoleGuard>
    );
}
