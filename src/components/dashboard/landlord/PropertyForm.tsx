'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/shared/Switch';
import { AmenitiesInput } from '@/components/dashboard/landlord/AmenitiesInput';
import { ImageUrlsField } from '@/components/dashboard/landlord/ImageUrlsField';
import { AiDescriptionWriter } from '@/components/dashboard/landlord/AiDescriptionWriter';
import { errorMessage } from '@/components/dashboard/landlord/shared';
import { landlordApi, propertiesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    emptyPropertyForm,
    PROPERTY_LIMITS,
    propertyFormSchema,
    toPropertyPayload,
    type PropertyFormValues,
} from '@/schemas/property.schema';

interface PropertyFormProps {
    mode: 'create' | 'edit';
    propertyId?: string;
    initialValues?: PropertyFormValues;
}

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-xs text-destructive">{message}</p> : null;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5">
                <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
            </div>
            {children}
        </section>
    );
}

/** Shared create / edit form for landlord listings. */
export function PropertyForm({ mode, propertyId, initialValues }: PropertyFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: () => propertiesApi.categories().then((r) => r.data),
    });
    const categories = categoriesQuery.data ?? [];

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertyFormSchema),
        defaultValues: initialValues ?? emptyPropertyForm,
        mode: 'onTouched',
    });
    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
    } = form;

    const descriptionLength = useWatch({ control, name: 'description' })?.length ?? 0;

    const onSubmit = async (values: PropertyFormValues) => {
        const payload = toPropertyPayload(values);
        try {
            if (mode === 'create') {
                await landlordApi.create(payload);
                toast.success('Listing published', { description: `${payload.title} is now visible to tenants.` });
            } else if (propertyId) {
                await landlordApi.update(propertyId, payload);
                toast.success('Listing updated');
            }
            await queryClient.invalidateQueries({ queryKey: ['landlord'] });
            router.push('/dashboard/landlord/properties');
        } catch (error) {
            toast.error(errorMessage(error, 'Could not save the listing.'));
        }
    };

    const onInvalid = () => toast.error('Please fix the highlighted fields.');

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-6">
                <Section title="Basics" description="What tenants see first in search results.">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="title">Listing title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Bright 3-bed apartment near Gulshan 2 circle"
                                className="h-10 rounded-xl"
                                maxLength={PROPERTY_LIMITS.titleMax}
                                aria-invalid={!!errors.title}
                                {...register('title')}
                            />
                            <FieldError message={errors.title?.message} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="categoryId">Category</Label>
                            <Controller
                                control={control}
                                name="categoryId"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} disabled={categoriesQuery.isPending}>
                                        <SelectTrigger
                                            id="categoryId"
                                            className="w-full rounded-xl data-[size=default]:h-10"
                                            aria-invalid={!!errors.categoryId}
                                            onBlur={field.onBlur}
                                        >
                                            <SelectValue placeholder={categoriesQuery.isPending ? 'Loading categories…' : 'Choose a category'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {categoriesQuery.isError ? (
                                <p className="text-xs text-destructive">
                                    Could not load categories.{' '}
                                    <button type="button" className="font-semibold underline" onClick={() => categoriesQuery.refetch()}>
                                        Retry
                                    </button>
                                </p>
                            ) : (
                                <FieldError message={errors.categoryId?.message} />
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="price">Monthly rent (USD)</Label>
                            <Input
                                id="price"
                                type="number"
                                inputMode="decimal"
                                min={1}
                                step="any"
                                placeholder="850"
                                className="h-10 rounded-xl"
                                aria-invalid={!!errors.price}
                                {...register('price')}
                            />
                            <FieldError message={errors.price?.message} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="location">Area / city</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Dhanmondi, Dhaka"
                                className="h-10 rounded-xl"
                                aria-invalid={!!errors.location}
                                {...register('location')}
                            />
                            <FieldError message={errors.location?.message} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="address">Street address</Label>
                            <Input
                                id="address"
                                placeholder="e.g. House 27, Road 9A"
                                className="h-10 rounded-xl"
                                aria-invalid={!!errors.address}
                                {...register('address')}
                            />
                            <FieldError message={errors.address?.message} />
                        </div>
                    </div>
                </Section>

                <Section title="Details & amenities" description="Optional, but listings with full details get more requests.">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="bedrooms">Bedrooms</Label>
                            <Input id="bedrooms" type="number" inputMode="numeric" min={0} max={50} className="h-10 rounded-xl" aria-invalid={!!errors.bedrooms} {...register('bedrooms')} />
                            <FieldError message={errors.bedrooms?.message} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="bathrooms">Bathrooms</Label>
                            <Input id="bathrooms" type="number" inputMode="numeric" min={0} max={50} className="h-10 rounded-xl" aria-invalid={!!errors.bathrooms} {...register('bathrooms')} />
                            <FieldError message={errors.bathrooms?.message} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="areaSqft">Area (sq ft)</Label>
                            <Input id="areaSqft" type="number" inputMode="numeric" min={1} max={100000} className="h-10 rounded-xl" aria-invalid={!!errors.areaSqft} {...register('areaSqft')} />
                            <FieldError message={errors.areaSqft?.message} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-3">
                            <Label htmlFor="amenities">Amenities</Label>
                            <Controller
                                control={control}
                                name="amenities"
                                render={({ field }) => (
                                    <AmenitiesInput id="amenities" value={field.value} onChange={field.onChange} invalid={!!errors.amenities} />
                                )}
                            />
                            <FieldError message={errors.amenities?.message} />
                        </div>
                    </div>
                </Section>

                <Section title="Photos" description={`Paste up to ${PROPERTY_LIMITS.maxImages} https image links. The first photo is the cover.`}>
                    <ImageUrlsField />
                </Section>

                <Section title="Description" description="Describe the home, the building and the neighbourhood.">
                    <div className="space-y-4">
                        <AiDescriptionWriter categories={categories} />
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description">Description</Label>
                                <span
                                    className={cn(
                                        'text-xs tabular-nums',
                                        descriptionLength > PROPERTY_LIMITS.descriptionMax ? 'text-destructive' : 'text-muted-foreground',
                                    )}
                                >
                                    {descriptionLength}/{PROPERTY_LIMITS.descriptionMax}
                                </span>
                            </div>
                            <Textarea
                                id="description"
                                rows={8}
                                placeholder="Sunlit rooms, cross ventilation, 24/7 generator backup, a short walk to schools and the market…"
                                className="rounded-xl"
                                aria-invalid={!!errors.description}
                                {...register('description')}
                            />
                            <FieldError message={errors.description?.message} />
                        </div>
                    </div>
                </Section>

                {mode === 'edit' && (
                    <Section title="Availability">
                        <Controller
                            control={control}
                            name="isAvailable"
                            render={({ field }) => (
                                <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                                    <div>
                                        <Label htmlFor="isAvailable" className="text-sm font-semibold">
                                            {field.value ? 'Accepting requests' : 'Hidden from search'}
                                        </Label>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Unavailable listings stay in your portfolio but tenants can&apos;t find or request them.
                                        </p>
                                    </div>
                                    <Switch id="isAvailable" checked={field.value} onCheckedChange={field.onChange} />
                                </div>
                            )}
                        />
                    </Section>
                )}

                <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border">
                    <Button asChild variant="outline" className="h-10 rounded-xl">
                        <Link href="/dashboard/landlord/properties">Cancel</Link>
                    </Button>
                    <Button type="submit" className="h-10 rounded-xl px-5" disabled={isSubmitting || (mode === 'edit' && !isDirty)}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {mode === 'create' ? 'Publish listing' : 'Save changes'}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
