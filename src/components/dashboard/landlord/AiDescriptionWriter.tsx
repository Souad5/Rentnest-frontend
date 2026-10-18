'use client';

import { useMutation } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Check, Loader2, Plus, RefreshCw, Sparkles, TriangleAlert, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { aiApi, ApiError } from '@/lib/api';
import { PROPERTY_LIMITS, type PropertyFormValues } from '@/schemas/property.schema';
import type { Category, PropertyDescriptionInput } from '@/types/api';

function aiErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 503 && /not configured/i.test(error.message))
            return "The AI writer isn't set up on this server yet. You can still write the description yourself.";
        if (error.status === 429) return 'Too many AI requests in a short time. Wait a minute and try again.';
        if (error.status === 401 || error.status === 403) return 'Only landlords can use the AI writer. Please sign in again.';
        return error.message;
    }
    return 'Could not reach the AI writer. Check your connection and try again.';
}

const optionalInt = (v: string) => (v.trim() && /^\d+$/.test(v.trim()) ? Number(v) : undefined);

/** "Write with AI": drafts a description from the filled-in fields, previewed before applying. */
export function AiDescriptionWriter({ categories }: { categories: Category[] }) {
    const { control, getValues, setValue, trigger } = useFormContext<PropertyFormValues>();
    // Subscribed (not getValues) so the suggestion button stays in sync with tags added by hand.
    const currentAmenities = useWatch({ control, name: 'amenities' }) ?? [];

    const mutation = useMutation({
        mutationFn: (input: PropertyDescriptionInput) => aiApi.propertyDescription(input).then((r) => r.data),
        onError: (error) => toast.error(aiErrorMessage(error)),
    });

    const generate = async () => {
        const ok = await trigger(['title', 'location']);
        if (!ok) {
            toast.error('Add a title and location first — the AI writer needs them.');
            return;
        }
        const v = getValues();
        const price = Number(v.price);
        const notes = v.description.trim();
        mutation.mutate({
            title: v.title.trim(),
            location: v.location.trim(),
            ...(v.address.trim() ? { address: v.address.trim() } : {}),
            ...(categories.find((c) => c.id === v.categoryId)?.name
                ? { category: categories.find((c) => c.id === v.categoryId)!.name }
                : {}),
            ...(optionalInt(v.bedrooms) !== undefined ? { bedrooms: optionalInt(v.bedrooms) } : {}),
            ...(optionalInt(v.bathrooms) !== undefined ? { bathrooms: optionalInt(v.bathrooms) } : {}),
            ...(optionalInt(v.areaSqft) ? { areaSqft: optionalInt(v.areaSqft) } : {}),
            ...(v.amenities.length ? { amenities: v.amenities } : {}),
            ...(Number.isFinite(price) && price > 0 ? { price } : {}),
            ...(notes ? { notes: notes.slice(0, 1000) } : {}),
        });
    };

    const result = mutation.data;
    const newAmenities = (result?.suggestedAmenities ?? []).filter(
        (s) => !currentAmenities.some((a) => a.toLowerCase() === s.toLowerCase()),
    );

    const applyDescription = () => {
        if (!result) return;
        setValue('description', result.description.slice(0, PROPERTY_LIMITS.descriptionMax), {
            shouldDirty: true,
            shouldValidate: true,
        });
        toast.success('Description added — feel free to edit it.');
    };

    const addAmenities = () => {
        const existing = getValues('amenities');
        const merged = [...existing];
        for (const a of result?.suggestedAmenities ?? []) {
            if (merged.length >= PROPERTY_LIMITS.maxAmenities) break;
            if (merged.some((m) => m.toLowerCase() === a.toLowerCase())) continue;
            merged.push(a.slice(0, PROPERTY_LIMITS.amenityMax));
        }
        setValue('amenities', merged, { shouldDirty: true, shouldValidate: true });
        toast.success(`${merged.length - existing.length} amenities added`);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    Fill in the title, location and details above, then let AI draft the description.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={generate}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {mutation.isPending ? 'Writing…' : result ? 'Regenerate' : 'Write with AI'}
                </Button>
            </div>

            {mutation.isError && !mutation.isPending && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{aiErrorMessage(mutation.error)}</span>
                </div>
            )}

            {result && (
                <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-4" aria-live="polite">
                    <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                            <Sparkles className="h-4 w-4 text-primary" /> AI draft
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg"
                            onClick={() => mutation.reset()}
                            aria-label="Dismiss AI draft"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{result.description}</p>

                    {result.highlights.length > 0 && (
                        <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Highlights</p>
                            <ul className="space-y-1">
                                {result.highlights.map((h) => (
                                    <li key={h} className="flex items-start gap-2 text-sm text-foreground">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.suggestedAmenities.length > 0 && (
                        <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Suggested amenities
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {result.suggestedAmenities.map((a) => (
                                    <span key={a} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 border-t border-primary/20 pt-3">
                        <Button type="button" className="h-9 rounded-xl" onClick={applyDescription}>
                            <Check className="h-4 w-4" /> Use this description
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-xl"
                            onClick={addAmenities}
                            disabled={newAmenities.length === 0 || currentAmenities.length >= PROPERTY_LIMITS.maxAmenities}
                        >
                            <Plus className="h-4 w-4" />
                            {newAmenities.length ? `Add ${newAmenities.length} suggested amenities` : 'Amenities already added'}
                        </Button>
                        <Button type="button" variant="ghost" className="h-9 rounded-xl" onClick={generate} disabled={mutation.isPending}>
                            <RefreshCw className="h-4 w-4" /> Regenerate
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
