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
    // FileCheck2,
    PlusCircle,
    Search,
    CheckSquare,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, UserRole } from '@/providers/AuthProvider';
import { AppButton } from '@/components/shared/AppButton';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navByRole: Record<UserRole, NavItem[]> = {
    TENANT: [
        { label: 'Overview', href: '/dashboard/tenant', icon: Home },
        // { label: 'My Requests', href: '/dashboard/tenant/requests', icon: FileCheck2 },
        { label: 'Browse Properties', href: '/properties', icon: Search },
    ],
    LANDLORD: [
        { label: 'Overview', href: '/dashboard/landlord', icon: Home },
        { label: 'My Listings', href: '/dashboard/landlord/properties', icon: Building2 },
        { label: 'Add New Property', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
        { label: 'Rental Requests', href: '/dashboard/landlord/requests', icon: CheckSquare },
    ],
    ADMIN: [
        { label: 'Overview', href: '/dashboard/admin', icon: Home },
        { label: 'Moderation Center', href: '/dashboard/admin/moderation', icon: Shield },
        { label: 'User Directory', href: '/dashboard/admin/users', icon: Users },
    ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout, isLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const activeRole: UserRole = user?.role || 'TENANT';
    const navigation = navByRole[activeRole] || navByRole.TENANT;

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans antialiased">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between border-b border-border/80 bg-card/80 backdrop-blur-md px-4 py-3 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-foreground">
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <span>RentNest</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </header>

            {/* Sidebar Navigation */}
            <aside
                className={`${mobileMenuOpen ? 'block' : 'hidden'
                    } md:block w-full md:w-72 border-r border-border/60 bg-card/50 backdrop-blur-xl p-5 flex flex-col justify-between shrink-0 z-40`}
            >
                <div className="space-y-6">
                    {/* Logo */}
                    <Link href="/" className="hidden md:flex items-center gap-3 px-2 py-1 font-bold text-xl text-foreground">
                        <div className="h-9 w-9 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="leading-none">RentNest</span>
                            <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-1">
                                {activeRole} Portal
                            </span>
                        </div>
                    </Link>

                    {/* Authenticated User Card */}
                    <div className="rounded-2xl border border-border/80 bg-card p-3.5 flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {user?.name?.[0] || activeRole[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate text-foreground">
                                {user?.name || 'User Account'}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-0 border-0">
                                    {activeRole}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Role-filtered Nav Links */}
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
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sign Out Button */}
                <div className="pt-4 border-t border-border/60">
                    <AppButton
                        variant="ghost"
                        onClick={logout}
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </AppButton>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="hidden md:flex items-center justify-between border-b border-border/60 bg-card/30 backdrop-blur-md px-8 py-4 sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>RentNest</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="capitalize text-foreground font-medium">{activeRole.toLowerCase()} Workspace</span>
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl border-border/80">
                        <Bell className="h-4 w-4" />
                    </Button>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}