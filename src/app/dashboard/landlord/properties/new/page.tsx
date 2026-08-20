'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Building2,
    ArrowLeft,
    PlusCircle,
    AlignLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppButton } from '@/components/shared/AppButton';

import {
    propertySchema,
    PropertyFormValues,
    DEFAULT_CATEGORIES,
    Category,
} from '@/schemas/property.schema';
import { PropertyLocationFields } from './components/PropertyLocationFields';
import { PropertyPricingFields } from './components/PropertyPricingFields';
import { PropertyImageFields } from './components/PropertyImageFields';
const BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || 'https://rentnest-backend-five.vercel.app/api'
).replace(/\/$/, '');

export default function CreatePropertyPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: '',
            description: '',
            address: '',
            location: '',
            price: 0,
            categoryId: DEFAULT_CATEGORIES[0].id,
            isAvailable: true,
            images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750' }],
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const descriptionValue = watch('description') || '';

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch(`${BASE_URL}/categories`);
                if (res.ok) {
                    const data = await res.json();
                    const categoryList: Category[] = Array.isArray(data) ? data : data.data || [];
                    if (categoryList.length > 0) {
                        setCategories(categoryList);
                    }
                }
            } catch (err) {
                console.error('API failed, using fallback categories:', err);
            }
        }
        loadCategories();
    }, []);

    const onSubmit = async (data: PropertyFormValues) => {
        setSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const token =
            typeof window !== 'undefined'
                ? localStorage.getItem('token') || localStorage.getItem('accessToken')
                : '';

        const payload = {
            ...data,
            title: data.title.trim(),
            description: data.description.trim(),
            address: data.address.trim(),
            location: data.location.trim(),
            images: data.images.map((img) => img.url.trim()),
        };

        try {
            const response = await fetch(`${BASE_URL}/properties/landlord`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errorDetails && Array.isArray(result.errorDetails)) {
                    const details = result.errorDetails
                        .map((err: { message: string }) => err.message)
                        .join(' | ');
                    throw new Error(details || result.message);
                }
                throw new Error(result.message || 'Failed to create property listing.');
            }

            setSuccessMessage('Property listed successfully!');
            setTimeout(() => {
                router.push('/dashboard/landlord');
            }, 1500);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setErrorMessage(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground rounded-xl">
                    <Link href="/dashboard/landlord">
                        <ArrowLeft className="h-4 w-4" /> Back to Workspace
                    </Link>
                </Button>
                <Badge variant="outline" className="text-xs font-mono">
                    POST /properties/landlord
                </Badge>
            </div>

            <Card className="rounded-3xl border-border/80 shadow-md bg-card/60 backdrop-blur-xl">
                <CardHeader className="space-y-1.5 border-b border-border/60 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <PlusCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">Create Property Listing</CardTitle>
                            <CardDescription className="text-xs">
                                Post a new rental property directly to your landlord workspace.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {errorMessage && (
                        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2.5">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{successMessage} Redirecting to landlord portal...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-primary" /> Property Title
                            </label>
                            <Input
                                {...register('title')}
                                placeholder="e.g. Modern 2BR Penthouse"
                                className="rounded-xl border-border/80 bg-background"
                            />
                            {errors.title && (
                                <p className="text-[11px] text-destructive font-medium">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <AlignLeft className="h-3.5 w-3.5 text-primary" /> Description
                                </label>
                                <span
                                    className={`text-[10px] font-mono ${descriptionValue.length < 10 ? 'text-amber-500' : 'text-emerald-500'
                                        }`}
                                >
                                    {descriptionValue.length}/10 chars min
                                </span>
                            </div>
                            <textarea
                                {...register('description')}
                                placeholder="Provide a detailed description of the property..."
                                rows={4}
                                className="flex w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                            {errors.description && (
                                <p className="text-[11px] text-destructive font-medium">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Modular Form Sections */}
                        <PropertyLocationFields register={register} errors={errors} />

                        <PropertyPricingFields
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            errors={errors}
                            categories={categories}
                        />

                        <PropertyImageFields control={control} register={register} errors={errors} />

                        {/* Submit Actions */}
                        <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
                            <AppButton
                                type="button"
                                variant="outline"
                                asChild
                                className="rounded-xl text-xs font-semibold"
                            >
                                <Link href="/dashboard/landlord">Cancel</Link>
                            </AppButton>

                            <AppButton
                                type="submit"
                                disabled={submitting}
                                className="rounded-xl text-xs font-bold gap-2 px-6 shadow-sm shadow-primary/20"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="h-4 w-4" /> Publish Property
                                    </>
                                )}
                            </AppButton>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}