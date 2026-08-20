'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type ColumnDef } from '@tanstack/react-table';
import { Search, Building2, Plus, Eye, Edit, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { AppInput } from '@/components/shared/AppInput';
import { AppButton } from '@/components/shared/AppButton';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { ApiProperty } from '@/lib/api';

interface PropertiesTableProps {
    properties: ApiProperty[];
    isLoading: boolean;
    userId?: string;
    onDelete: (id: string) => void;
    onToggleAvailability: (id: string, currentStatus?: boolean) => void;
}

export function PropertiesTable({
    properties,
    isLoading,
    onDelete,
    onToggleAvailability,
}: PropertiesTableProps) {
    const [globalFilter, setGlobalFilter] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns = useMemo<ColumnDef<ApiProperty, any>[]>(
        () => [
            {
                accessorKey: 'title',
                header: 'Property',
                cell: ({ row }) => {
                    const property = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="relative h-11 w-14 overflow-hidden rounded-xl bg-slate-100 shrink-0 border border-slate-200/50">
                                <Image
                                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 line-clamp-1 text-xs">{property.title}</p>
                                <p className="text-[11px] text-slate-400 line-clamp-1">{property.address || property.location}</p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorFn: (row) => row.category?.name || 'Apartment',
                id: 'category',
                header: 'Category',
                cell: ({ getValue }) => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {getValue<string>()}
                    </span>
                ),
            },
            {
                accessorKey: 'location',
                header: 'Location',
                cell: ({ getValue }) => (
                    <span className="text-slate-600 font-medium">{getValue<string>()}</span>
                ),
            },
            {
                accessorKey: 'price',
                header: 'Price',
                enableSorting: true,
                cell: ({ getValue }) => (
                    <span className="font-bold text-slate-900">${getValue<number>()}/mo</span>
                ),
            },
            {
                accessorKey: 'isAvailable',
                id: 'status',
                header: 'Status',
                enableColumnFilter: true,
                filterFn: (row, _id, value: string) => {
                    if (!value) return true;
                    const isAvailable = row.original.isAvailable ?? true;
                    return value === 'available' ? isAvailable : !isAvailable;
                },
                cell: ({ row }) => {
                    const property = row.original;
                    return (
                        <button
                            type="button"
                            onClick={() => onToggleAvailability(property.id, property.isAvailable ?? true)}
                            className="cursor-pointer border-none bg-transparent"
                        >
                            {property.isAvailable ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                                    <CheckCircle2 className="h-3 w-3" /> Available
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/50">
                                    <Clock className="h-3 w-3" /> Occupied
                                </span>
                            )}
                        </button>
                    );
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
                    const property = row.original;
                    return (
                        <div className="flex items-center justify-end gap-1">
                            <AppButton asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg">
                                <Link href={`/properties/${property.id}`}>
                                    <Eye className="h-3.5 w-3.5" />
                                </Link>
                            </AppButton>
                            <AppButton asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg">
                                <Link href={`/dashboard/landlord/properties/${property.id}/edit`}>
                                    <Edit className="h-3.5 w-3.5" />
                                </Link>
                            </AppButton>
                            <AppButton
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(property.id)}
                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </AppButton>
                        </div>
                    );
                },
            },
        ],
        [onDelete, onToggleAvailability]
    );

    return (
        <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">My Listed Properties</h2>
                    <p className="text-xs text-slate-500">
                        Properties owned and configured under your account
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <AppInput
                            placeholder="Search property name or city..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-9 h-9 text-xs rounded-xl border-slate-200 bg-slate-50/50"
                        />
                    </div>
                </div>
            </div>

            <AppDataTable
                columns={columns}
                data={properties}
                loading={isLoading}
                hideToolbar
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                filters={[
                    {
                        columnId: 'status',
                        placeholder: 'All statuses',
                        options: [
                            { label: 'Available', value: 'available' },
                            { label: 'Occupied', value: 'occupied' },
                        ],
                    },
                ]}
                rightAlignColumnId="actions"
                containerClassName=""
                headerRowClassName="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold"
                rowClassName="hover:bg-slate-50/60 transition-colors"
                tableTextClassName="text-xs"
                pageSizeOptions={[10, 25, 50]}
                initialPageSize={10}
                loadingMessage="Loading listings..."
                emptyState={
                    <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl p-6 space-y-3">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-slate-800">No properties found</p>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                You currently have no properties associated with your landlord account.
                            </p>
                        </div>
                        <AppButton asChild className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs h-9 px-4">
                            <Link href="/dashboard/landlord/properties/new">
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Your First Property
                            </Link>
                        </AppButton>
                    </div>
                }
            />
        </div>
    );
}