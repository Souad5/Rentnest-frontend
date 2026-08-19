'use client';

import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Mail, Calendar, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { adminApi, ApiUser } from '@/lib/api';
import { AppButton } from '@/components/shared/AppButton';

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
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

            // Pass target boolean status to API
            const res = await adminApi.toggleBanUser(userToToggle.id, !userToToggle.isBanned);

            if (res.success) {
                // Update state using server response data if available, fallback to toggle
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

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View registered tenants, landlords, and administrators.
                    </p>
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                    Total Users: {users.length}
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Registered Accounts</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                            <div
                                key={u.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {u.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">{u.name}</span>
                                            <Badge variant="outline" className="text-[10px]">
                                                {u.role}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5" /> {u.email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" /> {new Date(u.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                    <Badge
                                        variant={u.isBanned ? 'destructive' : 'secondary'}
                                        className={!u.isBanned ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}
                                    >
                                        {u.isBanned ? 'BANNED' : 'ACTIVE'}
                                    </Badge>

                                    {u.role !== 'ADMIN' && (
                                        <AppButton
                                            variant={u.isBanned ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={actionLoading === u.id}
                                            onClick={() => toggleUserBan(u)}
                                            className="gap-1.5"
                                        >
                                            {actionLoading === u.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : u.isBanned ? (
                                                <>
                                                    <UserCheck className="h-4 w-4" /> Unban
                                                </>
                                            ) : (
                                                <>
                                                    <UserX className="h-4 w-4 text-destructive" /> Ban
                                                </>
                                            )}
                                        </AppButton>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-sm text-muted-foreground">
                            No users found matching &quot;{searchTerm}&quot;.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}