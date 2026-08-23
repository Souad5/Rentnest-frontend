'use client';

import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DollarSign, Tag, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { AppInput } from '@/components/shared/AppInput';
import { AppDropdown, AppDropdownItem } from '@/components/shared/AppDropdown';
import { AppButton } from '@/components/shared/AppButton';
import { PropertyFormValues, Category } from '@/schemas/property.schema';

interface PropertyPricingFieldsProps {
    register: UseFormRegister<PropertyFormValues>;
    setValue: UseFormSetValue<PropertyFormValues>;
    watch: UseFormWatch<PropertyFormValues>;
    errors: FieldErrors<PropertyFormValues>;
    categories: Category[];
}

export function PropertyPricingFields({
    register,
    setValue,
    watch,
    errors,
    categories,
}: PropertyPricingFieldsProps) {
    const selectedCategoryId = watch('categoryId');
    const isAvailable = watch('isAvailable');

    const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

    const categoryDropdownItems: AppDropdownItem[] = categories.map((cat) => ({
        label: cat.name,
        onClick: () => setValue('categoryId', cat.id, { shouldValidate: true }),
        className: cat.id === selectedCategoryId ? 'font-semibold text-primary' : '',
    }));

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-primary" /> Monthly Rent ($)
                    </label>
                    <AppInput
                        type="number"
                        {...register('price')}
                        placeholder="e.g. 850"
                        className="rounded-xl border-border/80 bg-background"
                    />
                    {errors.price && (
                        <p className="text-[11px] text-destructive font-medium">{errors.price.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-primary" /> Category
                    </label>
                    <AppDropdown
                        align="start"
                        className="w-full"
                        label="Select Property Category"
                        items={categoryDropdownItems}
                        trigger={
                            <AppButton
                                type="button"
                                variant="outline"
                                className="w-full justify-between rounded-xl border-border/80 bg-background text-sm font-normal h-10 px-3"
                            >
                                <span className="truncate">
                                    {selectedCategory ? selectedCategory.name : 'Select Category'}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-70" />
                            </AppButton>
                        }
                    />
                    {errors.categoryId && (
                        <p className="text-[11px] text-destructive font-medium">{errors.categoryId.message}</p>
                    )}
                </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-foreground">Listing Availability</p>
                    <p className="text-[11px] text-muted-foreground">Mark property as ready for immediate lease applications.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setValue('isAvailable', !isAvailable)}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors bg-background cursor-pointer"
                >
                    {isAvailable ? (
                        <>
                            <CheckSquare className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Available</span>
                        </>
                    ) : (
                        <>
                            <Square className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Occupied</span>
                        </>
                    )}
                </button>
            </div>
        </>
    );
}