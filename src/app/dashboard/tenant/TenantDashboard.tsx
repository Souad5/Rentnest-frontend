'use client';

import { Home, CreditCard, Wrench, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TenantDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back, Alex</h1>
                <p className="text-sm text-muted-foreground">Here is an overview of your active lease and payments.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Next Payment Due</span>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">$1,850.00</p>
                    <p className="text-xs text-muted-foreground">Due on Oct 1, 2026</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Current Lease</span>
                        <Home className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">Apt 4B - Skyline Towers</p>
                    <p className="text-xs text-muted-foreground">Ends Aug 31, 2027</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Open Maintenance</span>
                        <Wrench className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">1 Request</p>
                    <p className="text-xs text-amber-500 font-medium">In Progress (Plumbing)</p>
                </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <Button className="gap-2">
                            Pay Rent <ArrowUpRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="gap-2">
                            Report Issue <Wrench className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Recent Activity</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center justify-between border-b border-border/50 pb-2">
                            <span>Rent Payment - Sept 2026</span>
                            <span className="text-emerald-500 font-medium">$1,850 (Paid)</span>
                        </li>
                        <li className="flex items-center justify-between border-b border-border/50 pb-2">
                            <span>Kitchen Sink Repair Ticket</span>
                            <span className="text-amber-500 font-medium">Assigned</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}