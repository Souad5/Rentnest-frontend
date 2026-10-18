'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { ArrowDown, ArrowUp, ImageOff, ImagePlus, Star, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { canOptimizeImage } from '@/lib/images';
import { cn } from '@/lib/utils';
import { isHttpsUrl, PROPERTY_LIMITS, type PropertyFormValues } from '@/schemas/property.schema';

function Thumb({ url }: { url: string }) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const valid = isHttpsUrl(url);
    const failed = failedUrl === url;

    return (
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
            {valid && !failed ? (
                <Image
                    src={url}
                    alt="Listing photo preview"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized={!canOptimizeImage(url)}
                    onError={() => setFailedUrl(url)}
                />
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-muted-foreground">
                    <ImageOff className="h-4 w-4" />
                    <span className="text-[10px]">{failed ? "Can't load" : 'No preview'}</span>
                </div>
            )}
        </div>
    );
}

/** Up to 10 image URLs with live previews; the first one is the cover photo. */
export function ImageUrlsField() {
    const {
        control,
        register,
        formState: { errors },
    } = useFormContext<PropertyFormValues>();
    const { fields, append, remove, move } = useFieldArray({ control, name: 'images' });
    const values = useWatch({ control, name: 'images' }) ?? [];
    const full = fields.length >= PROPERTY_LIMITS.maxImages;

    return (
        <div className="space-y-3">
            <ul className="space-y-3">
                {fields.map((field, index) => {
                    const url = values[index]?.url ?? '';
                    const error = errors.images?.[index]?.url?.message;
                    const isCover = index === 0;
                    return (
                        <li
                            key={field.id}
                            className={cn(
                                'flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center',
                                isCover ? 'border-primary/40 bg-primary/5' : 'border-border',
                            )}
                        >
                            <div className="flex items-center gap-3 sm:contents">
                                <Thumb url={url.trim()} />
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor={`image-${index}`} className="text-xs font-medium text-muted-foreground">
                                            Photo {index + 1}
                                        </label>
                                        {isCover && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                                <Star className="h-2.5 w-2.5 fill-current" /> Cover
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        id={`image-${index}`}
                                        type="url"
                                        inputMode="url"
                                        placeholder="https://images.unsplash.com/photo-…"
                                        className="h-10 rounded-xl"
                                        aria-invalid={!!error}
                                        {...register(`images.${index}.url` as const)}
                                    />
                                    {error && <p className="text-xs text-destructive">{error}</p>}
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center justify-end gap-1">
                                {!isCover && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-xl px-2.5 text-xs"
                                        onClick={() => move(index, 0)}
                                    >
                                        <Star className="h-3.5 w-3.5" /> Make cover
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-lg"
                                    disabled={index === 0}
                                    onClick={() => move(index, index - 1)}
                                    aria-label={`Move photo ${index + 1} up`}
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-lg"
                                    disabled={index === fields.length - 1}
                                    onClick={() => move(index, index + 1)}
                                    aria-label={`Move photo ${index + 1} down`}
                                >
                                    <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => remove(index)}
                                    aria-label={`Remove photo ${index + 1}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {fields.length === 0 && (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    No photos yet. Listings with photos get far more requests.
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl"
                    disabled={full}
                    onClick={() => append({ url: '' }, { shouldFocus: true })}
                >
                    <ImagePlus className="h-4 w-4" /> Add photo URL
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                    {fields.length}/{PROPERTY_LIMITS.maxImages} photos
                </span>
            </div>
            {errors.images?.message && <p className="text-xs text-destructive">{errors.images.message}</p>}
        </div>
    );
}
