'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Category, LocationStat } from '@/types/api';
import { BEDROOM_OPTIONS, RATING_OPTIONS } from './explore-params';

const ANY = 'any';

export interface FilterValues {
    /** Resolved category id ('' = any). */
    categoryId: string;
    location: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    minRating: string;
}

interface FilterControlsProps {
    values: FilterValues;
    categories: Category[];
    locations: LocationStat[];
    optionsLoading?: boolean;
    onChange: (key: keyof FilterValues, value: string | null) => void;
    layout: 'bar' | 'stack';
}

/**
 * The six explore filters. Rendered as a 6-column bar on desktop and a stacked
 * list inside the mobile filter sheet. Every change writes straight to the URL.
 */
export function FilterControls({ values, categories, locations, optionsLoading, onChange, layout }: FilterControlsProps) {
    const uid = useId();
    const locationOptions = locations.map((l) => l.location);
    // Keep an incoming location (from AI search or a shared link) selectable even if it isn't in the top 50.
    if (values.location && !locationOptions.some((l) => l.toLowerCase() === values.location.toLowerCase())) {
        locationOptions.unshift(values.location);
    }
    const priceInvalid = values.minPrice !== '' && values.maxPrice !== '' && Number(values.minPrice) > Number(values.maxPrice);

    return (
        <div className={cn(layout === 'bar' ? 'grid grid-cols-6 gap-3' : 'space-y-5')}>
            <Field label="Category" htmlFor={`${uid}-category`}>
                <Select
                    value={values.categoryId || ANY}
                    onValueChange={(v) => onChange('categoryId', v === ANY ? null : v)}
                    disabled={optionsLoading && categories.length === 0}
                >
                    <SelectTrigger id={`${uid}-category`} className="h-10 w-full rounded-xl bg-background">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value={ANY}>All categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                                {typeof c.propertyCount === 'number' && (
                                    <span className="text-muted-foreground"> ({c.propertyCount})</span>
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Location" htmlFor={`${uid}-location`}>
                <Select
                    value={
                        values.location
                            ? (locationOptions.find((l) => l.toLowerCase() === values.location.toLowerCase()) ?? values.location)
                            : ANY
                    }
                    onValueChange={(v) => onChange('location', v === ANY ? null : v)}
                    disabled={optionsLoading && locationOptions.length === 0}
                >
                    <SelectTrigger id={`${uid}-location`} className="h-10 w-full rounded-xl bg-background">
                        <SelectValue placeholder="Anywhere" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-72">
                        <SelectItem value={ANY}>Anywhere</SelectItem>
                        {locationOptions.map((loc) => {
                            const stat = locations.find((l) => l.location === loc);
                            return (
                                <SelectItem key={loc} value={loc}>
                                    {loc}
                                    {stat && <span className="text-muted-foreground"> ({stat.count})</span>}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Min price ($/mo)" htmlFor={`${uid}-min`}>
                <DebouncedNumberInput
                    id={`${uid}-min`}
                    value={values.minPrice}
                    placeholder="No min"
                    invalid={priceInvalid}
                    onCommit={(v) => onChange('minPrice', v)}
                />
            </Field>

            <Field
                label="Max price ($/mo)"
                htmlFor={`${uid}-max`}
                error={priceInvalid ? 'Max should be higher than min' : undefined}
            >
                <DebouncedNumberInput
                    id={`${uid}-max`}
                    value={values.maxPrice}
                    placeholder="No max"
                    invalid={priceInvalid}
                    onCommit={(v) => onChange('maxPrice', v)}
                />
            </Field>

            <Field label="Bedrooms" htmlFor={`${uid}-beds`}>
                <Select value={values.bedrooms || ANY} onValueChange={(v) => onChange('bedrooms', v === ANY ? null : v)}>
                    <SelectTrigger id={`${uid}-beds`} className="h-10 w-full rounded-xl bg-background">
                        <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value={ANY}>Any</SelectItem>
                        {BEDROOM_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                                {n}+ bedrooms
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Minimum rating" htmlFor={`${uid}-rating`}>
                <Select value={values.minRating || ANY} onValueChange={(v) => onChange('minRating', v === ANY ? null : v)}>
                    <SelectTrigger id={`${uid}-rating`} className="h-10 w-full rounded-xl bg-background">
                        <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value={ANY}>Any rating</SelectItem>
                        {RATING_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                                {n}+ stars
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
        </div>
    );
}

function Field({
    label,
    htmlFor,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-1.5">
            <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
                {label}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

/** Number input that commits to the URL 500ms after the user stops typing. */
function DebouncedNumberInput({
    id,
    value,
    placeholder,
    invalid,
    onCommit,
}: {
    id: string;
    value: string;
    placeholder: string;
    invalid?: boolean;
    onCommit: (value: string | null) => void;
}) {
    const [draft, setDraft] = useState(value);
    const [synced, setSynced] = useState(value);
    // Follow external URL changes (chip removed, "Clear all").
    if (value !== synced) {
        setSynced(value);
        setDraft(value);
    }

    const commitRef = useRef(onCommit);
    useEffect(() => {
        commitRef.current = onCommit;
    }, [onCommit]);

    useEffect(() => {
        if (draft === value) return;
        const timer = setTimeout(() => commitRef.current(draft === '' ? null : draft), 500);
        return () => clearTimeout(timer);
    }, [draft, value]);

    return (
        <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            value={draft}
            placeholder={placeholder}
            aria-invalid={invalid || undefined}
            onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
            className="h-10 rounded-xl bg-background"
        />
    );
}
