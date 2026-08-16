'use client';

import { useState } from 'react';
import { Search, UserCheck, UserX, Mail, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import StatusBadge from '@/components/shared/StatusBadge';

interface UserItem {
    id: string;
    name: string;
    email: string;
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
    status: 'ACTIVE' | 'SUSPENDED';
    joinedAt: string;
}

const MOCK_USERS: UserItem[] = [
    {
        id: 'user-1',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        role: 'TENANT',
        status: 'ACTIVE',
        joinedAt: '2026-01-10',
    },
    {
        id: 'user-2',
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        role: 'LANDLORD',
        status: 'ACTIVE',
        joinedAt: '2025-11-22',
    },
    {
        id: 'user-3',
        name: 'Elena Rostova',
        email: 'elena.r@example.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        joinedAt: '2025-08-15',
    },
    {
        id: 'user-4',
        name: 'David Miller',
        email: 'david.m@example.com',
        role: 'TENANT',
        status: 'SUSPENDED',
        joinedAt: '2026-02-04',
    },
];

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUserStatus = (id: string) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id
                    ? { ...user, status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
                    : user
            )
        );
    };

    return (
        <div className="space-y-6 py-4">
            {/* Page Header */}
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

            {/* Search Bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Users Table / List */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Registered Accounts</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {user.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">{user.name}</span>
                                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5" /> {user.email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" /> Joined {user.joinedAt}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                    <StatusBadge status={user.status} />

                                    {user.role !== 'ADMIN' && (
                                        <Button
                                            variant={user.status === 'ACTIVE' ? 'outline' : 'default'}
                                            size="sm"
                                            onClick={() => toggleUserStatus(user.id)}
                                            className="gap-1.5"
                                        >
                                            {user.status === 'ACTIVE' ? (
                                                <>
                                                    <UserX className="h-4 w-4 text-destructive" /> Suspend
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="h-4 w-4" /> Activate
                                                </>
                                            )}
                                        </Button>
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