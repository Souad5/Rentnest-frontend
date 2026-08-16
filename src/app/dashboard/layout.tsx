'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Building2,
    Home,
    KeyRound,
    Shield,
    CreditCard,
    Wrench,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock user role - swap with actual auth session context
type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const navByRole: Record<UserRole, Array<{ label: string; href: string; icon: any }>> = {
    TENANT: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'My Rentals', href: '/dashboard/tenant/rentals', icon: KeyRound },
        { label: 'Payments', href: '/dashboard/tenant/payments', icon: CreditCard },
        { label: 'Maintenance Requests', href: '/dashboard/tenant/maintenance', icon: Wrench },
    ],
    LANDLORD: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'Properties', href: '/dashboard/landlord/properties', icon: Building2 },
        { label: 'Tenants & Leases', href: '/dashboard/landlord/tenants', icon: Users },
        { label: 'Payments & Revenue', href: '/dashboard/landlord/payments', icon: CreditCard },
        { label: 'Maintenance Queue', href: '/dashboard/landlord/maintenance', icon: Wrench },
    ],
    ADMIN: [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'All Properties', href: '/dashboard/admin/properties', icon: Building2 },
        { label: 'User Management', href: '/dashboard/admin/users', icon: Users },
        { label: 'System Logs', href: '/dashboard/admin/logs', icon: Shield },
        { label: 'Global Settings', href: '/dashboard/admin/settings', icon: Settings },
    ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [role] = useState<UserRole>('TENANT'); // Swap with your auth hook (e.g. useSession())
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
                    <div className="hidden md:flex items-center gap-2 px-2 py-1 font-bold text-xl text-foreground">
                        <Building2 className="h-7 w-7 text-primary" />
                        <span>RentNest</span>
                    </div>

                    {/* User Badge */}
                    <div className="rounded-xl border border-border bg-accent/40 p-3 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                            {role[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate text-foreground">Alex Johnson</p>
                            <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {role}
                            </span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground'
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
                    <h2 className="text-lg font-semibold capitalize text-foreground">{role.toLowerCase()} Portal</h2>
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