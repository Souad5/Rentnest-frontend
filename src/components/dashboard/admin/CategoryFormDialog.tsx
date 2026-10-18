'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/api';
import type { Category } from '@/types/api';
import { errorMessage } from './useAdminQuery';

const schema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Keep the name under 60 characters'),
    description: z.string().trim().max(300, 'Description must be 300 characters or fewer'),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Category being edited; null creates a new one. */
    category: Category | null;
    onSaved: (category: Category) => void;
}

export function CategoryFormDialog({ open, onOpenChange, category, onSaved }: CategoryFormDialogProps) {
    const isEdit = !!category;
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', description: '' },
    });

    useEffect(() => {
        if (open) reset({ name: category?.name ?? '', description: category?.description ?? '' });
    }, [open, category, reset]);

    const descriptionLength = useWatch({ control, name: 'description' })?.length ?? 0;

    const onSubmit = async (values: FormValues) => {
        const payload = { name: values.name, description: values.description };
        try {
            const res = category ? await adminApi.updateCategory(category.id, payload) : await adminApi.createCategory(payload);
            toast.success(isEdit ? `Category "${res.data.name}" updated` : `Category "${res.data.name}" created`);
            onSaved({ ...res.data, propertyCount: res.data.propertyCount ?? category?.propertyCount ?? 0 });
            onOpenChange(false);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not save the category'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
                    <DialogHeader>
                        <DialogTitle className="font-serif text-lg tracking-tight">{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
                        <DialogDescription>
                            Categories help tenants filter listings, e.g. Apartment, Family Flat or Sublet.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-1.5">
                        <Label htmlFor="category-name">Name</Label>
                        <Input
                            id="category-name"
                            className="rounded-xl"
                            placeholder="e.g. Studio Apartment"
                            aria-invalid={!!errors.name}
                            {...register('name')}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="category-description">Description</Label>
                            <span className="text-xs text-muted-foreground">{descriptionLength}/300</span>
                        </div>
                        <Textarea
                            id="category-description"
                            rows={4}
                            className="min-h-24 rounded-xl"
                            placeholder="Optional — shown to tenants when they browse this category"
                            aria-invalid={!!errors.description}
                            {...register('description')}
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                    </div>

                    <DialogFooter className="rounded-b-2xl">
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="animate-spin" />}
                            {isEdit ? 'Save changes' : 'Create category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
