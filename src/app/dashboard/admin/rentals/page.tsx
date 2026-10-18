import type { Metadata } from 'next';
import RoleGuard from '@/components/guard/RoleGuard';
import { AdminRentalsView } from '@/components/dashboard/admin/AdminRentalsView';

export const metadata: Metadata = { title: 'Rentals · Admin' };

export default function AdminRentalsPage() {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <AdminRentalsView />
        </RoleGuard>
    );
}
