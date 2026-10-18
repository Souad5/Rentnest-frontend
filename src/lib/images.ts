// Hosts configured in next.config.ts `images.remotePatterns`. Any other host
// (e.g. an arbitrary URL a landlord pasted) is rendered unoptimized so
// next/image doesn't throw, without opening the optimizer to every domain.
const OPTIMIZABLE_HOSTS = new Set([
    'images.unsplash.com',
    'plus.unsplash.com',
    'res.cloudinary.com',
    'dam-assets.au.reastatic.net',
]);

export function canOptimizeImage(url: string): boolean {
    try {
        const { protocol, hostname } = new URL(url);
        return protocol === 'https:' && OPTIMIZABLE_HOSTS.has(hostname);
    } catch {
        return false;
    }
}

/** All images for a property, cover first, de-duplicated. */
export function propertyImages(p: { images?: string[] | null; imageUrl?: string | null }): string[] {
    const list = [...(p.images ?? []), ...(p.imageUrl ? [p.imageUrl] : [])].filter(Boolean);
    return Array.from(new Set(list));
}

export function coverImage(p: { images?: string[] | null; imageUrl?: string | null }): string | null {
    return propertyImages(p)[0] ?? null;
}
