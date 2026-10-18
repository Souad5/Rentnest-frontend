import type { Metadata } from 'next';
import RoleGuard from '@/components/guard/RoleGuard';
import { AdminUsersView } from '@/components/dashboard/admin/AdminUsersView';

export const metadata: Metadata = { title: 'Users · Admin' };

export default function AdminUsersPage() {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <AdminUsersView />
        </RoleGuard>
    );
}
