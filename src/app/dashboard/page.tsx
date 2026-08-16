'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Shield, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
    const [role, setRole] = useState<'TENANT' | 'LANDLORD' | 'ADMIN'>('TENANT');

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Hub</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Select a portal view to navigate your RentNest account.
                    </p>
                </div>

                {/* Role Switcher (For Development / Testing) */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
                    <Button
                        variant={role === 'TENANT' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setRole('TENANT')}
                        className="text-xs"
                    >
                        Tenant
                    </Button>
                    <Button
                        variant={role === 'LANDLORD' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setRole('LANDLORD')}
                        className="text-xs"
                    >
                        Landlord
                    </Button>
                    <Button
                        variant={role === 'ADMIN' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setRole('ADMIN')}
                        className="text-xs"
                    >
                        Admin
                    </Button>
                </div>
            </div>

            {/* Portal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <Card className={`border-border transition-all ${role === 'TENANT' ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> Tenant Portal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Browse saved listings, view lease agreements, and make rental payments.
                        </p>
                        <Button asChild className="w-full gap-2" size="sm">
                            <Link href="/dashboard/tenant">
                                Open Portal <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className={`border-border transition-all ${role === 'LANDLORD' ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" /> Landlord Portal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Manage property listings, process applications, and handle repair requests.
                        </p>
                        <Button asChild className="w-full gap-2" size="sm">
                            <Link href="/dashboard/landlord">
                                Open Portal <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className={`border-border transition-all ${role === 'ADMIN' ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" /> Admin Portal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Overview user accounts, verify landlord listings, and system audit logs.
                        </p>
                        <Button asChild className="w-full gap-2" size="sm">
                            <Link href="/dashboard/admin">
                                Open Portal <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}