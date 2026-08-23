'use client';

import { ApiProperty } from '@/lib/api';

interface MetricsOverviewProps {
    properties: ApiProperty[];
    /** PENDING rental requests awaiting a landlord decision (from backend). */
    pendingRequests: number;
    /** Sum of COMPLETED payment amounts for this landlord's requests (from backend). */
    earnings: number;
}

export function MetricsOverview({ properties, pendingRequests, earnings }: MetricsOverviewProps) {
    const totalProperties = properties.length;
    const monthlyRentRoll = properties.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Monthly Rent Roll</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                        {totalProperties} listing{totalProperties === 1 ? '' : 's'}
                    </span>
                </div>
                <div>
                    <div className="text-2xl font-extrabold text-slate-900">${monthlyRentRoll.toLocaleString()}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Sum of your listed monthly rents</p>
                </div>

            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">My Properties</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-600">Portfolio</span>
                </div>
                <div>
                    <div className="text-2xl font-extrabold text-slate-900">{totalProperties}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Active listings created by you</p>
                </div>

            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Rental Requests</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                        {pendingRequests > 0 ? 'Action needed' : 'Up to date'}
                    </span>
                </div>
                <div>
                    <div className="text-2xl font-extrabold text-slate-900">{pendingRequests}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pending requests awaiting review</p>
                </div>

            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Earnings</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">Paid</span>
                </div>
                <div>
                    <div className="text-2xl font-extrabold text-slate-900">${earnings.toLocaleString()}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Completed tenant payments</p>
                </div>

            </div>
        </div>
    );
}
