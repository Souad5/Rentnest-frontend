'use client';

import { Users, Building2, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">System Administration</h1>
                <p className="text-sm text-muted-foreground">Platform-wide oversight, user accounts, and system analytics.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">1,248</p>
                    <p className="text-xs text-emerald-500">+14% this week</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Listings</span>
                        <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">412</p>
                    <p className="text-xs text-muted-foreground">38 pending verification</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">GMV (This Month)</span>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">$340.2K</p>
                    <p className="text-xs text-emerald-500">+12.4% vs target</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">System Health</span>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">99.9%</p>
                    <p className="text-xs text-muted-foreground">All services operational</p>
                </div>
            </div>
        </div>
    );
}