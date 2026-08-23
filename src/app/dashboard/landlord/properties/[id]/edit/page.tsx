'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Save,
    Building2,
    Loader2,
    AlertCircle,
    ShieldAlert,
    ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RoleGuard from '@/components/guard/RoleGuard';
import { AppButton } from '@/components/shared/AppButton';
import { AppDropdown, AppDropdownItem } from '@/components/shared/AppDropdown';
import { AppInput } from '@/components/shared/AppInput';
import { useAuth } from '@/providers/AuthProvider';
import { propertiesApi, landlordApi, ApiProperty, ApiError } from '@/lib/api';

interface EditPropertyPageProps {
    params: Promise<{ id: string }>;
}

interface EditFormData {
    title: string;
    location: string;
    address: string;
    price: number;
    description: string;
    categoryId: string;
    isAvailable: 'true' | 'false';
    imageUrl: string;
}

function EditPropertyForm({ id }: { id: string }) {
    const router = useRouter();
    const { user } = useAuth();

    const [formData, setFormData] = useState<EditFormData>({
        title: '',
        location: '',
        address: '',
        price: 0,
        description: '',
        categoryId: '',
        isAvailable: 'true',
        imageUrl: '',
    });
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const [propertyRes, categoriesRes] = await Promise.all([
                    propertiesApi.getById(id),
                    propertiesApi.getCategories().catch(() => null),
                ]);

                const propertyResData = propertyRes as unknown as
                    | { data?: ApiProperty }
                    | ApiProperty;
                const property: ApiProperty = ('data' in propertyResData &&
                    propertyResData.data
                    ? propertyResData.data
                    : propertyResData) as ApiProperty;

                if (categoriesRes) {
                    const catResData = categoriesRes as unknown as
                        | { data?: Array<{ id: string; name: string }> }
                        | Array<{ id: string; name: string }>;
                    const list = Array.isArray(catResData) ? catResData : catResData.data || [];
                    setCategories(list);
                }

                // Frontend ownership gate mirrors the backend's landlordId
                // check; the API remains authoritative either way.
                if (user && property.landlordId !== user.id && property.landlord?.id !== user.id) {
                    throw new Error('You can only edit your own property listings.');
                }

                setFormData({
                    title: property.title || '',
                    location: property.location || '',
                    address: property.address || property.location || '',
                    price: Number(property.price) || 0,
                    description: property.description || '',
                    categoryId: property.categoryId || property.category?.id || '',
                    isAvailable: property.isAvailable === false ? 'false' : 'true',
                    imageUrl: property.imageUrl || '',
                });
            } catch (err) {
                if (err instanceof ApiError && err.status === 404) {
                    setLoadError('This property does not exist.');
                } else {
                    setLoadError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to load property details.'
                    );
                }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id, user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const validate = (): string | null => {
        if (formData.title.trim().length < 3) return 'Title must be at least 3 characters long.';
        if (formData.description.trim().length < 10)
            return 'Description must be at least 10 characters long.';
        if (formData.address.trim().length < 3) return 'Address is required.';
        if (formData.location.trim().length < 2) return 'Location is required.';
        if (!(Number(formData.price) > 0)) return 'Price must be greater than 0.';
        const url = formData.imageUrl.trim();
        if (url && !/^https?:\/\/.+/.test(url)) return 'Image URL must be a valid URL.';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;

        const validationError = validate();
        if (validationError) {
            setFormError(validationError);
            return;
        }
        setFormError(null);
        setIsSaving(true);

        try {
            // PUT /properties/landlord/:id accepts every field as optional;
            // only send what this form manages so unrelated data stays intact.
            await landlordApi.updateProperty(id, {
                title: formData.title.trim(),
                description: formData.description.trim(),
                address: formData.address.trim(),
                location: formData.location.trim(),
                price: Number(formData.price),
                ...(formData.categoryId ? { categoryId: formData.categoryId } : {}),
                isAvailable: formData.isAvailable === 'true',
                ...(formData.imageUrl.trim()
                    ? { imageUrl: formData.imageUrl.trim() }
                    : { imageUrl: null }),
            });

            toast.success('Property updated');
            router.push('/dashboard/landlord');
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : 'Failed to save changes. Please try again.';
            setFormError(message);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    // Frontend ownership gate mirrors the backend's landlordId check; the API
    // remains authoritative and will reject foreign ids regardless.
    if (isLoading) {
        return (
            <div className="py-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading property details...
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="max-w-md mx-auto my-12 text-center p-8 border border-border rounded-2xl bg-card space-y-4">
                <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-lg font-bold text-foreground">Cannot edit listing</h2>
                <p className="text-xs text-muted-foreground">{loadError}</p>
                <AppButton asChild size="sm" variant="outline">
                    <Link href="/dashboard/landlord">Back to Dashboard</Link>
                </AppButton>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-4 max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <AppButton asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/dashboard/landlord">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                </AppButton>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" /> Edit Property Listing
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {formError && (
                        <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Listing Title</label>
                            <AppInput
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Modern Luxury Apartment Downtown"
                                required
                            />
                        </div>

                        {/* Location & Address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">City / Neighborhood</label>
                                <AppInput
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Downtown, San Francisco"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Full Address</label>
                                <AppInput
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g. 124 Financial District Blvd"
                                    required
                                />
                            </div>
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Monthly Rent ($)</label>
                                <AppInput
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min={0}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Category</label>
                                <AppDropdown
                                    align="start"
                                    className="w-full"
                                    label="Select Property Category"
                                    items={[
                                        {
                                            label: 'Keep current',
                                            onClick: () =>
                                                setFormData((prev) => ({ ...prev, categoryId: '' })),
                                            className:
                                                formData.categoryId === ''
                                                    ? 'font-semibold text-primary'
                                                    : '',
                                        },
                                        ...categories.map(
                                            (cat): AppDropdownItem => ({
                                                label: cat.name,
                                                onClick: () =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        categoryId: cat.id,
                                                    })),
                                                className:
                                                    cat.id === formData.categoryId
                                                        ? 'font-semibold text-primary'
                                                        : '',
                                            })
                                        ),
                                    ]}
                                    trigger={
                                        <AppButton
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between rounded-md border-input bg-background text-sm font-normal h-9 px-3"
                                        >
                                            <span className="truncate">
                                                {categories.find((cat) => cat.id === formData.categoryId)
                                                    ?.name || 'Keep current'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-70" />
                                        </AppButton>
                                    }
                                />
                            </div>
                        </div>

                        {/* Availability & Cover Image */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Status</label>
                                <AppDropdown
                                    align="start"
                                    className="w-full"
                                    label="Listing Status"
                                    items={[
                                        {
                                            label: 'Available',
                                            onClick: () =>
                                                setFormData((prev) => ({ ...prev, isAvailable: 'true' })),
                                            className:
                                                formData.isAvailable === 'true'
                                                    ? 'font-semibold text-primary'
                                                    : '',
                                        },
                                        {
                                            label: 'Rented / Unavailable',
                                            onClick: () =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    isAvailable: 'false',
                                                })),
                                            className:
                                                formData.isAvailable === 'false'
                                                    ? 'font-semibold text-primary'
                                                    : '',
                                        },
                                    ]}
                                    trigger={
                                        <AppButton
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between rounded-md border-input bg-background text-sm font-normal h-9 px-3"
                                        >
                                            <span className="truncate">
                                                {formData.isAvailable === 'true'
                                                    ? 'Available'
                                                    : 'Rented / Unavailable'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-70" />
                                        </AppButton>
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Cover Image URL</label>
                                <AppInput
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Live image preview */}
                        {formData.imageUrl.trim() !== '' &&
                            /^https?:\/\/.+/.test(formData.imageUrl.trim()) && (
                                <div className="space-y-1.5">
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                        Preview
                                    </p>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.imageUrl.trim()}
                                        alt="Cover preview"
                                        className="h-36 w-full max-w-md object-cover rounded-xl border border-border"
                                    />
                                </div>
                            )}

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Write a detailed description of the property..."
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <AppButton asChild variant="outline">
                                <Link href="/dashboard/landlord">Cancel</Link>
                            </AppButton>
                            <AppButton type="submit" disabled={isSaving} className="gap-2">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" /> Save Changes
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

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
    const { id } = use(params);

    return (
        <RoleGuard allowedRoles={['LANDLORD']}>
            <EditPropertyForm id={id} />
        </RoleGuard>
    );
}
