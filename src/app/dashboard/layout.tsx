'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    BarChart3,
    Building2,
    ChevronRight,
    ClipboardList,
    CreditCard,
    Home,
    Inbox,
    LayoutDashboard,
    Loader2,
    LogOut,
    type LucideIcon,
    Mail,
    PlusCircle,
    RefreshCw,
    Search,
    Shield,
    Star,
    Tags,
    UserRound,
    Users,
    Wallet,
    WifiOff,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { UserMenu } from '@/components/shared/UserMenu';
import RoleGuard from '@/components/guard/RoleGuard';
import { useAuth, type User, type UserRole } from '@/providers/AuthProvider';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const PROFILE_ITEM: NavItem = { label: 'Profile', href: '/dashboard/profile', icon: UserRound };

/** Role-based sidebar navigation. Also drives the top-bar page title. */
const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
    TENANT: [
        {
            label: 'Renting',
            items: [
                { label: 'Overview', href: '/dashboard/tenant', icon: LayoutDashboard },
                { label: 'My Requests', href: '/dashboard/tenant/requests', icon: ClipboardList },
                { label: 'Payments', href: '/dashboard/tenant/payments', icon: CreditCard },
                { label: 'My Reviews', href: '/dashboard/tenant/reviews', icon: Star },
            ],
        },
        {
            label: 'Account',
            items: [PROFILE_ITEM, { label: 'Browse Homes', href: '/properties', icon: Search }],
        },
    ],
    LANDLORD: [
        {
            label: 'Portfolio',
            items: [
                { label: 'Overview', href: '/dashboard/landlord', icon: LayoutDashboard },
                { label: 'My Listings', href: '/dashboard/landlord/properties', icon: Building2 },
                { label: 'Add Property', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
            ],
        },
        {
            label: 'Business',
            items: [
                { label: 'Rental Requests', href: '/dashboard/landlord/requests', icon: Inbox },
                { label: 'Earnings', href: '/dashboard/landlord/earnings', icon: Wallet },
            ],
        },
        { label: 'Account', items: [PROFILE_ITEM] },
    ],
    ADMIN: [
        {
            label: 'Platform',
            items: [
                { label: 'Overview', href: '/dashboard/admin', icon: BarChart3 },
                { label: 'Users', href: '/dashboard/admin/users', icon: Users },
                { label: 'Properties', href: '/dashboard/admin/moderation', icon: Shield },
                { label: 'Categories', href: '/dashboard/admin/categories', icon: Tags },
            ],
        },
        {
            label: 'Transactions',
            items: [
                { label: 'Rentals', href: '/dashboard/admin/rentals', icon: ClipboardList },
                { label: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard },
            ],
        },
        {
            label: 'Community',
            items: [
                { label: 'Reviews', href: '/dashboard/admin/reviews', icon: Star },
                { label: 'Messages', href: '/dashboard/admin/messages', icon: Mail },
            ],
        },
        { label: 'Account', items: [PROFILE_ITEM] },
    ],
};

/** Extra titles for routes that are not sidebar entries. */
const EXTRA_TITLES: Array<{ pattern: RegExp; title: string; parent?: NavItem }> = [
    {
        pattern: /^\/dashboard\/landlord\/properties\/[^/]+\/edit$/,
        title: 'Edit Property',
        parent: { label: 'My Listings', href: '/dashboard/landlord/properties', icon: Building2 },
    },
    {
        pattern: /^\/dashboard\/tenant\/requests\/[^/]+\/pay$/,
        title: 'Checkout',
        parent: { label: 'My Requests', href: '/dashboard/tenant/requests', icon: ClipboardList },
    },
];

const ROLE_HOME: Record<UserRole, string> = {
    TENANT: '/dashboard/tenant',
    LANDLORD: '/dashboard/landlord',
    ADMIN: '/dashboard/admin',
};

function allItems(role: UserRole): NavItem[] {
    return NAV_BY_ROLE[role].flatMap((group) => group.items);
}

/** Longest matching nav href wins, so /landlord/properties/new beats /landlord/properties. */
function findActiveHref(pathname: string, role: UserRole): string | null {
    let best: string | null = null;
    for (const item of allItems(role)) {
        const isRoleHome = item.href === ROLE_HOME[role];
        const matches = isRoleHome
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        if (matches && (!best || item.href.length > best.length)) best = item.href;
    }
    return best;
}

function getBreadcrumb(pathname: string, role: UserRole) {
    const extra = EXTRA_TITLES.find((entry) => entry.pattern.test(pathname));
    if (extra) return { parent: extra.parent, title: extra.title };
    const activeHref = findActiveHref(pathname, role);
    const item = allItems(role).find((i) => i.href === activeHref);
    return { parent: undefined, title: item?.label ?? 'Dashboard' };
}

/** Which roles may view a section of the dashboard. */
function allowedRolesFor(pathname: string): UserRole[] | null {
    if (pathname.startsWith('/dashboard/admin')) return ['ADMIN'];
    if (pathname.startsWith('/dashboard/landlord')) return ['LANDLORD', 'ADMIN'];
    if (pathname.startsWith('/dashboard/tenant')) return ['TENANT'];
    return null;
}

