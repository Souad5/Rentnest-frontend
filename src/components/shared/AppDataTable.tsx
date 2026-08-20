// components/common/AppDataTable.tsx

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Loader2,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    ChevronDown,
} from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type PaginationState,
} from '@tanstack/react-table';

import { AppButton } from '@/components/shared/AppButton';
import { AppDropdown } from '@/components/shared/AppDropdown';
import { AppInput } from '@/components/shared/AppInput';

export interface AppDataTableFilterOption {
    /** Column id this filter targets (must match a column's `id`) */
    columnId: string;
    /** Label shown when nothing is selected, e.g. "All roles" */
    placeholder: string;
    /** Dropdown options: value used as filter value, label shown to user */
    options: { label: string; value: string }[];
}

interface AppDataTableProps<TData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<TData, any>[];
    data: TData[];
    loading?: boolean;
    /** Placeholder text for the global search input */
    searchPlaceholder?: string;
    /** Extra dropdown filters rendered next to the search box */
    filters?: AppDataTableFilterOption[];
    /** Column id that should be right-aligned (typically an actions/status column) */
    rightAlignColumnId?: string;
    pageSizeOptions?: number[];
    initialPageSize?: number;
    emptyMessage?: string;
    /** Full custom empty state (icon, CTA, etc). Overrides emptyMessage when provided. */
    emptyState?: React.ReactNode;
    loadingMessage?: string;
    /** Hide the built-in search/filter toolbar — use when the parent renders its own header/search UI. */
    hideToolbar?: boolean;
    /** Controlled global filter value. Pass together with onGlobalFilterChange to drive search from outside. */
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;
    /** Show/hide the pagination bar. Default true. */
    showPagination?: boolean;
    /** Override the outer table container classes (default: rounded-xl border border-border bg-card). */
    containerClassName?: string;
    /** Override header row classes (default: border-b border-border text-muted-foreground uppercase-less style). */
    headerRowClassName?: string;
    /** Override each row's hover/transition classes. */
    rowClassName?: string;
    /** Override table text size, e.g. 'text-sm' to match a denser design. */
    tableTextClassName?: string;
}

export function AppDataTable<TData>({
    columns,
    data,
    loading = false,
    searchPlaceholder = 'Search...',
    filters = [],
    rightAlignColumnId,
    pageSizeOptions = [10, 25, 50, 100],
    initialPageSize = 10,
    emptyMessage = 'No results found matching your filters.',
    emptyState,
    loadingMessage = 'Loading...',
    hideToolbar = false,
    globalFilter: controlledGlobalFilter,
    onGlobalFilterChange,
    showPagination = true,
    containerClassName = 'rounded-xl border border-border bg-card overflow-hidden shadow-2xs',
    headerRowClassName = 'border-b border-border',
    rowClassName = 'hover:bg-muted/40 transition-colors',
    tableTextClassName = '',
}: AppDataTableProps<TData>) {
    const isControlled = controlledGlobalFilter !== undefined && !!onGlobalFilterChange;
    const [internalGlobalFilter, setInternalGlobalFilter] = React.useState('');
    const globalFilter = isControlled ? controlledGlobalFilter : internalGlobalFilter;
    const setGlobalFilter = isControlled ? onGlobalFilterChange! : setInternalGlobalFilter;

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: initialPageSize,
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: { globalFilter, sorting, columnFilters, pagination },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const showToolbar = !hideToolbar && (!!searchPlaceholder || filters.length > 0);

    return (
        <div className="space-y-4">
            {/* Search + Advanced Filters */}
            {showToolbar && (
                <div className="flex justify-between flex-col sm:flex-row gap-3">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <AppInput
                            placeholder={searchPlaceholder}
                            value={globalFilter}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setGlobalFilter(e.target.value)
                            }
                            className="pl-9 h-9 text-sm"
                        />
                    </div>

                    {filters.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

                            {filters.map((filter) => {
                                const currentValue =
                                    (table.getColumn(filter.columnId)?.getFilterValue() as string) ?? '';
                                const currentLabel =
                                    filter.options.find((o) => o.value === currentValue)?.label ??
                                    filter.placeholder;

                                return (
                                    <AppDropdown
                                        key={filter.columnId}
                                        trigger={
                                            <AppButton
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 gap-1.5 text-sm"
                                            >
                                                {currentLabel}
                                                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                            </AppButton>
                                        }
                                        align="start"
                                        items={[
                                            {
                                                label: filter.placeholder,
                                                onClick: () =>
                                                    table
                                                        .getColumn(filter.columnId)
                                                        ?.setFilterValue(undefined),
                                            },
                                            { separator: true },
                                            ...filter.options.map((opt) => ({
                                                label: opt.label,
                                                onClick: () =>
                                                    table
                                                        .getColumn(filter.columnId)
                                                        ?.setFilterValue(opt.value),
                                            })),
                                        ]}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className={containerClassName}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{loadingMessage}</p>
                    </div>
                ) : table.getRowModel().rows.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className={`w-full text-left border-collapse ${tableTextClassName}`}>
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className={headerRowClassName}>
                                            {headerGroup.headers.map((header) => {
                                                const sortDir = header.column.getIsSorted();
                                                const isRightAligned =
                                                    header.column.id === rightAlignColumnId;
                                                return (
                                                    <th
                                                        key={header.id}
                                                        className={`px-4 py-3 text-sm font-medium text-muted-foreground select-none ${isRightAligned ? 'text-right' : 'text-left'
                                                            } ${header.column.getCanSort()
                                                                ? 'cursor-pointer hover:text-foreground'
                                                                : ''
                                                            }`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        <div
                                                            className={`flex items-center gap-1 ${isRightAligned
                                                                ? 'justify-start'
                                                                : 'justify-start'
                                                                }`}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                            {header.column.getCanSort() &&
                                                                (sortDir === 'asc' ? (
                                                                    <ArrowUp className="h-3 w-3" />
                                                                ) : sortDir === 'desc' ? (
                                                                    <ArrowDown className="h-3 w-3" />
                                                                ) : (
                                                                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                                                                ))}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <AnimatePresence>
                                        {table.getRowModel().rows.map((row) => (
                                            <motion.tr
                                                key={row.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className={rowClassName}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="px-4 py-4 align-middle">
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {showPagination && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>
                                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                                        {table.getPageCount() || 1}
                                    </span>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span>{table.getFilteredRowModel().rows.length} results</span>

                                    <AppDropdown
                                        trigger={
                                            <AppButton
                                                variant="outline"
                                                size="sm"
                                                className="ml-2 h-8 px-2 gap-1 text-sm"
                                            >
                                                {table.getState().pagination.pageSize} / page
                                                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                            </AppButton>
                                        }
                                        align="end"
                                        items={pageSizeOptions.map((size) => ({
                                            label: `${size} / page`,
                                            onClick: () => table.setPageSize(size),
                                        }))}
                                    />
                                </div>

                                <div className="flex items-center gap-1">
                                    <AppButton
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <ChevronsLeft className="h-3.5 w-3.5" />
                                    </AppButton>
                                    <AppButton
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </AppButton>
                                    <AppButton
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </AppButton>
                                    <AppButton
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <ChevronsRight className="h-3.5 w-3.5" />
                                    </AppButton>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    emptyState ?? (
                        <div className="text-center py-12 text-sm text-muted-foreground">{emptyMessage}</div>
                    )
                )}
            </div>
        </div>
    );
}