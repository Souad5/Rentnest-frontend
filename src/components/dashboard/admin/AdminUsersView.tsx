'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Ban, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { adminApi } from '@/lib/api';
import { formatDate, initials } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import type { AdminUser } from '@/types/api';
import { ConfirmDialog } from './ConfirmDialog';
import { CountPills, ErrorState, TableSkeleton } from './AdminStates';
import { adminKeys, errorMessage, useAdminCache, useAdminQuery } from './useAdminQuery';

type UserRow = AdminUser & { avatarUrl?: string | null };

const ROLE_OPTIONS = [
    { label: 'Tenants', value: 'TENANT' },
    { label: 'Landlords', value: 'LANDLORD' },
    { label: 'Admins', value: 'ADMIN' },
];

const STATUS_OPTIONS = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Banned', value: 'BANNED' },
];

export function AdminUsersView() {
    const { user: me } = useAuth();
    const query = useAdminQuery<UserRow[]>(adminKeys.users, adminApi.users);
    const cache = useAdminCache<UserRow>(adminKeys.users);
    const [target, setTarget] = useState<UserRow | null>(null);
    const [saving, setSaving] = useState(false);

    const users = useMemo(() => query.data ?? [], [query.data]);

    const counts = useMemo(
        () => ({
            total: users.length,
            tenants: users.filter((u) => u.role === 'TENANT').length,
            landlords: users.filter((u) => u.role === 'LANDLORD').length,
            admins: users.filter((u) => u.role === 'ADMIN').length,
            banned: users.filter((u) => u.isBanned).length,
        }),
        [users],
    );

    const confirmBan = async () => {
        if (!target) return;
        const nextBanned = !target.isBanned;
        const previous = cache.snapshot();
        setSaving(true);
        cache.patch(target.id, { isBanned: nextBanned });
        try {
            const res = await adminApi.setBan(target.id, nextBanned);
            toast.success(res.message || (nextBanned ? `${target.name} has been banned` : `${target.name} has been reinstated`));
            cache.invalidateStats();
            setTarget(null);
        } catch (error) {
            cache.restore(previous);
            toast.error(errorMessage(error, 'Could not update this account'));
        } finally {
            setSaving(false);
        }
    };

    const columns = useMemo<ColumnDef<UserRow>[]>(
        () => [
            {
                id: 'user',
                header: 'User',
                accessorFn: (u) => `${u.name} ${u.email}`,
                cell: ({ row }) => {
                    const u = row.original;
                    return (
                        <div className="flex min-w-[200px] items-center gap-3">
                            <Avatar className="h-9 w-9">
                                {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
                                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                    {initials(u.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {u.name}
                                    {u.id === me?.id && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'role',
                header: 'Role',
                accessorFn: (u) => u.role,
                filterFn: 'equalsString',
                cell: ({ row }) => (
                    <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-foreground">
                        {row.original.role.toLowerCase()}
                    </span>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                accessorFn: (u) => (u.isBanned ? 'BANNED' : 'ACTIVE'),
                filterFn: 'equalsString',
                cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
            },
            {
                id: 'activity',
                header: 'Activity',
                enableGlobalFilter: false,
                accessorFn: (u) => (u._count?.properties ?? 0) + (u._count?.rentalRequests ?? 0),
                cell: ({ row }) => {
                    const c = row.original._count;
                    return (
                        <div className="whitespace-nowrap text-xs text-muted-foreground">
                            <p>
                                <span className="font-semibold text-foreground">{c?.properties ?? 0}</span> listings
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">{c?.rentalRequests ?? 0}</span> rental requests
                            </p>
                        </div>
                    );
                },
            },
            {
                id: 'joined',
                header: 'Joined',
                enableGlobalFilter: false,
                accessorFn: (u) => u.createdAt,
                cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => {
                    const u = row.original;
                    const isSelf = u.id === me?.id;
                    const isAdmin = u.role === 'ADMIN';
                    const blockedReason = isSelf
                        ? 'You cannot ban your own account'
                        : isAdmin && !u.isBanned
                          ? 'Administrators cannot be banned'
                          : null;

                    const button = (
                        <Button
                            size="sm"
                            variant={u.isBanned ? 'outline' : 'destructive'}
                            className="rounded-xl"
                            disabled={!!blockedReason}
                            onClick={() => setTarget(u)}
                        >
                            {u.isBanned ? <ShieldCheck /> : <Ban />}
                            {u.isBanned ? 'Unban' : 'Ban'}
                        </Button>
                    );

                    if (!blockedReason) return button;
                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={0} className="inline-flex">
                                    {button}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>{blockedReason}</TooltipContent>
                        </Tooltip>
                    );
                },
            },
        ],
        [me?.id],
    );

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Users"
                description="Everyone registered on RentNest. Ban accounts that break the community rules; banned users cannot sign in."
            />

            {query.isPending ? (
                <TableSkeleton columns={6} />
            ) : query.isError ? (
                <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : users.length === 0 ? (
                <EmptyState icon={Users} title="No users yet" description="Accounts appear here as soon as tenants and landlords register." />
            ) : (
                <>
                    <CountPills
                        items={[
                            { label: 'Total', value: counts.total },
                            { label: 'Tenants', value: counts.tenants },
                            { label: 'Landlords', value: counts.landlords },
                            { label: 'Admins', value: counts.admins },
                            { label: 'Banned', value: counts.banned },
                        ]}
                    />
                    <TooltipProvider>
                        <AppDataTable
                            columns={columns}
                            data={users}
                            searchPlaceholder="Search by name or email…"
                            filters={[
                                { columnId: 'role', placeholder: 'All roles', options: ROLE_OPTIONS },
                                { columnId: 'status', placeholder: 'All statuses', options: STATUS_OPTIONS },
                            ]}
                            emptyMessage="No users match your search or filters."
                        />
                    </TooltipProvider>
                </>
            )}

            <ConfirmDialog
                open={!!target}
                onOpenChange={(open) => !open && setTarget(null)}
                title={target?.isBanned ? `Unban ${target?.name}?` : `Ban ${target?.name}?`}
                description={
                    target?.isBanned
                        ? 'They will be able to sign in, browse and use their dashboard again.'
                        : 'They immediately lose access to their RentNest account until you unban them. Their listings and history are kept.'
                }
                confirmLabel={target?.isBanned ? 'Unban user' : 'Ban user'}
                destructive={!target?.isBanned}
                loading={saving}
                onConfirm={confirmBan}
            />
        </div>
    );
}
