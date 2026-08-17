'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/providers/AuthProvider';
import { AppDropdown } from './AppDropdown';
import { AppButton } from './AppButton';

interface NavbarProps {
    user?: ReturnType<typeof useAuth>['user'];
    onLogout?: () => void;
}

export default function Navbar({ user: propUser, onLogout: propOnLogout }: NavbarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fallback to AuthProvider state if props are not explicitly passed
    const authContext = useAuth();
    const user = propUser !== undefined ? propUser : authContext.user;
    const handleLogout = propOnLogout || authContext.logout;

    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Rentals & Properties', href: '/properties', icon: Building2 },
    ];

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-[#f4f3f0] backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-2 text-xl font-bold" onClick={closeMobileMenu}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#181818] text-white shadow-sm">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <span className="font-serif tracking-tight text-[#1c1d1d]">
                        Rent<span className="font-sans font-extrabold text-neutral-600">Nest</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold transition-colors ${isActive ? 'text-[#1c1d1d]' : 'text-neutral-500 hover:text-neutral-900'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop User Menu / Auth Buttons using AppButton */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <AppDropdown
                            label={user.email}
                            trigger={
                                <AppButton
                                    variant="ghost"
                                    className="relative flex items-center gap-2 rounded-full p-1 pr-3 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={(user as { avatarUrl?: string }).avatarUrl}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="bg-[#181818] text-white font-bold text-xs">
                                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'RN'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-semibold text-neutral-800">
                                        {user.name}
                                    </span>
                                </AppButton>
                            }
                            items={[
                                {
                                    label: 'Dashboard',
                                    href: `/dashboard/${user.role?.toLowerCase() ?? 'tenant'}`,
                                    icon: <LayoutDashboard className="h-4 w-4" />,
                                },
                                {
                                    separator: true,
                                },
                                {
                                    label: 'Log out',
                                    onClick: handleLogout,
                                    icon: <LogOut className="h-4 w-4" />,
                                    destructive: true,
                                },
                            ]}
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <AppButton asChild variant="ghost" size="sm" className="text-xs font-semibold">
                                <Link href="/login">Log in</Link>
                            </AppButton>

                            <AppButton asChild size="sm" className="bg-[#1c1d1d] hover:bg-black text-white rounded-full text-xs font-semibold px-4">
                                <Link href="/register">List Property / Register</Link>
                            </AppButton>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle Button using AppButton */}
                <AppButton
                    variant="ghost"
                    size="icon"
                    className="md:hidden p-0 w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Navigation Menu"
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </AppButton>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-neutral-200 bg-white px-4 pb-6 pt-4 space-y-4 animate-in slide-in-from-top-2">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMobileMenu}
                                    className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider p-2.5 rounded-xl transition-colors ${isActive ? 'bg-neutral-100 text-[#1c1d1d]' : 'text-neutral-500 hover:bg-neutral-50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 border-t border-neutral-200">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-2">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={(user as { avatarUrl?: string }).avatarUrl} alt={user.name} />
                                        <AvatarFallback className="bg-[#181818] text-white font-bold text-xs">
                                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'RN'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-neutral-900">{user.name}</span>
                                        <span className="text-[11px] text-neutral-500">{user.email}</span>
                                    </div>
                                </div>

                                <AppButton asChild variant="outline" className="w-full justify-start gap-2 rounded-xl text-xs font-semibold" onClick={closeMobileMenu}>
                                    <Link href={`/dashboard/${user.role?.toLowerCase() ?? 'tenant'}`}>
                                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                                    </Link>
                                </AppButton>

                                <AppButton
                                    variant="destructive"
                                    className="w-full justify-start gap-2 rounded-xl text-xs font-semibold"
                                    onClick={() => { closeMobileMenu(); handleLogout(); }}
                                >
                                    <LogOut className="h-4 w-4" /> Log out
                                </AppButton>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <AppButton asChild variant="outline" className="w-full rounded-full text-xs font-semibold" onClick={closeMobileMenu}>
                                    <Link href="/login">Log in</Link>
                                </AppButton>
                                <AppButton asChild className="w-full bg-[#1c1d1d] hover:bg-black text-white rounded-full text-xs font-semibold" onClick={closeMobileMenu}>
                                    <Link href="/register">List Property / Register</Link>
                                </AppButton>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}