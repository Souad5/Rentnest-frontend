interface DashboardPageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

/** Title row used at the top of every dashboard page. */
export function DashboardPageHeader({ title, description, action }: DashboardPageHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
        </div>
    );
}
