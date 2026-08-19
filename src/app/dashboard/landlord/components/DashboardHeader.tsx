'use client';

import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';

interface DashboardHeaderProps {
    userName?: string;
    isLoading: boolean;
    onRefresh: () => void;
}

export function DashboardHeader({ userName, isLoading, onRefresh }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Welcome back, <span className="font-semibold text-slate-800">{userName || 'Landlord'}</span>! Let&apos;s manage your portfolio.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <AppButton
                    variant="outline"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs h-10 px-3"
                >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Sync Data
                </AppButton>

                <AppButton asChild className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs h-10 px-4 font-medium shadow-xs">
                    <Link href="/dashboard/landlord/properties/new">
                        <Plus className="h-4 w-4 mr-1.5" /> Add Property
                    </Link>
                </AppButton>
            </div>
        </div>
    );
}