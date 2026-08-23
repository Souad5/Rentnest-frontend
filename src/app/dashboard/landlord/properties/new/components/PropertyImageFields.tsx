'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ImagePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PropertyFormValues } from '@/schemas/property.schema';

interface PropertyImageFieldsProps {
    register: UseFormRegister<PropertyFormValues>;
    errors: FieldErrors<PropertyFormValues>;
}

export function PropertyImageFields({ register, errors }: PropertyImageFieldsProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImagePlus className="h-3.5 w-3.5 text-primary" /> Image URL
                </label>
                <span className="text-[10px] font-mono text-muted-foreground">optional</span>
            </div>

            <div className="space-y-1">
                <Input
                    {...register('imageUrl')}
                    type="url"
                    placeholder="https://example.com/property-photo.jpg"
                    className="rounded-xl border-border/80 bg-background text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                    Paste a direct link to a photo of the property.
                </p>
                {errors.imageUrl && (
                    <p className="text-[11px] text-destructive font-medium">{errors.imageUrl.message}</p>
                )}
            </div>
        </div>
    );
}
