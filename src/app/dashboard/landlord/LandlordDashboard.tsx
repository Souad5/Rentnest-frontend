'use client';

import { Building2, Users, DollarSign, Wrench, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandlordDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Landlord Portal</h1>
                    <p className="text-sm text-muted-foreground">Manage properties, track income, and review maintenance.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Property
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue (Mo)</span>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">$12,400</p>
                    <p className="text-xs text-emerald-500">+8.2% from last month</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Properties</span>
                        <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">6 Units</p>
                    <p className="text-xs text-muted-foreground">100% Occupancy</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Active Tenants</span>
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">6</p>
                    <p className="text-xs text-muted-foreground">All leases current</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-semibold uppercase tracking-wider">Pending Tickets</span>
                        <Wrench className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-xs text-amber-500 font-medium">Requires attention</p>
                </div>
            </div>
        </div>
    );
}