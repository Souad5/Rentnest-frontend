'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Building2,
    Shield,
    User,
    ArrowUpRight,
    Sparkles,
    Home,
    CheckCircle2,
    PlusCircle,
    FileCheck2,
    Users,
    Settings,
    TrendingUp,
    LayoutDashboard,
    Clock,
    ArrowRight,
    Activity,
    CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
    const [role, setRole] = useState<'TENANT' | 'LANDLORD' | 'ADMIN'>('LANDLORD');

    const roleMeta = {
        TENANT: {
            title: 'Tenant Hub',
            subtitle: 'Rent requests, receipts, and saved properties',
            badge: 'Tenant View',
            href: '/dashboard/tenant',
            icon: User,
            stats: [
                { label: 'Active Rental Requests', value: '2', sub: '1 Pending Landlord Approval', status: 'PENDING' },
                { label: 'Saved Favorites', value: '5', sub: 'Updated 2 hours ago', status: 'ACTIVE' },
                { label: 'Total Paid Rent', value: '$2,400', sub: '2 Successful Receipts', status: 'COMPLETED' },
            ],
            quickActions: [
                { label: 'Browse Properties', href: '/properties', icon: Home },
                { label: 'View Request History', href: '/dashboard/tenant', icon: FileCheck2 },
            ],
        },
        LANDLORD: {
            title: 'Landlord Command',
            subtitle: 'Listings, availability, and tenant request approvals',
            badge: 'Landlord View',
            href: '/dashboard/landlord',
            icon: Building2,
            stats: [
                { label: 'Total Properties Listed', value: '4', sub: '3 Available, 1 Occupied', status: 'ACTIVE' },
                { label: 'Incoming Requests', value: '3', sub: 'Requires Landlord Review', status: 'PENDING' },
                { label: 'Monthly Revenue', value: '$4,800', sub: '+12% from last month', status: 'COMPLETED' },
            ],
            quickActions: [
                { label: 'Create Listing', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
                { label: 'Manage Requests', href: '/dashboard/landlord/requests', icon: FileCheck2 },
            ],
        },
        ADMIN: {
            title: 'Admin Control Center',
            subtitle: 'User moderation, platform health, and auditing',
            badge: 'Admin View',
            href: '/dashboard/admin',
            icon: Shield,
            stats: [
                { label: 'Total Platform Users', value: '1,248', sub: '840 Tenants, 408 Landlords', status: 'ACTIVE' },
                { label: 'Properties for Review', value: '12', sub: 'Requires Moderation', status: 'PENDING' },
                { label: 'Platform Uptime', value: '99.9%', sub: 'All API Routes Healthy', status: 'COMPLETED' },
            ],
            quickActions: [
                { label: 'User Directory', href: '/dashboard/admin', icon: Users },
                { label: 'System Settings', href: '/dashboard/admin', icon: Settings },
            ],
        },
    };

    const activeMeta = roleMeta[role];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* SaaS Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20 rounded-full">
                                <Sparkles className="h-3.5 w-3.5" /> RentNest SaaS Engine
                            </Badge>
                            <Badge variant="outline" className="text-xs text-muted-foreground rounded-full">
                                Interactive Portal
                            </Badge>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            Rental Marketplace Control Hub
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                            Seamlessly switch between tenant booking flows, landlord property management, and administrative moderation platforms.
                        </p>
                    </div>

                    {/* SaaS Role Toggle Pills */}
                    <div className="flex items-center bg-muted/80 backdrop-blur-md p-1.5 rounded-2xl border border-border/80 self-start lg:self-auto shadow-inner">
                        <button
                            onClick={() => setRole('TENANT')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${role === 'TENANT'
                                ? 'bg-background text-foreground shadow-xs border border-border/60'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <User className="h-4 w-4" /> Tenant
                        </button>
                        <button
                            onClick={() => setRole('LANDLORD')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${role === 'LANDLORD'
                                ? 'bg-background text-foreground shadow-xs border border-border/60'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Building2 className="h-4 w-4" /> Landlord
                        </button>
                        <button
                            onClick={() => setRole('ADMIN')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${role === 'ADMIN'
                                ? 'bg-background text-foreground shadow-xs border border-border/60'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Shield className="h-4 w-4" /> Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Role Dashboard Display */}
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
                            <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.subtitle}</p>
                        </div>
                    </div>

                    <Button asChild className="gap-2 rounded-xl shadow-xs shrink-0">
                        <Link href={activeMeta.href}>
                            Launch Portal <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Dynamic Metric Cards */}
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

                {/* Quick Actions Shortcuts */}
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

            {/* Role Selection Grid Cards */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" /> Platform Role Portals
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Explore each role&apos;s dedicated portal view and options.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tenant Portal Card */}
                    <Card
                        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${role === 'TENANT' ? 'border-primary ring-2 ring-primary/20 bg-card shadow-md' : 'border-border/80 bg-card/60 hover:bg-card'
                            }`}
                    >
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <User className="h-5 w-5" />
                                </div>
                                {role === 'TENANT' ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1 text-[10px]">
                                        <CheckCircle2 className="h-3 w-3" /> Active Role
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                        Tenant
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-foreground">Tenant Portal</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    Public browsing, rental requests submission, Stripe/SSLCommerz payment flows, and property reviews.
                                </p>
                            </div>
                            <Button asChild variant={role === 'TENANT' ? 'default' : 'outline'} className="w-full gap-2 rounded-xl text-xs font-semibold" size="sm">
                                <Link href="/dashboard/tenant">
                                    Open Tenant Portal <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Landlord Portal Card */}
                    <Card
                        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${role === 'LANDLORD' ? 'border-primary ring-2 ring-primary/20 bg-card shadow-md' : 'border-border/80 bg-card/60 hover:bg-card'
                            }`}
                    >
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                {role === 'LANDLORD' ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1 text-[10px]">
                                        <CheckCircle2 className="h-3 w-3" /> Active Role
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                        Landlord
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-foreground">Landlord Workspace</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    Property CRUD forms with image URL inputs, availability toggles, and incoming request approval/rejection controls.
                                </p>
                            </div>
                            <Button asChild variant={role === 'LANDLORD' ? 'default' : 'outline'} className="w-full gap-2 rounded-xl text-xs font-semibold" size="sm">
                                <Link href="/dashboard/landlord">
                                    Open Landlord Workspace <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Admin Portal Card */}
                    <Card
                        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${role === 'ADMIN' ? 'border-primary ring-2 ring-primary/20 bg-card shadow-md' : 'border-border/80 bg-card/60 hover:bg-card'
                            }`}
                    >
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    <Shield className="h-5 w-5" />
                                </div>
                                {role === 'ADMIN' ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1 text-[10px]">
                                        <CheckCircle2 className="h-3 w-3" /> Active Role
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                        Admin
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-foreground">Admin Command Center</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    Platform health overview metrics, user management tables with ban/unban controls, and content moderation.
                                </p>
                            </div>
                            <Button asChild variant={role === 'ADMIN' ? 'default' : 'outline'} className="w-full gap-2 rounded-xl text-xs font-semibold" size="sm">
                                <Link href="/dashboard/admin">
                                    Open Admin Center <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Activity Timeline Section */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground tracking-tight">Recent Platform Activity</h3>
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
                            <p className="text-xs text-muted-foreground mt-0.5">Tenant John Doe submitted a request for &quot;Skyline Luxury Apartment&quot;.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-foreground">Payment Received</p>
                                <span className="text-[10px] text-muted-foreground">1h ago</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Payment of $1,200 completed via Stripe Checkout for Request #REQ-8821.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}