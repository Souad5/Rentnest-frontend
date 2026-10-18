import type { Metadata } from 'next';
import RoleGuard from '@/components/guard/RoleGuard';
import { AdminPropertiesView } from '@/components/dashboard/admin/AdminPropertiesView';

export const metadata: Metadata = { title: 'Properties · Admin' };

export default function AdminPropertiesPage() {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <AdminPropertiesView />
        </RoleGuard>
    );
}
