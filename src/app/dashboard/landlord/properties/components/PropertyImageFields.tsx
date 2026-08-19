'use client';

import { Control, UseFormRegister, FieldErrors, useFieldArray } from 'react-hook-form';
import { ImagePlus, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppButton } from '@/components/shared/AppButton';
import { PropertyFormValues } from '@/schemas/property.schema';

interface PropertyImageFieldsProps {
    control: Control<PropertyFormValues>;
    register: UseFormRegister<PropertyFormValues>;
    errors: FieldErrors<PropertyFormValues>;
}

export function PropertyImageFields({ control, register, errors }: PropertyImageFieldsProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'images',
    });

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImagePlus className="h-3.5 w-3.5 text-primary" /> Image URLs
                </label>
                <AppButton
                    type="button"
                    variant="outline"
                    onClick={() => append({ url: '' })}
                    className="h-7 text-xs rounded-lg gap-1 px-2.5"
                >
                    <PlusCircle className="h-3.5 w-3.5" /> Add URL
                </AppButton>
            </div>

            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Input
                                {...register(`images.${index}.url`)}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="rounded-xl border-border/80 bg-background text-xs"
                            />
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {errors.images?.[index]?.url && (
                            <p className="text-[11px] text-destructive font-medium">
                                {errors.images[index]?.url?.message}
                            </p>
                        )}
                    </div>
                ))}
                {errors.images?.root && (
                    <p className="text-[11px] text-destructive font-medium">{errors.images.root.message}</p>
                )}
            </div>
        </div>
    );
}