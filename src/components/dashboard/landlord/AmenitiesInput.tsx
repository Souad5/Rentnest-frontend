'use client';

import { useId, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PROPERTY_LIMITS } from '@/schemas/property.schema';
import { cn } from '@/lib/utils';

// Amenities tenants in Bangladesh most often filter and ask for.
export const AMENITY_SUGGESTIONS = [
    'Air conditioning',
    'Wi-Fi',
    'Generator backup',
    'IPS backup',
    'Lift',
    'Gas line',
    'Car parking',
    'Security guard',
    'CCTV',
    'Intercom',
    'Balcony',
    'Rooftop access',
    'Fully furnished',
    'Semi furnished',
    'Water heater',
    'Deep tube well',
    'Gym',
    'Swimming pool',
    'Prayer room',
    'Pet friendly',
];

interface AmenitiesInputProps {
    value: string[];
    onChange: (next: string[]) => void;
    invalid?: boolean;
    id?: string;
}

/** Tag input: Enter or comma adds, Backspace on an empty input removes the last tag. */
export function AmenitiesInput({ value, onChange, invalid, id }: AmenitiesInputProps) {
    const [draft, setDraft] = useState('');
    const fallbackId = useId();
    const inputId = id ?? fallbackId;
    const full = value.length >= PROPERTY_LIMITS.maxAmenities;

    const add = (raw: string) => {
        const tag = raw.trim().replace(/\s+/g, ' ').slice(0, PROPERTY_LIMITS.amenityMax);
        if (!tag || full) return;
        if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
        onChange([...value, tag]);
    };

    const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

    const suggestions = AMENITY_SUGGESTIONS.filter(
        (s) =>
            !value.some((v) => v.toLowerCase() === s.toLowerCase()) &&
            (!draft.trim() || s.toLowerCase().includes(draft.trim().toLowerCase())),
    ).slice(0, 10);

    return (
        <div className="space-y-3">
            <div
                className={cn(
                    'flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-input bg-transparent p-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
                    invalid && 'border-destructive',
                )}
            >
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1 text-xs font-medium text-primary"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => remove(tag)}
                            className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
                            aria-label={`Remove ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    id={inputId}
                    value={draft}
                    disabled={full}
                    onChange={(e) => {
                        const next = e.target.value;
                        if (next.endsWith(',')) {
                            add(next.slice(0, -1));
                            setDraft('');
                        } else {
                            setDraft(next);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add(draft);
                            setDraft('');
                        } else if (e.key === 'Backspace' && !draft && value.length) {
                            remove(value[value.length - 1]);
                        }
                    }}
                    onBlur={() => {
                        if (draft.trim()) {
                            add(draft);
                            setDraft('');
                        }
                    }}
                    placeholder={full ? 'Maximum reached' : value.length ? 'Add another…' : 'Type an amenity and press Enter'}
                    className="h-7 min-w-32 flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                    aria-label="Add amenity"
                />
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Press Enter or comma to add.</span>
                <span className="tabular-nums">
                    {value.length}/{PROPERTY_LIMITS.maxAmenities}
                </span>
            </div>
            {suggestions.length > 0 && !full && (
                <div className="flex flex-wrap gap-1.5" aria-label="Suggested amenities">
                    {suggestions.map((s) => (
                        <Button
                            key={s}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 rounded-full px-2.5 text-xs font-normal"
                            onClick={() => {
                                add(s);
                                setDraft('');
                            }}
                        >
                            <Plus className="h-3 w-3" /> {s}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
