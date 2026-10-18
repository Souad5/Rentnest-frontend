import type { Appearance } from '@stripe/stripe-js';

// Stripe Elements render inside an iframe and cannot read our CSS variables,
// so resolve the theme tokens to concrete rgb() strings at runtime. A canvas
// normalizes any CSS color syntax (including oklch) to sRGB bytes.
function resolveToken(token: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    if (!raw) return undefined;
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!ctx) return undefined;
    ctx.fillStyle = raw;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
}

/** Stripe Elements appearance that matches the current RentNest theme (light or dark). */
export function buildStripeAppearance(): Appearance {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const variables: NonNullable<Appearance['variables']> = { borderRadius: '12px', spacingUnit: '4px' };
    const primary = resolveToken('--primary');
    const background = resolveToken('--card');
    const text = resolveToken('--foreground');
    const danger = resolveToken('--destructive');
    if (primary) variables.colorPrimary = primary;
    if (background) variables.colorBackground = background;
    if (text) variables.colorText = text;
    if (danger) variables.colorDanger = danger;
    return { theme: isDark ? 'night' : 'stripe', variables };
}
