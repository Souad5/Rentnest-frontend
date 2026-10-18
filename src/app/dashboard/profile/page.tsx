'use client';

import { CalendarDays, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa6';

import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ProfileDetailsForm } from '@/components/dashboard/profile/ProfileDetailsForm';
import { ChangePasswordForm } from '@/components/dashboard/profile/ChangePasswordForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/AuthProvider';
import { formatDate } from '@/lib/format';

const ROLE_LABEL = { TENANT: 'Tenant', LANDLORD: 'Landlord', ADMIN: 'Administrator' } as const;

function InfoRow({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{children}</dd>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return <Skeleton className="h-96 w-full rounded-2xl" />;
    }

    // Fields beyond id/name/email/role arrive with /auth/me; `key` remounts the
    // form once they do so its defaults reflect the saved profile.
    const hydrated = user.createdAt !== undefined;

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Your profile"
                description="Keep your contact details current so landlords and tenants can reach you."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:col-span-2">
                    <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground">Personal details</h2>
                    <p className="mb-6 mt-1 text-sm text-muted-foreground">Shown on your requests, listings and reviews.</p>
                    {hydrated ? (
                        <ProfileDetailsForm key={user.updatedAt ?? 'profile'} user={user} />
                    ) : (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    )}
                </section>

                <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground">Account</h2>
                    <p className="mt-1 text-sm text-muted-foreground">These details can&apos;t be changed here.</p>
                    <dl className="mt-3 divide-y divide-border">
                        <InfoRow icon={Mail} label="Email">
                            {user.email}
                        </InfoRow>
                        <InfoRow icon={UserRound} label="Role">
                            {ROLE_LABEL[user.role]}
                        </InfoRow>
                        <InfoRow icon={CalendarDays} label="Member since">
                            {hydrated ? formatDate(user.createdAt, { month: 'long', year: 'numeric' }) : '…'}
                        </InfoRow>
                        <InfoRow icon={ShieldCheck} label="Sign-in method">
                            {user.authProvider === 'GOOGLE' ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <FaGoogle className="h-3.5 w-3.5 text-primary" aria-hidden /> Google
                                </span>
                            ) : user.authProvider === 'LOCAL' ? (
                                'Email & password'
                            ) : (
                                '…'
                            )}
                        </InfoRow>
                    </dl>
                </aside>
            </div>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="mb-6 flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <KeyRound className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground">
                            {user.authProvider === 'GOOGLE' ? 'Password' : 'Change password'}
                        </h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Use at least 8 characters with a mix of letters and numbers.
                        </p>
                    </div>
                </div>
                {hydrated ? (
                    <ChangePasswordForm key={user.authProvider} authProvider={user.authProvider} />
                ) : (
                    <Skeleton className="h-40 w-full rounded-xl" />
                )}
            </section>
        </div>
    );
}
