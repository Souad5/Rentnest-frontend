'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, Building, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, properties: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [usersRes, propsRes] = await Promise.all([
                    adminApi.getUsers(),
                    adminApi.getProperties(),
                ]);

                const userCount = usersRes.data ? usersRes.data.length : 0;
                const propertyList = propsRes.data || [];

                setStats({
                    users: userCount,
                    properties: propertyList.length,
                    pending: propertyList.filter((p: { isAvailable: boolean }) => !p.isAvailable).length,
                });
            } catch (error) {
                console.error('Failed to load admin metrics:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-6 px-4">
            <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'Admin'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.users}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.properties}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.pending}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}