function UserSummary({ user }: { user: User }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-card p-2.5 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
            <Avatar className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                    {initials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {user.role.toLowerCase()}
                </span>
            </div>
        </div>
    );
}

function DashboardSidebar({ user, pathname }: { user: User; pathname: string }) {
    const { logout } = useAuth();
    const { isMobile, setOpenMobile } = useSidebar();
    const groups = NAV_BY_ROLE[user.role];
    const activeHref = findActiveHref(pathname, user.role);

    const closeOnMobile = () => {
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="gap-3 p-3">
                <div className="flex h-10 items-center px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    <Logo
                        onClick={closeOnMobile}
                        className="group-data-[collapsible=icon]:[&>span:last-child]:hidden"
                    />
                </div>
                <UserSummary user={user} />
            </SidebarHeader>

            <SidebarSeparator className="mx-0" />

            <SidebarContent className="py-2">
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.href === activeHref;
                                    return (
                                        <SidebarMenuItem key={`${group.label}-${item.href}`}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.label}
                                                className={cn(
                                                    'h-9 rounded-xl px-3 text-muted-foreground',
                                                    isActive &&
                                                        'bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground',
                                                )}
                                            >
                                                <Link href={item.href} onClick={closeOnMobile}>
                                                    <Icon />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-3">
                <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Back to site" className="h-9 rounded-xl px-3 text-muted-foreground">
                            <Link href="/" onClick={closeOnMobile}>
                                <Home />
                                <span>Back to site</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Log out"
                            onClick={logout}
                            className="h-9 rounded-xl px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}

function TopBar({ user, pathname }: { user: User; pathname: string }) {
    const { parent, title } = getBreadcrumb(pathname, user.role);
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
            <SidebarTrigger className="-ml-1 rounded-xl" aria-label="Toggle sidebar" />
            <div className="h-5 w-px bg-border" aria-hidden />
            <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                <Link
                    href={ROLE_HOME[user.role]}
                    className="hidden shrink-0 text-muted-foreground transition-colors hover:text-foreground sm:inline"
                >
                    Dashboard
                </Link>
                {parent && (
                    <>
                        <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" />
                        <Link
                            href={parent.href}
                            className="hidden shrink-0 text-muted-foreground transition-colors hover:text-foreground md:inline"
                        >
                            {parent.label}
                        </Link>
                    </>
                )}
                <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" />
                <span className="truncate font-semibold text-foreground" aria-current="page">
                    {title}
                </span>
            </nav>
            <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    );
}

function DashboardSkeleton() {
    return (
        <div className="flex min-h-svh w-full bg-background" aria-busy="true" aria-label="Loading dashboard">
            <div className="hidden w-64 shrink-0 flex-col gap-4 border-r border-border bg-sidebar p-4 md:flex">
                <Skeleton className="h-10 w-36 rounded-xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <div className="space-y-2 pt-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full rounded-xl" />
                    ))}
                </div>
            </div>
            <div className="flex flex-1 flex-col">
                <div className="flex h-16 items-center justify-between border-b border-border px-6">
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                </div>
                <div className="space-y-6 bg-muted/30 p-4 sm:p-6 lg:p-8">
                    <Skeleton className="h-9 w-64 rounded-xl" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-72 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

/** Session exists but /auth/me failed for a non-auth reason (backend down, 5xx). */
function SessionUnavailable() {
    const { refreshUser, logout } = useAuth();
    const [retrying, setRetrying] = useState(false);

    const retry = async () => {
        setRetrying(true);
        try {
            await refreshUser();
        } catch {
            // Still unreachable: stay on this screen.
        } finally {
            setRetrying(false);
        }
    };

    return (
        <div className="flex min-h-svh items-center justify-center bg-background px-4">
            <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <WifiOff className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                    <h1 className="font-serif text-xl font-semibold tracking-tight text-foreground">Can&apos;t reach RentNest</h1>
                    <p className="text-sm text-muted-foreground">
                        We couldn&apos;t load your account. Check your connection and try again.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <Button className="h-10 rounded-xl" onClick={retry} disabled={retrying}>
                        {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Try again
                    </Button>
                    <Button variant="outline" className="h-10 rounded-xl" onClick={logout}>
                        <LogOut className="h-4 w-4" /> Log out
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, token, isLoading } = useAuth();

    useEffect(() => {
        // `token` without `user` means the session check failed transiently:
        // redirecting would loop, because the proxy bounces /login back here.
        if (!isLoading && !user && !token) {
            router.replace(`/login?from=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, user, token, pathname, router]);

    if (!isLoading && !user && token) return <SessionUnavailable />;
    if (isLoading || !user) return <DashboardSkeleton />;

    const allowedRoles = allowedRolesFor(pathname);

    return (
        <TooltipProvider delayDuration={0}>
            <SidebarProvider>
                <DashboardSidebar user={user} pathname={pathname} />
                <SidebarInset className="min-w-0 bg-muted/40">
                    <TopBar user={user} pathname={pathname} />
                    <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
                        <div className="w-full">
                            {allowedRoles ? <RoleGuard allowedRoles={allowedRoles}>{children}</RoleGuard> : children}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
