'use client';

import Link from 'next/link';
import {
    Building2,
    ClipboardList,
    CreditCard,
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Search,
    Shield,
    UserRound,
    Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/AuthProvider';
import { dashboardHomeFor } from '@/config/site';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

const roleLinks = {
    TENANT: [
        { label: 'My rental requests', href: '/dashboard/tenant/requests', icon: ClipboardList },
        { label: 'Payments', href: '/dashboard/tenant/payments', icon: CreditCard },
    ],
    LANDLORD: [
        { label: 'My listings', href: '/dashboard/landlord/properties', icon: Building2 },
        { label: 'Add property', href: '/dashboard/landlord/properties/new', icon: PlusCircle },
    ],
    ADMIN: [
        { label: 'Users', href: '/dashboard/admin/users', icon: Users },
        { label: 'Moderation', href: '/dashboard/admin/moderation', icon: Shield },
    ],
} as const;

/** Avatar button + profile dropdown, shared by the site navbar and the dashboard top bar. */
export function UserMenu({ showName = true, className }: { showName?: boolean; className?: string }) {
    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-1 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        showName && 'sm:pr-3',
                        className,
                    )}
                    aria-label="Open profile menu"
                >
                    <Avatar className="h-8 w-8">
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                        <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                            {initials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    {showName && (
                        <span className="hidden max-w-32 truncate text-xs font-semibold text-foreground sm:block">{user.name}</span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{user.role.toLowerCase()}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer gap-2">
                        <Link href={dashboardHomeFor(user.role)}>
                            <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer gap-2">
                        <Link href="/dashboard/profile">
                            <UserRound className="h-4 w-4" /> Profile
                        </Link>
                    </DropdownMenuItem>
                    {roleLinks[user.role].map(({ label, href, icon: Icon }) => (
                        <DropdownMenuItem key={href} asChild className="cursor-pointer gap-2">
                            <Link href={href}>
                                <Icon className="h-4 w-4" /> {label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild className="cursor-pointer gap-2">
                        <Link href="/properties">
                            <Search className="h-4 w-4" /> Browse properties
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
