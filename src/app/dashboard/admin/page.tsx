import type { Metadata } from 'next';
import RoleGuard from '@/components/guard/RoleGuard';
import { AdminOverviewView } from '@/components/dashboard/admin/AdminOverviewView';

export const metadata: Metadata = { title: 'Admin overview' };

export default function AdminDashboardPage() {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <AdminOverviewView />
        </RoleGuard>
    );
}
