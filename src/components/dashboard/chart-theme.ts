// Recharts reads plain color strings, so point them at the theme tokens —
// charts then follow light/dark mode automatically.
export const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export const chartAxisProps = {
    stroke: 'var(--muted-foreground)',
    fontSize: 12,
    tickLine: false,
    axisLine: false,
} as const;

export const chartGridProps = {
    stroke: 'var(--border)',
    strokeDasharray: '3 3',
    vertical: false,
} as const;

export const chartTooltipProps = {
    contentStyle: {
        background: 'var(--popover)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        color: 'var(--popover-foreground)',
        fontSize: 12,
    },
    labelStyle: { color: 'var(--muted-foreground)' },
    itemStyle: { color: 'var(--popover-foreground)' },
    cursor: { fill: 'var(--muted)', opacity: 0.5 },
} as const;
