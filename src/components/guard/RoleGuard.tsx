'use client';

import React from 'react';
import { useAuth, UserRole } from '@/providers/AuthProvider';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RoleGuardProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { user, isLoading } = useAuth();

    // 1. Show loading state while authApi.getMe() is running
    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 2. Fallback if user is not logged in or role is unauthorized
    if (!user || !allowedRoles.includes(user.role)) {
        const defaultHome = user?.role
            ? `/dashboard/${user.role.toLowerCase()}`
            : '/login';

        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-destructive/20 rounded-3xl my-8 max-w-md mx-auto space-y-4 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
                <p className="text-sm text-muted-foreground">
                    You are logged in as{' '}
                    <strong className="uppercase font-semibold text-foreground">
                        {user?.role || 'Guest'}
                    </strong>
                    . You do not have permission to access this area.
                </p>
                <Button asChild className="rounded-xl mt-2">
                    <Link href={defaultHome}>
                        {user ? 'Go to My Portal' : 'Log In'}
                    </Link>
                </Button>
            </div>
        );
    }

    // 3. User is authorized
    return <>{children}</>;
}