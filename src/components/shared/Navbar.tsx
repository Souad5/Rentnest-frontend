'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/providers/AuthProvider';

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
        { name: 'Properties', href: '/properties', icon: Building2 },
    ];

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold" onClick={closeMobileMenu}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <span>Rent<span className="text-primary">Nest</span></span>
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
                                className={`flex items-center gap-1.5 text-sm font-medium hover:text-primary ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop User Menu / Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative flex items-center gap-2 rounded-full p-1 pr-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={(user as { avatarUrl?: string }).avatarUrl} alt={user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'RN'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{user.name}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/dashboard/${user.role?.toLowerCase() ?? 'tenant'}`}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center gap-2 cursor-pointer">
                                    <LogOut className="h-4 w-4" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
                            <Button asChild size="sm"><Link href="/register">Get Started</Link></Button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Navigation Menu"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background px-4 pb-6 pt-4 space-y-4 animate-in slide-in-from-top-2">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMobileMenu}
                                    className={`flex items-center gap-2 text-sm font-medium p-2 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 border-t border-border">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-2">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={(user as { avatarUrl?: string }).avatarUrl} alt={user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'RN'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="w-full justify-start gap-2" onClick={closeMobileMenu}>
                                    <Link href={`/dashboard/${user.role?.toLowerCase() ?? 'tenant'}`}>
                                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start gap-2"
                                    onClick={() => { closeMobileMenu(); handleLogout(); }}
                                >
                                    <LogOut className="h-4 w-4" /> Log out
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button asChild variant="outline" className="w-full" onClick={closeMobileMenu}>
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild className="w-full" onClick={closeMobileMenu}>
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}