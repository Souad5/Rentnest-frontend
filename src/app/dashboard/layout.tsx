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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navByRole: Record<UserRole, NavItem[]> = {
    TENANT: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'Tenant Portal', href: '/dashboard/tenant', icon: FileCheck2 },
        { label: 'Browse Properties', href: '/properties', icon: Search },
    ],
    LANDLORD: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'Landlord Workspace', href: '/dashboard/landlord', icon: Building2 },
        { label: 'Add New Property', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
        { label: 'Rental Requests', href: '/dashboard/landlord/requests', icon: CheckSquare },
    ],
    ADMIN: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'Admin Center', href: '/dashboard/admin', icon: Shield },
        { label: 'User Management', href: '/dashboard/admin', icon: Users },
    ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [role, setRole] = useState<UserRole>('LANDLORD');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = navByRole[role];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Mobile Top Navbar */}
            <div className="md:hidden flex items-center justify-between border-b border-border bg-card p-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-foreground">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span>RentNest</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={`${mobileMenuOpen ? 'block' : 'hidden'
                    } md:block w-full md:w-64 border-r border-border bg-card p-4 flex flex-col justify-between shrink-0`}
            >
                <div className="space-y-6">
                    {/* Logo */}
                    <Link href="/dashboard" className="hidden md:flex items-center gap-2 px-2 py-1 font-bold text-xl text-foreground">
                        <Building2 className="h-7 w-7 text-primary" />
                        <span>RentNest</span>
                    </Link>

                    {/* User Profile Card */}
                    <div className="rounded-xl border border-border bg-accent/40 p-3 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {role[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate text-foreground">Alex Johnson</p>
                            <Badge variant="secondary" className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {role}
                            </Badge>
                        </div>
                    </div>

                    {/* Dev Role Switcher */}
                    <div className="p-2 bg-muted/60 rounded-xl border border-border space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                            Dev Role Switcher
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                            {(['TENANT', 'LANDLORD', 'ADMIN'] as UserRole[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`text-[10px] py-1 rounded-md font-semibold transition-all ${role === r
                                        ? 'bg-background text-foreground shadow-xs border border-border'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1 pt-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-border space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="hidden md:flex items-center justify-between border-b border-border bg-card px-8 py-4">
                    <div>
                        <h2 className="text-lg font-bold capitalize text-foreground">{role.toLowerCase()} Portal</h2>
                        <p className="text-xs text-muted-foreground">RentNest Rental Property Marketplace</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}