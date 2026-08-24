'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Users,
    Building,
    ShieldCheck,
    Loader2,
    TrendingUp,
    Activity,
    ArrowUpRight,
    RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { adminApi } from '@/lib/api';
import { AppButton } from '@/components/shared/AppButton';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, properties: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
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
    }, []);

    useEffect(() => {
        // Wait for an authenticated admin session; fetching earlier sends the
        // request without a Bearer token and the backend rejects it.
        if (user?.role !== 'ADMIN') return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStats();
    }, [user, fetchStats]);

    // Mock analytical data for visual presentation
    const barData = [
        { month: 'Jan', active: 40, pending: 12 },
        { month: 'Feb', active: 65, pending: 18 },
        { month: 'Mar', active: 80, pending: 10 },
        { month: 'Apr', active: 95, pending: 22 },
        { month: 'May', active: 110, pending: 15 },
        { month: 'Jun', active: stats.properties || 120, pending: stats.pending || 8 },
    ];

    const pieData = [
        { name: 'Active', value: Math.max(stats.properties - stats.pending, 1) },
        { name: 'Pending', value: Math.max(stats.pending, 1) },
    ];

    const PIE_COLORS = ['hsl(var(--foreground))', 'hsl(var(--muted-foreground) / 0.3)'];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Welcome back, <span className="text-foreground font-medium">{user?.name || 'Admin'}</span>
                    </p>
                </div>

                <AppButton
                    variant="outline"
                    size="sm"
                    onClick={fetchStats}
                    disabled={loading}
                    className="h-9 px-3 gap-2 shrink-0 self-start sm:self-center"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </AppButton>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border border-border bg-card shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stats.users}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500" /> +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Listings
                        </CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stats.properties}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Activity className="h-3 w-3 text-foreground" /> Active directory items
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Pending Approvals
                        </CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stats.pending}
                        </div>
                        <p className="text-[11px] text-muted-foreground">Requires admin action</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Section: Bar Chart + Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Bar Chart Container */}
                <Card className="lg:col-span-2 border border-border bg-card shadow-2xs">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
                            <span>Listing Overview</span>
                            <span className="text-xs text-muted-foreground font-normal">Jan - Jun</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-55 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            color: 'hsl(var(--foreground))',
                                        }}
                                    />
                                    <Bar dataKey="active" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="pending" fill="hsl(var(--muted-foreground) / 0.2)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart Container */}
                <Card className="border border-border bg-card shadow-2xs">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground">
                            Approval Ratio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-2">
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-foreground" />
                                <span>Active ({stats.properties - stats.pending})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                <span>Pending ({stats.pending})</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity List */}
            <Card className="border border-border bg-card shadow-2xs">
                <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
                        <span>Recent Activity Log</span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border p-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted text-foreground">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">System Audit Completed</p>
                                <p className="text-xs text-muted-foreground">User privileges and account checks updated</p>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">Just now</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted text-foreground">
                                <Building className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Listings Queue Refreshed</p>
                                <p className="text-xs text-muted-foreground">Synchronized pending approval items</p>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">10m ago</span>
                    </motion.div>
                </CardContent>
            </Card>
        </div>
    );
}