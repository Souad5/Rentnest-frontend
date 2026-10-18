'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { adminApi } from '@/lib/api';
import type { Category } from '@/types/api';
import { CategoryFormDialog } from './CategoryFormDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { CountPills, ErrorState, TableSkeleton } from './AdminStates';
import { adminKeys, errorMessage, useAdminCache, useAdminQuery } from './useAdminQuery';

export function AdminCategoriesView() {
    const query = useAdminQuery<Category[]>(adminKeys.categories, adminApi.categories);
    const cache = useAdminCache<Category>(adminKeys.categories);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [toDelete, setToDelete] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);

    const categories = useMemo(() => query.data ?? [], [query.data]);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await adminApi.deleteCategory(toDelete.id);
            cache.remove(toDelete.id);
            cache.invalidateStats();
            toast.success(`Category "${toDelete.name}" deleted`);
            setToDelete(null);
        } catch (error) {
            // 400 = the category still has listings (counts may have changed since load).
            toast.error(errorMessage(error, 'Could not delete this category'));
            void query.refetch();
        } finally {
            setDeleting(false);
        }
    };

    const columns = useMemo<ColumnDef<Category>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorFn: (c) => c.name,
                cell: ({ getValue }) => <span className="whitespace-nowrap text-sm font-medium text-foreground">{getValue<string>()}</span>,
            },
            {
                id: 'description',
                header: 'Description',
                accessorFn: (c) => c.description ?? '',
                enableSorting: false,
                cell: ({ getValue }) => {
                    const text = getValue<string>();
                    return text ? (
                        <p className="line-clamp-2 min-w-[220px] max-w-md text-sm text-muted-foreground">{text}</p>
                    ) : (
                        <span className="text-xs italic text-muted-foreground">No description</span>
                    );
                },
            },
            {
                id: 'properties',
                header: 'Listings',
                enableGlobalFilter: false,
                accessorFn: (c) => c.propertyCount ?? 0,
                cell: ({ getValue }) => <span className="text-sm font-semibold text-foreground">{getValue<number>()}</span>,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row }) => {
                    const c = row.original;
                    const inUse = (c.propertyCount ?? 0) > 0;
                    const deleteButton = (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${c.name}`}
                            disabled={inUse}
                            onClick={() => setToDelete(c)}
                        >
                            <Trash2 />
                        </Button>
                    );
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-xl"
                                aria-label={`Edit ${c.name}`}
                                onClick={() => {
                                    setEditing(c);
                                    setFormOpen(true);
                                }}
                            >
                                <Pencil />
                            </Button>
                            {inUse ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span tabIndex={0} className="inline-flex" aria-label={`${c.name} cannot be deleted while it has listings`}>
                                            {deleteButton}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Move or delete its {c.propertyCount} listing{c.propertyCount === 1 ? '' : 's'} first
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                deleteButton
                            )}
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const used = categories.filter((c) => (c.propertyCount ?? 0) > 0).length;

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Categories"
                description="The property types landlords choose from and tenants filter by."
                action={
                    <Button className="rounded-xl" onClick={openCreate}>
                        <Plus />
                        New category
                    </Button>
                }
            />

            {query.isPending ? (
                <TableSkeleton columns={4} rows={5} />
            ) : query.isError ? (
                <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
            ) : categories.length === 0 ? (
                <EmptyState
                    icon={Tags}
                    title="No categories yet"
                    description="Landlords need at least one category before they can publish a listing."
                    action={
                        <Button className="rounded-xl" onClick={openCreate}>
                            <Plus />
                            Create the first category
                        </Button>
                    }
                />
            ) : (
                <>
                    <CountPills
                        items={[
                            { label: 'Categories', value: categories.length },
                            { label: 'In use', value: used },
                            { label: 'Empty', value: categories.length - used },
                        ]}
                    />
                    <TooltipProvider>
                        <AppDataTable
                            columns={columns}
                            data={categories}
                            searchPlaceholder="Search categories…"
                            emptyMessage="No categories match your search."
                        />
                    </TooltipProvider>
                </>
            )}

            <CategoryFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                category={editing}
                onSaved={(saved) => {
                    cache.upsert(saved);
                    cache.invalidateStats();
                }}
            />

            <ConfirmDialog
                open={!!toDelete}
                onOpenChange={(open) => !open && setToDelete(null)}
                title={`Delete "${toDelete?.name}"?`}
                description="Landlords will no longer be able to choose this category. This cannot be undone."
                confirmLabel="Delete category"
                destructive
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
