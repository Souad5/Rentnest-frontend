const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const currencyPrecise = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const formatPrice = (value: number) => currency.format(value || 0);
export const formatMoney = (value: number) => currencyPrecise.format(value || 0);
export const formatCompact = (value: number) => compact.format(value || 0);

export function formatDate(value: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', opts).format(d);
}

export function initials(name?: string | null) {
    if (!name) return 'RN';
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}
