'use client';

import { useState } from 'react';
import TenantDashboard from './tenant/TenantDashboard';
import LandlordDashboard from './landlord/LandlordDashboard';
import AdminDashboard from './admin/AdminDashboard';

export default function DashboardPage() {
    // In practice, derive this role from your Session / Auth context
    const [role] = useState<'TENANT' | 'LANDLORD' | 'ADMIN'>('TENANT');

    if (role === 'LANDLORD') return <LandlordDashboard />;
    if (role === 'ADMIN') return <AdminDashboard />;
    return <TenantDashboard />;
}