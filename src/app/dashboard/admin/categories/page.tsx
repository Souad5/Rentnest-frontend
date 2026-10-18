import type { Metadata } from 'next';
import RoleGuard from '@/components/guard/RoleGuard';
import { AdminCategoriesView } from '@/components/dashboard/admin/AdminCategoriesView';

export const metadata: Metadata = { title: 'Categories · Admin' };

export default function AdminCategoriesPage() {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <AdminCategoriesView />
        </RoleGuard>
    );
}
