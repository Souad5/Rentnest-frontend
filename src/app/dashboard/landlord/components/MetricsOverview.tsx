'use client';

import { ApiProperty } from '@/lib/api';

interface MetricsOverviewProps {
    properties: ApiProperty[];
}

export function MetricsOverview({ properties }: MetricsOverviewProps) {
    const totalProperties = properties.length;
    const availableProperties = properties.filter((p) => p.isAvailable).length;
    const estimatedMonthlyRevenue = properties.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    const occupancyRate = totalProperties > 0 ? Math.round(((totalProperties - availableProperties) / totalProperties) * 100) : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Portfolio Value</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">+12%</span>
                </div>
                <div>
                    <div className="text-2xl font-extrabold text-slate-900">${estimatedMonthlyRevenue.toLocaleString()}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Relative to last month</p>
                </div>

            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">My Properties</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-600">+8%</span>
                </div>
                <div>
                    <div className="text-2xl font-extrabold text-slate-900">{totalProperties}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Active listings created by you</p>
                </div>

            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Available Units</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">Active</span>
                </div>
                <div>
                    <div className="text-2xl font-extrabold text-slate-900">{availableProperties}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Ready for new tenants</p>
                </div>

            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Occupancy Rate</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">{occupancyRate}%</span>
                </div>
                <div>
                    <div className="text-2xl font-extrabold text-slate-900">{occupancyRate}%</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Current occupied ratio</p>
                </div>

            </div>
        </div>
    );
}