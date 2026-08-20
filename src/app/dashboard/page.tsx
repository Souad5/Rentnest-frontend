'use client';

import Link from 'next/link';
import {
    Building2,
    Shield,
    User as UserIcon,
    ArrowUpRight,
    Sparkles,
    Home,
    PlusCircle,
    FileCheck2,
    Users,
    Settings,
    TrendingUp,
    Clock,
    Activity,
    CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth, UserRole } from '@/providers/AuthProvider';

export default function DashboardPage() {
    const { user } = useAuth();
    const role: UserRole = user?.role || 'TENANT';

    const roleMeta = {
        TENANT: {
            title: 'Tenant Hub',
            subtitle: 'Track your rental applications, payment history, and saved properties.',
            badge: 'Tenant Workspace',
            href: '/dashboard/tenant',
            icon: UserIcon,
            stats: [
                { label: 'Active Rental Requests', value: '2', sub: '1 Pending Approval', status: 'PENDING' },
                { label: 'Saved Favorites', value: '5', sub: 'Updated recently', status: 'ACTIVE' },
                { label: 'Total Paid Rent', value: '$2,400', sub: '2 Successful Receipts', status: 'COMPLETED' },
            ],
            quickActions: [
                { label: 'Browse Properties', href: '/properties', icon: Home },
                { label: 'My Rental Requests', href: '/dashboard/tenant', icon: FileCheck2 },
            ],
        },
        LANDLORD: {
            title: 'Landlord Command',
            subtitle: 'Manage property listings, toggle availability, and review tenant applications.',
            badge: 'Landlord Workspace',
            href: '/dashboard/landlord',
            icon: Building2,
            stats: [
                { label: 'Properties Listed', value: '3', sub: 'Filtered by Landlord ID', status: 'ACTIVE' },
                { label: 'Incoming Requests', value: '3', sub: 'Requires Review', status: 'PENDING' },
                { label: 'Monthly Earnings', value: '$4,800', sub: '+12% from last month', status: 'COMPLETED' },
            ],
            quickActions: [
                { label: 'Add Property Listing', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
                { label: 'Manage Requests', href: '/dashboard/landlord/requests', icon: FileCheck2 },
            ],
        },
        ADMIN: {
            title: 'Admin Moderation Center',
            subtitle: 'Oversee system metrics, moderate user accounts, and review pending listings.',
            badge: 'Admin Workspace',
            href: '/dashboard/admin',
            icon: Shield,
            stats: [
                { label: 'Platform Users', value: '1,248', sub: 'Active Tenants & Landlords', status: 'ACTIVE' },
                { label: 'Properties for Review', value: '12', sub: 'Moderation Queue', status: 'PENDING' },
                { label: 'Platform Uptime', value: '99.9%', sub: 'API Services Healthy', status: 'COMPLETED' },
            ],
            quickActions: [
                { label: 'User Directory', href: '/dashboard/admin/users', icon: Users },
                { label: 'System Settings', href: '/dashboard/admin', icon: Settings },
            ],
        },
    };

    const activeMeta = roleMeta[role];

    return (
        <div className="space-y-8">
            {/* SaaS Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20 rounded-full">
                                <Sparkles className="h-3.5 w-3.5" /> RentNest Portal
                            </Badge>
                            <Badge variant="outline" className="text-xs text-muted-foreground rounded-full">
                                {role} Session
                            </Badge>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            Welcome back, {user?.name || 'User'}!
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                            {activeMeta.subtitle}
                        </p>
                    </div>

                    <Button asChild className="gap-2 rounded-xl shadow-xs shrink-0 self-start lg:self-auto">
                        <Link href={activeMeta.href}>
                            Open {role.charAt(0) + role.slice(1).toLowerCase()} Portal <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Active Role Card */}
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                            <activeMeta.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">{activeMeta.title}</h2>
                                <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-md">{activeMeta.badge}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activeMeta.stats.map((stat, idx) => (
                        <div key={idx} className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                                {stat.status === 'PENDING' && (
                                    <span className="flex h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
                                )}
                                {stat.status === 'ACTIVE' && (
                                    <span className="flex h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                                )}
                                {stat.status === 'COMPLETED' && (
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                                )}
                            </div>
                            <p className="text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium pt-1">
                                <TrendingUp className="h-3 w-3 text-emerald-500" /> {stat.sub}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Actions:</span>
                    {activeMeta.quickActions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <Button key={idx} asChild variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent text-xs rounded-xl border-border/80">
                                <Link href={action.href}>
                                    <Icon className="h-3.5 w-3.5 text-primary" /> {action.label}
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Platform Activity Feed */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground tracking-tight">Recent Activity</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Live Feed</Badge>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-foreground">Rental Request Submitted</p>
                                <span className="text-[10px] text-muted-foreground">10m ago</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">A tenant requested a viewing for your listed apartment.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-foreground">Payment Processed</p>
                                <span className="text-[10px] text-muted-foreground">1h ago</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Rent payment confirmed and receipt issued.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}