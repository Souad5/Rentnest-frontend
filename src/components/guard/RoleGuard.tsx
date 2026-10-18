'use client';

import Link from 'next/link';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, type UserRole } from '@/providers/AuthProvider';
import { dashboardHomeFor } from '@/config/site';

interface RoleGuardProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
}

/** Client-side role gate for dashboard sections (the backend enforces real authorization). */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center" role="status" aria-label="Checking access">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return (
            <div className="mx-auto my-10 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">Access restricted</h2>
                    <p className="text-sm text-muted-foreground">
                        {user ? (
                            <>
                                You are signed in as a{' '}
                                <span className="font-semibold capitalize text-foreground">{user.role.toLowerCase()}</span>. This
                                area is only available to {allowedRoles.map((r) => r.toLowerCase()).join(' and ')} accounts.
                            </>
                        ) : (
                            'Please sign in to continue.'
                        )}
                    </p>
                </div>
                <Button asChild className="h-10 rounded-xl px-5">
                    <Link href={user ? dashboardHomeFor(user.role) : '/login'}>{user ? 'Go to my dashboard' : 'Sign in'}</Link>
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}
