'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PropertyFormValues } from '@/schemas/property.schema';

interface PropertyLocationFieldsProps {
    register: UseFormRegister<PropertyFormValues>;
    errors: FieldErrors<PropertyFormValues>;
}

export function PropertyLocationFields({ register, errors }: PropertyLocationFieldsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Location / City
                </label>
                <Input
                    {...register('location')}
                    placeholder="e.g. Dhaka"
                    className="rounded-xl border-border/80 bg-background"
                />
                {errors.location && (
                    <p className="text-[11px] text-destructive font-medium">{errors.location.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Street Address
                </label>
                <Input
                    {...register('address')}
                    placeholder="e.g. Bashundhara R/A"
                    className="rounded-xl border-border/80 bg-background"
                />
                {errors.address && (
                    <p className="text-[11px] text-destructive font-medium">{errors.address.message}</p>
                )}
            </div>
        </div>
    );
}