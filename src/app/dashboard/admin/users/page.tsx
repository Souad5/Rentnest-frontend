'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, Loader2, Users, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { adminApi, ApiUser } from '@/lib/api';
import { Switch } from '@/components/shared/Switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppDataTable, type AppDataTableFilterOption } from '@/components/shared/AppDataTable';

const columnHelper = createColumnHelper<ApiUser>();

export default function AdminUsersPage() {
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getUsers();
            if (res.success && Array.isArray(res.data)) {
                setUsers(res.data);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
    }, []);

    const toggleUserBan = async (userToToggle: ApiUser) => {
        try {
            setActionLoading(userToToggle.id);
            const res = await adminApi.toggleBanUser(userToToggle.id, !userToToggle.isBanned);

            if (res.success) {
                const updatedStatus = res.data?.isBanned ?? !userToToggle.isBanned;
                setUsers((prev) =>
                    prev.map((u) => (u.id === userToToggle.id ? { ...u, isBanned: updatedStatus } : u))
                );
            }
        } catch (err) {
            console.error('Failed to toggle ban status:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const totalActive = users.filter((u) => !u.isBanned).length;
    const totalBanned = users.filter((u) => u.isBanned).length;

    const roleOptions = useMemo(
        () => Array.from(new Set(users.map((u) => u.role))).sort(),
        [users]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns = useMemo<ColumnDef<ApiUser, any>[]>(
        () => [
            columnHelper.accessor((row) => `${row.name} ${row.email}`, {
                id: 'user',
                header: 'User',
                enableSorting: true,
                sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
                filterFn: (row, _id, value: string) => {
                    const search = value.toLowerCase();
                    return (
                        row.original.name.toLowerCase().includes(search) ||
                        row.original.email.toLowerCase().includes(search)
                    );
                },
                cell: (info) => {
                    const u = info.row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                                <AvatarFallback className="bg-muted text-foreground font-semibold text-xs">
                                    {u.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-foreground">{u.name}</span>
                                    <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 rounded">
                                        {u.role}
                                    </Badge>
                                </div>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" /> {u.email}
                                </span>
                            </div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('role', {
                id: 'role',
                header: 'Role',
                enableSorting: true,
                enableColumnFilter: true,
                filterFn: 'equalsString',
                cell: (info) => (
                    <span className="text-xs font-mono text-muted-foreground">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor('createdAt', {
                id: 'createdAt',
                header: 'Joined',
                enableSorting: true,
                sortingFn: 'datetime',
                cell: (info) => (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        {new Date(info.getValue()).toLocaleDateString()}
                    </span>
                ),
            }),
            columnHelper.accessor('isBanned', {
                id: 'status',
                header: 'Status',
                enableSorting: true,
                enableColumnFilter: true,
                filterFn: (row, _id, value: string) => {
                    if (!value) return true;
                    return value === 'banned' ? row.original.isBanned : !row.original.isBanned;
                },
                cell: (info) => {
                    const u = info.row.original;
                    return (
                        <div className="flex items-center justify-end gap-3">
                            <span
                                className={`text-xs font-medium ${u.isBanned ? 'text-destructive' : 'text-muted-foreground'
                                    }`}
                            >
                                {u.isBanned ? 'Banned' : 'Active'}
                            </span>

                            {u.role !== 'ADMIN' ? (
                                actionLoading === u.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        <Switch
                                            checked={!u.isBanned}
                                            onCheckedChange={() => toggleUserBan(u)}
                                            aria-label="Toggle user status"
                                            className="cursor-pointer"
                                        />
                                    </motion.div>
                                )
                            ) : (
                                <span className="text-xs text-muted-foreground/60 italic">Protected</span>
                            )}
                        </div>
                    );
                },
            }),
        ],
        [actionLoading]
    );

    const filters: AppDataTableFilterOption[] = [
        {
            columnId: 'role',
            placeholder: 'All roles',
            options: roleOptions.map((role) => ({ label: role, value: role })),
        },
        {
            columnId: 'status',
            placeholder: 'All statuses',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Banned', value: 'banned' },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Minimal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">User Directory</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage registered accounts and control user permissions.
                    </p>
                </div>

                <AppButton
                    variant="outline"
                    size="sm"
                    onClick={loadUsers}
                    disabled={loading}
                    className="h-9 px-3 gap-2 shrink-0 self-start sm:self-center"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </AppButton>
            </div>

            {/* Clean Metrics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-semibold text-foreground mt-0.5">{users.length}</p>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground/60" />
                </div>

                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Active Accounts</p>
                        <p className="text-2xl font-semibold text-foreground mt-0.5">{totalActive}</p>
                    </div>
                    <UserCheck className="h-5 w-5 text-muted-foreground/60" />
                </div>

                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Banned Accounts</p>
                        <p className="text-2xl font-semibold text-foreground mt-0.5">{totalBanned}</p>
                    </div>
                    <UserX className="h-5 w-5 text-muted-foreground/60" />
                </div>
            </div>

            <AppDataTable
                columns={columns}
                data={users}
                loading={loading}
                searchPlaceholder="Filter by name or email..."
                filters={filters}
                rightAlignColumnId="status"
                emptyMessage="No user accounts found matching your filters."
                loadingMessage="Loading users..."
            />
        </div>
    );
}