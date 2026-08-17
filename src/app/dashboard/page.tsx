'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Building2,
    Shield,
    User,
    ArrowRight,
    Sparkles,
    Home,
    CheckCircle2,
    PlusCircle,
    FileCheck2,
    Users,
    Settings,
    TrendingUp,
    LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
    const [role, setRole] = useState<'TENANT' | 'LANDLORD' | 'ADMIN'>('TENANT');

    const roleMeta = {
        TENANT: {
            title: 'Tenant Portal',
            description: 'Track applications, view payment history, and leave property reviews.',
            badge: 'Active Role',
            href: '/dashboard/tenant',
            icon: User,
            stats: [
                { label: 'Active Requests', value: '2', sub: '1 Pending Approval' },
                { label: 'Saved Homes', value: '5', sub: 'In Dhaka & Sylhet' },
                { label: 'Total Paid', value: '$2,400', sub: '2 Rent Receipts' },
            ],
            quickActions: [
                { label: 'Explore Properties', href: '/properties', icon: Home },
                { label: 'My Applications', href: '/dashboard/tenant', icon: FileCheck2 },
            ],
        },
        LANDLORD: {
            title: 'Landlord Workspace',
            description: 'Manage property listings, review incoming rental applications, and track earnings.',
            badge: 'Active Role',
            href: '/dashboard/landlord',
            icon: Building2,
            stats: [
                { label: 'Listed Properties', value: '4', sub: '3 Available' },
                { label: 'Pending Requests', value: '3', sub: 'Requires Review' },
                { label: 'Estimated Revenue', value: '$4,800', sub: 'This Month' },
            ],
            quickActions: [
                { label: 'Add New Property', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
                { label: 'Manage Requests', href: '/dashboard/landlord/requests', icon: FileCheck2 },
            ],
        },
        ADMIN: {
            title: 'Admin Command Center',
            description: 'Monitor platform activity, manage user accounts, and oversee content moderation.',
            badge: 'Active Role',
            href: '/dashboard/admin',
            icon: Shield,
            stats: [
                { label: 'Total Users', value: '1,248', sub: '840 Tenants, 408 Landlords' },
                { label: 'Pending Approvals', value: '12', sub: 'Listings for audit' },
                { label: 'Platform Health', value: '99.9%', sub: 'All services active' },
            ],
            quickActions: [
                { label: 'User Management', href: '/dashboard/admin', icon: Users },
                { label: 'System Settings', href: '/dashboard/admin', icon: Settings },
            ],
        },
    };

    const activeMeta = roleMeta[role];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
            {/* Top Banner & Role Switcher */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                                <Sparkles className="h-3.5 w-3.5" /> RentNest Hub
                            </Badge>
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                Role Testing Switcher
                            </Badge>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            Welcome Back to Your Workspace
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-xl">
                            Switch roles using the controller on the right to preview specialized workflows for Tenants, Landlords, and Platform Administrators.
                        </p>
                    </div>

                    {/* Interactive Role Switcher Toggle */}
                    <div className="flex items-center bg-muted/80 backdrop-blur-md p-1.5 rounded-2xl border border-border self-start lg:self-auto shadow-inner">
                        <button
                            onClick={() => setRole('TENANT')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${role === 'TENANT'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <User className="h-4 w-4" /> Tenant
                        </button>
                        <button
                            onClick={() => setRole('LANDLORD')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${role === 'LANDLORD'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Building2 className="h-4 w-4" /> Landlord
                        </button>
                        <button
                            onClick={() => setRole('ADMIN')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${role === 'ADMIN'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Shield className="h-4 w-4" /> Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Featured Overview Banner for Selected Role */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                            <activeMeta.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-foreground">{activeMeta.title}</h2>
                                <Badge className="bg-primary text-primary-foreground text-[10px]">{activeMeta.badge}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.description}</p>
                        </div>
                    </div>

                    <Button asChild className="gap-2 shrink-0">
                        <Link href={activeMeta.href}>
                            Launch Portal <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Dynamic Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activeMeta.stats.map((stat, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-xl p-4 shadow-2xs">
                            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                            <p className="text-[11px] text-muted-foreground/80 mt-0.5 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-emerald-500" /> {stat.sub}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Quick Action Shortcuts */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions:</span>
                    {activeMeta.quickActions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <Button key={idx} asChild variant="outline" size="sm" className="gap-2 bg-card hover:bg-muted text-xs">
                                <Link href={action.href}>
                                    <Icon className="h-3.5 w-3.5" /> {action.label}
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Portal Cards Grid */}
            <div>
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" /> Available Platform Portals
                    </h3>
                    <p className="text-xs text-muted-foreground">Select any portal card below to jump straight to its dashboard.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tenant Card */}
                    <Card
                        className={`relative overflow-hidden border-border transition-all duration-300 hover:shadow-md ${role === 'TENANT' ? 'ring-2 ring-primary bg-card/80' : 'bg-card'
                            }`}
                    >
                        {role === 'TENANT' && (
                            <div className="absolute top-3 right-3 text-emerald-500 flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" /> Selected
                            </div>
                        )}
                        <CardContent className="p-6 space-y-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-foreground">Tenant Portal</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Find rental properties, manage lease agreements, submit rental requests, and complete online payments.
                                </p>
                            </div>
                            <Button asChild variant={role === 'TENANT' ? 'default' : 'outline'} className="w-full gap-2" size="sm">
                                <Link href="/dashboard/tenant">
                                    Open Tenant Portal <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Landlord Card */}
                    <Card
                        className={`relative overflow-hidden border-border transition-all duration-300 hover:shadow-md ${role === 'LANDLORD' ? 'ring-2 ring-primary bg-card/80' : 'bg-card'
                            }`}
                    >
                        {role === 'LANDLORD' && (
                            <div className="absolute top-3 right-3 text-emerald-500 flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" /> Selected
                            </div>
                        )}
                        <CardContent className="p-6 space-y-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-foreground">Landlord Workspace</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Create and manage property listings, review applicant details, approve or reject rental requests.
                                </p>
                            </div>
                            <Button asChild variant={role === 'LANDLORD' ? 'default' : 'outline'} className="w-full gap-2" size="sm">
                                <Link href="/dashboard/landlord">
                                    Open Landlord Portal <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Admin Card */}
                    <Card
                        className={`relative overflow-hidden border-border transition-all duration-300 hover:shadow-md ${role === 'ADMIN' ? 'ring-2 ring-primary bg-card/80' : 'bg-card'
                            }`}
                    >
                        {role === 'ADMIN' && (
                            <div className="absolute top-3 right-3 text-emerald-500 flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" /> Selected
                            </div>
                        )}
                        <CardContent className="p-6 space-y-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-foreground">Admin Command Center</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Oversee all registered platform users, execute ban/unban moderation actions, and audit content.
                                </p>
                            </div>
                            <Button asChild variant={role === 'ADMIN' ? 'default' : 'outline'} className="w-full gap-2" size="sm">
                                <Link href="/dashboard/admin">
                                    Open Admin Portal <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}