'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Building2,
    Home,
    Shield,
    Users,
    LogOut,
    Menu,
    X,
    Bell,
    FileCheck2,
    PlusCircle,
    Search,
    CheckSquare,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

const navByRole: Record<UserRole, NavItem[]> = {
    TENANT: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'My Requests', href: '/dashboard/tenant', icon: FileCheck2, badge: '2 Active' },
        { label: 'Browse Properties', href: '/properties', icon: Search },
    ],
    LANDLORD: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'My Listings', href: '/dashboard/landlord', icon: Building2 },
        { label: 'Add New Property', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
        { label: 'Rental Requests', href: '/dashboard/landlord/requests', icon: CheckSquare, badge: '3 New' },
    ],
    ADMIN: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'Moderation Center', href: '/dashboard/admin', icon: Shield },
        { label: 'User Directory', href: '/dashboard/admin/users', icon: Users, badge: '1.2k' },
    ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [role, setRole] = useState<UserRole>('LANDLORD');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = navByRole[role];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans antialiased selection:bg-primary/20">
            {/* Mobile Top Header */}
            <header className="md:hidden flex items-center justify-between border-b border-border/80 bg-card/80 backdrop-blur-md px-4 py-3 sticky top-0 z-50">
                <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-foreground tracking-tight">
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/30">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <span>RentNest</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg">
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </header>

            {/* Sidebar Navigation */}
            <aside
                className={`${mobileMenuOpen ? 'block' : 'hidden'
                    } md:block w-full md:w-72 border-r border-border/60 bg-card/50 backdrop-blur-xl p-5 flex flex-col justify-between shrink-0 z-40`}
            >
                <div className="space-y-6">
                    {/* Logo Header */}
                    <Link href="/dashboard" className="hidden md:flex items-center gap-3 px-2 py-1 font-bold text-xl text-foreground tracking-tight">
                        <div className="h-9 w-9 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/25">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="leading-none">RentNest</span>
                            <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-1">SaaS Portal</span>
                        </div>
                    </Link>

                    {/* User Profile Card */}
                    <div className="rounded-2xl border border-border/80 bg-linear-to-b from-card to-muted/30 p-3.5 flex items-center gap-3 shadow-xs">
                        <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarImage src="/placeholder-avatar.png" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{role[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate text-foreground leading-snug">Alex Johnson</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <Badge variant="secondary" className="text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0 border-0">
                                    {role}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Dev Role Switcher Control */}
                    <div className="p-2.5 bg-muted/40 rounded-2xl border border-border/60 space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-primary" /> Role Switcher
                            </span>
                            <span className="text-[9px] text-muted-foreground/80 font-mono">DEV MODE</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            {(['TENANT', 'LANDLORD', 'ADMIN'] as UserRole[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`text-[10px] py-1.5 rounded-xl font-semibold transition-all duration-200 ${role === r
                                        ? 'bg-background text-foreground shadow-xs border border-border/80'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                        }`}
                                >
                                    {r.slice(0, 4)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1 pt-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                            Navigation
                        </p>
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20'
                                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <Badge
                                            variant="secondary"
                                            className={`text-[10px] px-1.5 py-0 rounded-md font-semibold ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer Actions */}
                <div className="pt-4 border-t border-border/60 space-y-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main App Content Viewport */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="hidden md:flex items-center justify-between border-b border-border/60 bg-card/30 backdrop-blur-md px-8 py-4 sticky top-0 z-30">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>RentNest</span>
                            <ChevronRight className="h-3 w-3" />
                            <span className="capitalize text-foreground font-medium">{role.toLowerCase()} Workspace</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground mt-0.5">Dashboard Overview</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="relative rounded-xl border-border/80 hover:bg-accent">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}