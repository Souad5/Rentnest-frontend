import type { Metadata } from 'next';
import RoleGuard from '@/components/guard/RoleGuard';
import { AdminMessagesView } from '@/components/dashboard/admin/AdminMessagesView';

export const metadata: Metadata = { title: 'Messages · Admin' };

export default function AdminMessagesPage() {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <AdminMessagesView />
        </RoleGuard>
    );
}
