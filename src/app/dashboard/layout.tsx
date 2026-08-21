'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Building2,
    Home,
    Shield,
    Users,
    LogOut,
    Bell,
    PlusCircle,
    Search,
    CheckSquare,
    ChevronRight,
    Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar';
import { useAuth, UserRole } from '@/providers/AuthProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navByRole: Record<UserRole, NavItem[]> = {
    TENANT: [
        { label: 'Overview', href: '/dashboard/tenant', icon: Home },
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
        <TooltipProvider>

            <SidebarProvider>
                <div className="flex min-h-screen w-full bg-background font-sans antialiased">
                    {/* Shadcn Sidebar Component */}
                    <Sidebar variant="inset" collapsible="icon">
                        {/* Header: Logo */}
                        <SidebarHeader className="border-b border-border/40 p-4">
                            <Link href="/" className="flex items-center gap-3 font-bold text-lg text-foreground">
                                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                    <span className="leading-none text-base">RentNest</span>
                                    <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-1">
                                        {activeRole} Portal
                                    </span>
                                </div>
                            </Link>
                        </SidebarHeader>

                        {/* Content: User Info & Menu Items */}
                        <SidebarContent className="px-2 py-4">
                            {/* User Card */}
                            <div className="mx-2 mb-4 p-3 rounded-xl border border-border/60 bg-card group-data-[collapsible=icon]:p-1.5 flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {user?.name?.[0] || activeRole[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                                    <p className="text-xs font-semibold truncate text-foreground leading-tight">
                                        {user?.name || 'User Account'}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <Badge variant="secondary" className="text-[8px] font-bold uppercase bg-primary/10 text-primary px-1 py-0 border-0">
                                            {activeRole}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Group */}
                            <SidebarGroup>
                                <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Navigation
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {navigation.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = pathname === item.href;
                                            return (
                                                <SidebarMenuItem key={item.href}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={isActive}
                                                        tooltip={item.label}
                                                        className={`rounded-xl px-3 py-2.5 transition-all ${isActive
                                                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 hover:text-primary-foreground'
                                                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                                            }`}
                                                    >
                                                        <Link href={item.href} className="flex items-center gap-3">
                                                            <Icon className="h-4 w-4 shrink-0" />
                                                            <span>{item.label}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>

                        {/* Footer: Logout */}
                        <SidebarFooter className="border-t border-border/40 p-3">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        onClick={logout}
                                        tooltip="Sign Out"
                                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                    >
                                        <LogOut className="h-4 w-4 shrink-0" />
                                        <span>Sign Out</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
                    </Sidebar>

                    {/* Main Content Area */}
                    <SidebarInset className="flex flex-col flex-1 min-w-0">
                        <header className="flex h-14 items-center justify-between border-b border-border/60 bg-card/30 backdrop-blur-md px-4 sm:px-8 sticky top-0 z-30">
                            <div className="flex items-center gap-3">
                                <SidebarTrigger />
                                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>RentNest</span>
                                    <ChevronRight className="h-3 w-3" />
                                    <span className="capitalize text-foreground font-medium">
                                        {activeRole.toLowerCase()} Workspace
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" size="icon" className="rounded-xl border-border/80 h-9 w-9">
                                <Bell className="h-4 w-4" />
                            </Button>
                        </header>

                        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}