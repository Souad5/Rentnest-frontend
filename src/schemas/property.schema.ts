import { z } from 'zod';
import type { PropertyDetail, PropertyInput, PropertySummary } from '@/types/api';

// Limits mirror the backend validation (src/validations/property.validation.ts).
export const PROPERTY_LIMITS = {
    titleMax: 150,
    descriptionMin: 10,
    descriptionMax: 5000,
    maxImages: 10,
    maxAmenities: 20,
    amenityMax: 60,
} as const;

export function isHttpsUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !!url.hostname;
    } catch {
        return false;
    }
}

/** Optional whole-number field kept as a string while editing ('' = not set). */
const optionalInt = (label: string, min: number, max: number) =>
    z
        .string()
        .trim()
        .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= min && Number(v) <= max), {
            message: `${label} must be a whole number from ${min} to ${max}`,
        });

export const propertyFormSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(PROPERTY_LIMITS.titleMax, `Title must be ${PROPERTY_LIMITS.titleMax} characters or fewer`),
    categoryId: z.string().min(1, 'Choose a category'),
    price: z
        .string()
        .trim()
        .min(1, 'Enter the monthly rent')
        .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, 'Rent must be greater than 0')
        .refine((v) => Number(v) <= 1_000_000, 'Rent must be 1,000,000 or less'),
    location: z.string().trim().min(2, 'Enter the area or city').max(120, 'Location must be 120 characters or fewer'),
    address: z.string().trim().min(3, 'Enter the street address').max(300, 'Address must be 300 characters or fewer'),
    bedrooms: optionalInt('Bedrooms', 0, 50),
    bathrooms: optionalInt('Bathrooms', 0, 50),
    areaSqft: optionalInt('Area', 1, 100000),
    amenities: z
        .array(z.string().trim().min(1).max(PROPERTY_LIMITS.amenityMax))
        .max(PROPERTY_LIMITS.maxAmenities, `Add at most ${PROPERTY_LIMITS.maxAmenities} amenities`),
    images: z
        .array(
            z.object({
                url: z
                    .string()
                    .trim()
                    .max(2048, 'URL is too long')
                    .refine((v) => v === '' || isHttpsUrl(v), 'Use a full https:// image URL'),
            }),
        )
        .max(PROPERTY_LIMITS.maxImages, `Add at most ${PROPERTY_LIMITS.maxImages} images`),
    isAvailable: z.boolean(),
    description: z
        .string()
        .trim()
        .min(PROPERTY_LIMITS.descriptionMin, `Description must be at least ${PROPERTY_LIMITS.descriptionMin} characters`)
        .max(PROPERTY_LIMITS.descriptionMax, `Description must be ${PROPERTY_LIMITS.descriptionMax} characters or fewer`),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const emptyPropertyForm: PropertyFormValues = {
    title: '',
    categoryId: '',
    price: '',
    location: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    areaSqft: '',
    amenities: [],
    images: [{ url: '' }],
    isAvailable: true,
    description: '',
};

const toOptionalNumber = (value: string) => (value.trim() === '' ? null : Number(value));

/**
 * Converts form values to the API payload. Empty optional numbers become
 * `null` so an edit can clear them (the backend accepts null).
 */
export function toPropertyPayload(values: PropertyFormValues): PropertyInput {
    const images = values.images.map((i) => i.url.trim()).filter(Boolean);
    const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        address: values.address.trim(),
        location: values.location.trim(),
        price: Number(values.price),
        categoryId: values.categoryId,
        images,
        bedrooms: toOptionalNumber(values.bedrooms),
        bathrooms: toOptionalNumber(values.bathrooms),
        areaSqft: toOptionalNumber(values.areaSqft),
        amenities: values.amenities,
        isAvailable: values.isAvailable,
    };
    // PropertyInput types optional numbers as `number | undefined`; null is the
    // backend's documented way to clear them.
    return payload as unknown as PropertyInput;
}

export function propertyToFormValues(property: PropertyDetail | PropertySummary): PropertyFormValues {
    const images = property.images?.length ? property.images : property.imageUrl ? [property.imageUrl] : [];
    return {
        title: property.title ?? '',
        categoryId: property.categoryId ?? property.category?.id ?? '',
        price: property.price != null ? String(property.price) : '',
        location: property.location ?? '',
        address: property.address ?? '',
        bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
        bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
        areaSqft: property.areaSqft != null ? String(property.areaSqft) : '',
        amenities: property.amenities ?? [],
        images: images.length ? images.map((url) => ({ url })) : [{ url: '' }],
        isAvailable: property.isAvailable ?? true,
        description: property.description ?? '',
    };
}
