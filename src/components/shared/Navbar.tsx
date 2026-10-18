'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutDashboard, LifeBuoy, LogOut, Menu, ScrollText, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/providers/AuthProvider';
import { dashboardHomeFor, siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Container } from './Container';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

const resourceLinks = [
    { label: 'Help center', href: '/help', icon: LifeBuoy, description: 'FAQs and support' },
    { label: 'Privacy policy', href: '/privacy', icon: ShieldCheck, description: 'How we protect your data' },
    { label: 'Terms of service', href: '/terms', icon: ScrollText, description: 'Rules for using RentNest' },
];

const roleShortcut = {
    TENANT: { label: 'My Requests', href: '/dashboard/tenant/requests' },
    LANDLORD: { label: 'My Listings', href: '/dashboard/landlord/properties' },
    ADMIN: { label: 'Admin', href: '/dashboard/admin/users' },
} as const;

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    // 5 public routes; signed-in users also get Dashboard + a role shortcut (7).
    const links = [
        ...siteConfig.mainNav,
        ...(user
            ? [{ label: 'Dashboard', href: dashboardHomeFor(user.role) }, roleShortcut[user.role]]
            : []),
    ];

    const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
            <Container className="flex h-16 items-center justify-between gap-4">
                <Logo />

                <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                                isActive(link.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Resources <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-1.5">
                            {resourceLinks.map(({ label, href, icon: Icon, description }) => (
                                <DropdownMenuItem key={href} asChild className="cursor-pointer items-start gap-3 rounded-lg p-2.5">
                                    <Link href={href}>
                                        <Icon className="mt-0.5 h-4 w-4 text-primary" />
                                        <span>
                                            <span className="block text-sm font-medium text-foreground">{label}</span>
                                            <span className="block text-xs text-muted-foreground">{description}</span>
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="cursor-pointer gap-3 rounded-lg p-2.5">
                                <Link href="/properties?sort=popular">
                                    <TrendingUp className="h-4 w-4 text-highlight" />
                                    <span className="text-sm font-medium">Trending homes</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {user ? (
                        <UserMenu />
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Button asChild variant="ghost" size="sm" className="rounded-xl">
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild size="sm" className="rounded-xl">
                                <Link href="/register">Get started</Link>
                            </Button>
                        </div>
                    )}

                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-xl lg:hidden" aria-label="Open navigation menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto">
                            <SheetHeader className="border-b border-border">
                                <SheetTitle asChild>
                                    <div>
                                        <Logo onClick={() => setMobileOpen(false)} />
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                                            isActive(link.href) ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted',
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <p className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
                                {resourceLinks.map(({ label, href, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                                    >
                                        <Icon className="h-4 w-4 text-primary" /> {label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                                {user ? (
                                    <>
                                        <Button asChild variant="outline" className="justify-start gap-2 rounded-xl" onClick={() => setMobileOpen(false)}>
                                            <Link href={dashboardHomeFor(user.role)}>
                                                <LayoutDashboard className="h-4 w-4" /> Dashboard
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="justify-start gap-2 rounded-xl"
                                            onClick={() => {
                                                setMobileOpen(false);
                                                logout();
                                            }}
                                        >
                                            <LogOut className="h-4 w-4" /> Log out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button asChild variant="outline" className="rounded-xl" onClick={() => setMobileOpen(false)}>
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                        <Button asChild className="rounded-xl" onClick={() => setMobileOpen(false)}>
                                            <Link href="/register">Get started</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </Container>
        </header>
    );
}

export { Navbar };
