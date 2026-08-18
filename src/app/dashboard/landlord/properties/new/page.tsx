'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    ArrowLeft,
    PlusCircle,
    MapPin,
    DollarSign,
    AlignLeft,
    Tag,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppDropdown, AppDropdownItem } from '@/components/shared/AppDropdown';

// Clean BASE_URL (strips trailing slash if any)
const BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || 'https://rentnest-backend-five.vercel.app/api'
).replace(/\/$/, '');

// Exact 3 categories from your API response
const DEFAULT_CATEGORIES = [
    {
        id: '7bfa5ebc-d224-4fcb-8653-eabb2c033ada',
        name: 'Apartment',
    },
    {
        id: '3221f106-cb21-4020-bb5b-283e52992653',
        name: 'Luxury Villa',
    },
    {
        id: '4331092f-4b2e-401d-9add-0fd525787e5f',
        name: 'Studio',
    },
];

interface Category {
    id: string;
    name: string;
}

export default function CreatePropertyPage() {
    const router = useRouter();

    // Default selected category is the 1st item (Apartment)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        location: '',
        price: '',
        categoryId: DEFAULT_CATEGORIES[0].id,
    });

    // Initialize state with all 3 default categories
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch dynamic categories from API with automatic fallback to DEFAULT_CATEGORIES
    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch(`${BASE_URL}/categories`);
                if (res.ok) {
                    const data = await res.json();
                    const categoryList: Category[] = Array.isArray(data)
                        ? data
                        : data.data || [];

                    if (categoryList.length > 0) {
                        setCategories(categoryList);
                    }
                }
            } catch (err) {
                console.error('API failed, using 3 default categories:', err);
            }
        }

        loadCategories();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCategorySelect = (categoryId: string) => {
        setFormData((prev) => ({
            ...prev,
            categoryId,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        // Validation
        if (formData.description.trim().length < 10) {
            setErrorMessage('Description must be at least 10 characters long.');
            setSubmitting(false);
            return;
        }

        const token =
            typeof window !== 'undefined'
                ? localStorage.getItem('token') || localStorage.getItem('accessToken')
                : '';

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            address: formData.address.trim(),
            location: formData.location.trim(),
            price: Number(formData.price),
            categoryId: formData.categoryId,
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const details = result.errorDetails.map((err: any) => err.message).join(' | ');
                    throw new Error(details || result.message);
                }
                throw new Error(result.message || 'Failed to create property listing.');
            }

            setSuccessMessage('Property listed successfully!');

            setTimeout(() => {
                router.push('/dashboard/landlord');
            }, 1500);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Find currently active category object
    const selectedCategory = categories.find((cat) => cat.id === formData.categoryId);

    // Map 3 categories to AppDropdown items
    const categoryDropdownItems: AppDropdownItem[] = categories.map((cat) => ({
        label: cat.name,
        onClick: () => handleCategorySelect(cat.id),
        className: cat.id === formData.categoryId ? 'font-semibold text-primary' : '',
    }));

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-primary" /> Property Title
                            </label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Modern 2BR Penthouse"
                                required
                                className="rounded-xl border-border/80 bg-background"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <AlignLeft className="h-3.5 w-3.5 text-primary" /> Description
                                </label>
                                <span className={`text-[10px] font-mono ${formData.description.length < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {formData.description.length}/10 chars min
                                </span>
                            </div>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide a detailed description of the property (minimum 10 characters)..."
                                rows={4}
                                required
                                minLength={10}
                                className="flex w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                        </div>

                        {/* Location & Address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Location / City
                                </label>
                                <Input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Dhaka"
                                    required
                                    className="rounded-xl border-border/80 bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Street Address
                                </label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g. Bashundhara R/A"
                                    required
                                    className="rounded-xl border-border/80 bg-background"
                                />
                            </div>
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <DollarSign className="h-3.5 w-3.5 text-primary" /> Monthly Rent ($)
                                </label>
                                <Input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="e.g. 850"
                                    required
                                    min={1}
                                    className="rounded-xl border-border/80 bg-background"
                                />
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
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={loadingCategories}
                                            className="w-full justify-between rounded-xl border-border/80 bg-background text-sm font-normal h-10 px-3"
                                        >
                                            <span className="truncate">
                                                {selectedCategory ? selectedCategory.name : 'Select Category'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-70" />
                                        </Button>
                                    }
                                />
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="rounded-xl text-xs font-semibold"
                            >
                                <Link href="/dashboard/landlord">Cancel</Link>
                            </Button>

                            <Button
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
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}